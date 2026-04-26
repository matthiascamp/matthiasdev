// =============================================================
//  Google Ads Campaign Creator
//
//  Called automatically by stripe-webhook after payment.
//  Can also be called manually to retry a failed campaign.
//
//  Requires these secrets set in Supabase (see supabase/.env.example):
//    GOOGLE_ADS_DEVELOPER_TOKEN
//    GOOGLE_ADS_CLIENT_ID
//    GOOGLE_ADS_CLIENT_SECRET
//    GOOGLE_ADS_REFRESH_TOKEN
//    GOOGLE_ADS_CUSTOMER_ID
//    GOOGLE_ADS_MANAGER_ACCOUNT_ID
//    ANTHROPIC_API_KEY
//    RESEND_API_KEY
//    RESEND_FROM_EMAIL
//
//  Until you have Google Ads credentials, the function logs a
//  warning and skips campaign creation — the order stays as
//  'pending' so you can retry later.
// =============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ── Google Ads helpers ─────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     Deno.env.get('GOOGLE_ADS_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')!,
      refresh_token: Deno.env.get('GOOGLE_ADS_REFRESH_TOKEN')!,
      grant_type:    'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('OAuth token refresh failed: ' + JSON.stringify(data))
  return data.access_token
}

function adsHeaders(accessToken: string) {
  return {
    'Authorization':    `Bearer ${accessToken}`,
    'developer-token':  Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')!,
    'login-customer-id': Deno.env.get('GOOGLE_ADS_MANAGER_ACCOUNT_ID')!,
    'Content-Type':     'application/json',
  }
}

const customerId = () => Deno.env.get('GOOGLE_ADS_CUSTOMER_ID')!
const adsBase    = () => `https://googleads.googleapis.com/v17/customers/${customerId()}`

// Extracts a numeric resource ID from a resource name string
// e.g. "customers/123/campaigns/456" → "456"
function extractId(resourceName: string): string {
  const parts = resourceName.split('/')
  return parts[parts.length - 1]
}

// ── Ad copy generation (Claude API) ───────────────────────────

async function generateAdCopy(siteUrl: string, keywords: string, location: string) {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!anthropicKey || anthropicKey.includes('REPLACE')) {
    // Fallback generic copy if Anthropic key not set
    return {
      headlines: [
        'Visit ' + new URL(siteUrl.startsWith('http') ? siteUrl : 'https://' + siteUrl).hostname,
        'Find What You Need',
        'Trusted & Reliable',
        'Contact Us Today',
        'Get a Free Quote',
        'Fast & Professional',
        'Serving ' + (location || 'Australia'),
        'Learn More Online',
        'Book Appointment Now',
        'Quality Guaranteed',
      ],
      descriptions: [
        'Looking for ' + keywords + '? Visit our website for more information and to get in touch.',
        'Professional services in ' + (location || 'Australia') + '. Contact us for a free quote today.',
      ],
    }
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role:    'user',
        content: `Generate Google Search Ads copy for a business.

Website: ${siteUrl}
Keywords they want to appear for: ${keywords}
Location: ${location}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "headlines": ["...", "...", ...],
  "descriptions": ["...", "...", ...]
}

Requirements:
- headlines: 10 strings, each max 30 characters, action-oriented and relevant to the keywords
- descriptions: 4 strings, each max 90 characters, professional and compelling
- Do not use exclamation marks in headlines (Google policy)
- Include the location in at least one headline
- Make copy specific to the keywords provided`,
      }],
    }),
  })

  const data = await res.json()
  const text = data.content?.[0]?.text || ''

  try {
    return JSON.parse(text)
  } catch {
    console.warn('Could not parse ad copy JSON, using fallback')
    return {
      headlines: [
        'Find ' + keywords.split(',')[0].trim(),
        'Local ' + keywords.split(',')[0].trim(),
        'Serving ' + location,
        'Contact Us Today',
        'Get a Free Quote',
        'Professional Service',
        'Book Online Now',
        'Fast Response Time',
        'Quality Guaranteed',
        'Visit Our Website',
      ],
      descriptions: [
        'Looking for ' + keywords + ' in ' + location + '? Get in touch for a free quote today.',
        'Trusted local service in ' + location + '. Book online or call us now.',
      ],
    }
  }
}

