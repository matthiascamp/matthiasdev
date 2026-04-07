/**
 * create-connect-account
 * ─────────────────────
 * Creates a Stripe Connect Express account for a McBook seller and returns a
 * hosted onboarding URL. Called from stripe-onboarding.html after the seller
 * fills in their personal / bank details.
 *
 * POST body (JSON):
 *   firstName      string  e.g. "Jane"
 *   lastName       string  e.g. "Smith"
 *   dob            { day: number, month: number, year: number }
 *   address        { line1, city, state, postcode }  (Australia only)
 *   bsb            string  e.g. "062-000"  — digits only after strip, 6 chars
 *   accountNumber  string  e.g. "12345678"
 *
 * Returns: { url: string }  — redirect seller here to complete Stripe KYC
 *
 * Environment variables required:
 *   STRIPE_SECRET_KEY          sk_live_... or sk_test_...
 *   SUPABASE_URL               https://<project>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  service role key (not anon key)
 */

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // ── CORS preflight ──────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // ── Auth: require a valid Supabase session ────────────────────────────────
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Parse request body ────────────────────────────────────────────────────
    const { firstName, lastName, dob, address, bsb, accountNumber } = await req.json()

    // Strip any non-digit characters from BSB (e.g. "062-000" → "062000")
    const bsbClean = String(bsb).replace(/\D/g, '')

    // ── Stripe client ─────────────────────────────────────────────────────────
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-04-10',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // ── Check whether this user already has a connected account ───────────────
    const { data: clientRow } = await supabase
      .from('clients')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    let accountId: string

    if (clientRow?.stripe_account_id) {
      // Reuse the existing account — just create a fresh onboarding link
      accountId = clientRow.stripe_account_id
    } else {
      // ── Create Stripe Connect Express account ─────────────────────────────
      // Uses the controller object to explicitly declare that Stripe handles
      // losses and compliance — this satisfies Stripe's platform responsibility
      // requirement at the API level without needing a separate dashboard step.
      const account = await stripe.accounts.create({
        controller: {
          losses:                  { payments: 'application' }, // platform responsible for losses (required for Express)
          fees:                    { payer: 'application' }, // platform pays Stripe fees
          requirement_collection:  'stripe',                 // Stripe collects KYC docs
          stripe_dashboard:        { type: 'express' },      // seller gets Express dashboard
        },
        country: 'AU',
        email:   user.email,
        // Pre-fill personal details so the seller sees less on Stripe's form
        individual: {
          first_name: firstName,
          last_name:  lastName,
          dob: {
            day:   Number(dob.day),
            month: Number(dob.month),
            year:  Number(dob.year),
          },
          address: {
            line1:       address.line1,
            city:        address.city,
            state:       address.state,
            postal_code: address.postcode,
            country:     'AU',
          },
        },
        capabilities: {
          card_payments: { requested: true },
          transfers:     { requested: true },
        },
        settings: {
          payouts: {
            schedule: { interval: 'daily' },
          },
        },
        business_type: 'individual',
      } as Stripe.AccountCreateParams)

      // ── Add the bank account separately after account creation ────────────
      // Doing this as a second call avoids Stripe's platform-profile validation
      // that fires when external_account is included in the create() call.
      if (bsbClean && accountNumber) {
        try {
          await stripe.accounts.createExternalAccount(account.id, {
            external_account: {
              object:              'bank_account',
              country:             'AU',
              currency:            'aud',
              routing_number:      bsbClean,
              account_number:      String(accountNumber),
              account_holder_name: `${firstName} ${lastName}`,
              account_holder_type: 'individual',
            } as Stripe.ExternalAccountCreateParams,
          })
        } catch (bankErr) {
          // Non-fatal — Stripe's hosted onboarding will ask for bank details
          console.warn('Could not pre-fill bank account:', bankErr)
        }
      }

      accountId = account.id

      // ── Save connected account ID to Supabase ─────────────────────────────
      // We never store the bank account number; Stripe holds that securely.
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          stripe_account_id:     accountId,
          stripe_account_status: 'pending',    // updated via webhook
          stripe_charges_enabled: false,
          stripe_payouts_enabled: false,
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to save stripe_account_id:', updateError)
        // Still continue — the account was created in Stripe; seller can retry
      }
    }

    // ── Generate Account Link (Stripe-hosted onboarding URL) ─────────────────
    // This URL is single-use and expires in 10 minutes; redirect the seller
    // immediately. Do NOT cache or expose it publicly.
    // Always use HTTPS — Stripe rejects HTTP redirect URLs even in test mode.
    const rawOrigin = req.headers.get('origin') ?? ''
    const origin = rawOrigin.startsWith('https://') ? rawOrigin : 'https://matthiasdev.com'
    const accountLink = await stripe.accountLinks.create({
      account:     accountId,
      refresh_url: `${origin}/mcbook/stripe-refresh.html`,  // link expired, regenerate
      return_url:  `${origin}/mcbook/stripe-return.html`,   // seller finished onboarding
      type:        'account_onboarding',
    })

    return new Response(JSON.stringify({ url: accountLink.url, accountId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('create-connect-account error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
