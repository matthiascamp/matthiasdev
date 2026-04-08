# MCBook — Project Context for Claude Code

## What this project is
MCBook is a SaaS booking platform built by Matthias Development. Business owners (clients) sign up, configure their services and availability, and embed a booking widget on their own websites. The platform is hosted on GitHub at `matthiascamp/matthiasdev` and served from `matthiasdev.com/mcbook/`.

Backend: Supabase (Postgres DB + Auth + Edge Functions)
Payments: Stripe Connect (each client has their own connected Stripe account)
Frontend: Vanilla JS + HTML, no build step

---

## Booking Widget — architecture you MUST understand before styling

The widget lives in `mcbook/widget.js`. It is a self-contained drop-in script:
```html
<script src="widget.js" data-business-id="CLIENT_UUID"></script>
```

### Shadow DOM
The widget mounts inside a **Shadow DOM** (`mode: 'open'`). This means:
- All widget CSS is completely isolated from the host page — host page styles cannot bleed in, and widget styles cannot bleed out.
- All styling is built dynamically via the `buildCSS(theme)` function and injected into a `<style>` element inside the shadow root.
- To change widget appearance you must edit `buildCSS()` in `widget.js`, NOT add external CSS.

### Theme system
On load, the widget checks whether `widget_custom_styling` is enabled for the client (fetched from `clients` table). 

- **Custom styling OFF (default):** Uses MCBook dark palette — near-black background, white text, green accent (`#4ade80`).
- **Custom styling ON:** Calls `detectHostStyles()` which reads the host page's `background-color`, `color`, and scans buttons for an accent colour. The result is passed into `buildCSS(theme)`.

`buildCSS(theme)` checks `isDark(theme.bg)` and picks one of two fully-specified palette objects (`t`):
- **Dark palette:** `bg:#0a0a0f`, `surface:#111118`, `accent:#4ade80`, `text:#ffffff`
- **Light palette:** `bg:#ffffff`, `surface:#f4f7f4`, `accent:#16a34a`, `text:#0a0a0f`

The palette object `t` is what actually drives all CSS custom values — not the raw `theme` object. So to change widget colours, modify the palette objects inside `buildCSS`.

### Stripe Elements — special case
Stripe card inputs (`cardNumber`, `cardExpiry`, `cardCvc`) **cannot mount inside a Shadow DOM**. They mount in the host page's light DOM via named `<slot>` elements projected into the shadow. Style them via the `stripeStyle` object passed to `elements.create()` — not via CSS. The colour is set based on `isDark(widget.theme.bg)`.

### CSS class naming
All widget classes are prefixed `bw-` (booking widget) to avoid collisions. Key classes:
- `.bw-wrap` — outer container
- `.bw-header` / `.bw-body` / `.bw-footer` — layout regions
- `.bw-service-card` — service selection cards
- `.bw-cal-*` — calendar
- `.bw-time-slot` — time picker slots
- `.bw-field` / `.bw-stripe-box` — form inputs
- `.bw-btn` / `.bw-btn-primary` / `.bw-btn-secondary` — buttons
- `.bw-footer` — always shows "Powered by McBook" — keep this

---

## When applying custom styling to a widget

The goal is to make the widget blend into the client's existing website without looking like a foreign embed. The "Powered by McBook" footer must always remain visible.

**The correct workflow:**
1. Edit the palette object(s) inside `buildCSS()` in `mcbook/widget.js`
2. For dark host sites: edit the `dark ? { ... }` branch
3. For light host sites: edit the `: { ... }` branch
4. For Stripe input colours: edit `stripeStyle` in `mountStripeElements()`
5. The `widget_custom_styling` flag on the client record in Supabase controls whether custom styling applies at all — toggle it via the admin dashboard (`admin.html` → client row → Details → Widget Settings)

**Do NOT:**
- Add `<link>` or `<style>` tags outside the shadow root expecting them to affect the widget
- Try to override widget styles from the host page's CSS (Shadow DOM blocks this)
- Remove or hide the `.bw-footer` "Powered by McBook" branding

---

## Key files

| File | Purpose |
|------|---------|
| `mcbook/widget.js` | The entire booking widget — Shadow DOM, theme, all steps |
| `mcbook/embed.html` | Client-facing "Share & Embed" page where they get their embed code |
| `mcbook/book.html` | Standalone booking page (non-embed version) |
| `mcbook/admin.html` | Matthias's admin dashboard — manage all clients |
| `mcbook/admin-login.html` | Admin login (restricted to `matthiasdevelopment@gmail.com`) |
| `mcbook/js/supabase.js` | Shared Supabase client (anon key, project URL) |
| `supabase/functions/admin-stats/` | Edge Function — returns all client stats |
| `supabase/functions/admin-update-client/` | Edge Function — updates client settings incl. `widget_custom_styling` |
| `supabase/functions/create-payment-intent/` | Edge Function — Stripe upfront payment |
| `supabase/functions/create-setup-intent/` | Edge Function — Stripe card save (noshow/after modes) |

## Edge Functions — deployment notes
All Edge Functions must be deployed with `--no-verify-jwt`:
```bash
supabase functions deploy <function-name> --no-verify-jwt
```
Functions use `npm:@supabase/supabase-js@2` (not `esm.sh`) for Deno v2 compatibility.
Auto-injected env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.

## Database — relevant tables
- `clients` — one row per business owner. Key cols: `id`, `business_name`, `email`, `platform_fee_percent`, `widget_custom_styling` (bool), `stripe_account_id`, `stripe_charges_enabled`
- `services` — per client. Cols: `name`, `price`, `noshow_fee`, `duration_mins`, `payment_mode` (`free` | `noshow_only` | `after` | `upfront`), `active`
- `bookings` — col: `status` (`scheduled` | `confirmed` | `cancelled` | `completed` | `no_show` | `pending_payment`), `payment_status`
- `customers` — per client, identified by email
- `availability_rules` — day_of_week + start/end times per client
- `payments` — tracks Stripe charges, linked to booking and client