// ── Geo target lookup ──────────────────────────────────────────

async function getGeoTargetId(location: string, accessToken: string): Promise<string | null> {
  // Attempt to find a Google Ads geo target by name
  // Falls back to Australia-wide (2036) if not found
  try {
    const searchTerm = location.replace(/australia.wide/i, '').trim() || 'Australia'
    const res = await fetch(
      `https://googleads.googleapis.com/v17/geoTargetConstants:suggest?locale=en&countryCode=AU&searchTerm=${encodeURIComponent(searchTerm)}`,
      { headers: adsHeaders(accessToken) }
    )
    const data = await res.json()
    const first = data.geoTargetConstantSuggestions?.[0]?.geoTargetConstant
    return first ? extractId(first.resourceName) : '2036' // 2036 = Australia
  } catch {
    return '2036' // Australia-wide fallback
  }
}

// ── Main campaign creation ─────────────────────────────────────

async function createGoogleAdsCampaign(order: Record<string, unknown>) {
  const accessToken = await getAccessToken()
  const base        = adsBase()
  const headers     = adsHeaders(accessToken)

  const siteUrl   = order.site_url as string
  const keywords  = order.keywords as string
  const location  = order.location as string
  const budgetAUD = (order.ad_budget_cents as number) / 100
  const campaignName = `Exalt — ${siteUrl} — ${new Date().toISOString().slice(0, 10)}`

  // 1. Generate ad copy
  const adCopy = await generateAdCopy(siteUrl, keywords, location)
  console.log('Ad copy generated')

  // 2. Get geo target
  const geoTargetId = await getGeoTargetId(location, accessToken)
  console.log('Geo target:', geoTargetId)

  // 3. Create campaign budget
  // Google Ads uses "micros" — multiply AUD by 1,000,000
  const budgetRes = await fetch(`${base}/campaignBudgets:mutate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operations: [{
        create: {
          name:            `Budget for ${siteUrl}`,
          amountMicros:    String(Math.round(budgetAUD * 1_000_000)),
          deliveryMethod:  'STANDARD',
        },
      }],
    }),
  })
  const budgetData = await budgetRes.json()
  if (!budgetData.results?.[0]) throw new Error('Budget creation failed: ' + JSON.stringify(budgetData))
  const budgetResourceName = budgetData.results[0].resourceName
  console.log('Budget created:', budgetResourceName)

  // 4. Create campaign
  const today    = new Date()
  const end      = new Date(today)
  end.setDate(end.getDate() + 30)
  const toGoogleDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')

  const campaignRes = await fetch(`${base}/campaigns:mutate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operations: [{
        create: {
          name:                    campaignName,
          status:                  'ENABLED',
          advertisingChannelType:  'SEARCH',
          campaignBudget:          budgetResourceName,
          startDate:               toGoogleDate(today),
          endDate:                 toGoogleDate(end),
          networkSettings: {
            targetGoogleSearch:   true,
            targetSearchNetwork:  true,
            targetContentNetwork: false,
          },
          geoTargetTypeSetting: {
            positiveGeoTargetType: 'PRESENCE_OR_INTEREST',
          },
          // Maximise clicks within budget
          maximizeClicks: {},
        },
      }],
    }),
  })
  const campaignData = await campaignRes.json()
  if (!campaignData.results?.[0]) throw new Error('Campaign creation failed: ' + JSON.stringify(campaignData))
  const campaignResourceName = campaignData.results[0].resourceName
  const campaignId           = extractId(campaignResourceName)
  console.log('Campaign created:', campaignId)

  // 5. Add geo target to campaign
  await fetch(`${base}/campaignCriteria:mutate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operations: [{
        create: {
          campaign: campaignResourceName,
          location: {
            geoTargetConstant: `geoTargetConstants/${geoTargetId}`,
          },
        },
      }],
    }),
  })

  // 6. Create ad group
  const adGroupRes = await fetch(`${base}/adGroups:mutate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operations: [{
        create: {
          name:          `Ad Group — ${siteUrl}`,
          campaign:      campaignResourceName,
          status:        'ENABLED',
          type:          'SEARCH_STANDARD',
          cpcBidMicros:  '3000000', // A$3 default bid — Google will optimise from here
        },
      }],
    }),
  })
  const adGroupData = await adGroupRes.json()
  if (!adGroupData.results?.[0]) throw new Error('Ad group creation failed: ' + JSON.stringify(adGroupData))
  const adGroupResourceName = adGroupData.results[0].resourceName
  console.log('Ad group created')

  // 7. Add keywords (broad match)
  const keywordList = keywords.split(',').map(function(k: string) { return k.trim() }).filter(Boolean).slice(0, 20)
  if (keywordList.length > 0) {
    await fetch(`${base}/adGroupCriteria:mutate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        operations: keywordList.map(function(kw: string) {
          return {
            create: {
              adGroup:  adGroupResourceName,
              status:   'ENABLED',
              keyword: {
                text:      kw,
                matchType: 'BROAD',
              },
            },
          }
        }),
      }),
    })
    console.log('Keywords added:', keywordList.length)
  }

  // 8. Create responsive search ad
  const finalUrl = siteUrl.startsWith('http') ? siteUrl : 'https://' + siteUrl

  const headlineObjs = adCopy.headlines
    .slice(0, 15)
    .map(function(h: string) { return { text: h.slice(0, 30) } })

  const descObjs = adCopy.descriptions
    .slice(0, 4)
    .map(function(d: string) { return { text: d.slice(0, 90) } })

  const adRes = await fetch(`${base}/adGroupAds:mutate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operations: [{
        create: {
          adGroup: adGroupResourceName,
          status:  'ENABLED',
          ad: {
            finalUrls:          [finalUrl],
            responsiveSearchAd: {
              headlines:    headlineObjs,
              descriptions: descObjs,
            },
          },
        },
      }],
    }),
  })
  const adData = await adRes.json()
  if (!adData.results?.[0]) throw new Error('Ad creation failed: ' + JSON.stringify(adData))
  console.log('Responsive search ad created')

  return campaignId
}

