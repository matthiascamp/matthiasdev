// =============================================================
//  Stripe Webhook Handler
//
//  Fires when a customer completes payment. Creates an order
//  in the database and triggers campaign setup.
//
//  Register this URL in your Stripe dashboard:
//  dashboard.stripe.com/webhooks → Add endpoint
//  URL: https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
//  Events: checkout.session.completed
// =============================================================

import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Service role client — bypasses RLS so we can write orders
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const sig  = req.headers.get('stripe-signature')
  const body = await req.text()

  // Verify the webhook is genuinely from Stripe
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response('Ignored', { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // ── Extract order details from session metadata ────────────
  const meta         = session.metadata || {}
  const type         = meta.type === 'google_ads_campaign' ? 'google_ads' : 'seo_plan'
  const siteUrl      = meta.site_url || ''
  const keywords     = meta.keywords || ''
  const location     = meta.location || ''
  const adBudgetAUD  = parseInt(meta.ad_budget || '0', 10)
  const planTier     = meta.plan_tier || null

  // user_id is passed as client_reference_id for monthly plans,
  // or directly in metadata for one-time boosts
  const userId = session.client_reference_id || meta.user_id || null

  const customerEmail = session.customer_details?.email || null
  const amountCents   = session.amount_total || 0

  // ── Create order in database ───────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id:               userId,
      type,
      status:                'pending',
      site_url:              siteUrl,
      amount_cents:          amountCents,
      customer_email:        customerEmail,
      stripe_session_id:     session.id,
      stripe_subscription_id: session.subscription as string | null,
      keywords:              keywords || null,
      location:              location || null,
      ad_budget_cents:       type === 'google_ads' ? adBudgetAUD * 100 : null,
      plan_tier:             planTier,
    })
    .select()
    .single()

  if (orderError) {
    console.error('Failed to create order:', orderError)
    return new Response('DB error', { status: 500 })
  }

  console.log('Order created:', order.id)

  // ── Trigger campaign creation for Google Ads orders ────────
  if (type === 'google_ads') {
    const campaignUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/create-campaign'
    fetch(campaignUrl, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      },
      body: JSON.stringify({ orderId: order.id }),
    }).catch(function(err) {
      console.error('Failed to trigger campaign creation:', err)
    })
    // Fire-and-forget — the webhook returns 200 immediately
    // Campaign creation runs asynchronously
  }

  // ── Send confirmation email to customer ────────────────────
  if (customerEmail) {
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')

    if (resendKey && fromEmail && !resendKey.includes('REPLACE')) {
      const subject = type === 'google_ads'
        ? 'Your Google Ads campaign is being set up'
        : 'Your SEO plan has started'

      const bodyHTML = type === 'google_ads'
        ? `<p>Hi,</p>
           <p>We've received your payment of A$${(amountCents / 100).toFixed(0)} for a Google Ads campaign for <strong>${siteUrl}</strong>.</p>
           <p><strong>Keywords:</strong> ${keywords}<br>
           <strong>Location:</strong> ${location}<br>
           <strong>Ad budget:</strong> A$${adBudgetAUD} goes directly to Google Ads</p>
           <p>Your campaign will be live within 24 hours. Traffic will start appearing in your Google Analytics once it's running.</p>
           <p>We'll email you again once the campaign is live with a link to your dashboard.</p>
           <p>— Exalt Digital</p>`
        : `<p>Hi,</p>
           <p>Your ${planTier} SEO plan for <strong>${siteUrl}</strong> has started.</p>
           <p>We'll be in touch within 24 hours with a short questionnaire to learn about your business before we start writing content.</p>
           <p>— Exalt Digital</p>`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    fromEmail,
          to:      [customerEmail],
          subject: subject,
          html:    bodyHTML,
        }),
      }).catch(function(err) {
        console.error('Failed to send customer email:', err)
      })
    }
  }

  // ── Notify admin ───────────────────────────────────────────
  const adminEmail = Deno.env.get('ADMIN_EMAIL')
  const resendKey  = Deno.env.get('RESEND_API_KEY')
  const fromEmail  = Deno.env.get('RESEND_FROM_EMAIL')

  if (adminEmail && resendKey && fromEmail && !resendKey.includes('REPLACE')) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    fromEmail,
        to:      [adminEmail],
        subject: `New order — ${type === 'google_ads' ? 'Google Ads' : 'SEO Plan'} for ${siteUrl}`,
        html:    `<p><strong>Order ID:</strong> ${order.id}<br>
                  <strong>Type:</strong> ${type}<br>
                  <strong>Site:</strong> ${siteUrl}<br>
                  <strong>Amount:</strong> A$${(amountCents / 100).toFixed(0)}<br>
                  ${keywords ? '<strong>Keywords:</strong> ' + keywords + '<br>' : ''}
                  ${location ? '<strong>Location:</strong> ' + location + '<br>' : ''}
                  <strong>Customer:</strong> ${customerEmail || 'unknown'}</p>`,
      }),
    }).catch(function(err) {
      console.error('Failed to send admin email:', err)
    })
  }

  return new Response('OK', { status: 200 })
})
