import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const { amount, siteUrl, keywords, location, userId } = await req.json()

  const descParts = [
    `One-time Google Ads campaign for ${siteUrl}`,
    keywords ? `Keywords: ${keywords}` : null,
    location ? `Location: ${location}` : null,
    `Ad budget: A$${Math.round(amount * 0.75)} (75% goes directly to Google Ads)`,
  ].filter(Boolean)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'aud',
        product_data: {
          name:        'Exalt Digital — Google Ads Campaign',
          description: descParts.join(' · '),
        },
        unit_amount: Math.max(1000, Math.round(amount * 100)), // minimum A$10
      },
      quantity: 1,
    }],
    payment_intent_data: {
      statement_descriptor: 'EXALT DIGITAL ADS',
    },
    mode: 'payment',
    // userId passed as client_reference_id so stripe-webhook can link to the user account
    client_reference_id: userId || null,
    success_url: 'https://exaltdigital.github.io/?boost=success&site=' + encodeURIComponent(siteUrl),
    cancel_url:  'https://exaltdigital.github.io/',
    metadata: {
      type:       'google_ads_campaign',
      site_url:   siteUrl,
      keywords:   keywords  || '',
      location:   location  || '',
      ad_budget:  String(Math.round(amount * 0.75)),
      user_id:    userId    || '',
    },
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