// ── Entry point ────────────────────────────────────────────────

Deno.serve(async (req) => {
  const { orderId } = await req.json()
  if (!orderId) return new Response('Missing orderId', { status: 400 })

  // Fetch the order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return new Response('Order not found', { status: 404 })
  }

  // Check Google Ads credentials are set
  const devToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')
  if (!devToken || devToken.includes('REPLACE')) {
    console.warn('Google Ads credentials not configured yet. Order stays as pending.')
    // Order stays pending — you can re-trigger once credentials are set
    return new Response(JSON.stringify({ status: 'pending', reason: 'credentials_not_set' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const campaignId = await createGoogleAdsCampaign(order)

    // Update order to live
    await supabase
      .from('orders')
      .update({ status: 'live', google_campaign_id: campaignId })
      .eq('id', orderId)

    // Email customer that campaign is live
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
    if (order.customer_email && resendKey && !resendKey.includes('REPLACE')) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    fromEmail,
          to:      [order.customer_email],
          subject: 'Your Google Ads campaign is now live',
          html:    `<p>Great news — your Google Ads campaign for <strong>${order.site_url}</strong> is now live on Google.</p>
                    <p><strong>Campaign ID:</strong> ${campaignId}<br>
                    <strong>Keywords:</strong> ${order.keywords}<br>
                    <strong>Location:</strong> ${order.location}</p>
                    <p>You should start seeing traffic in your Google Analytics within a few hours.</p>
                    <p>Log in to your dashboard to track status: <a href="https://exaltdigital.github.io/dashboard.html">exaltdigital.github.io/dashboard.html</a></p>
                    <p>— Exalt Digital</p>`,
        }),
      }).catch(console.error)
    }

    console.log('Campaign live:', campaignId, 'for order:', orderId)
    return new Response(JSON.stringify({ status: 'live', campaignId }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Campaign creation failed:', err)

    // Mark order as pending (not failed) so it can be retried
    await supabase
      .from('orders')
      .update({ status: 'pending' })
      .eq('id', orderId)

    return new Response(JSON.stringify({ status: 'error', message: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
