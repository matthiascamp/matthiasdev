/**
 * RankRocket Tracker — embed.js
 *
 * Paste the two config lines then include this script on any page:
 *
 *   <script>
 *     window.RR = {
 *       url:    'https://gczopudgxfciatvtxhll.supabase.co',
 *       key:    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjem9wdWRneGZjaWF0dnR4aGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NzgwMzgsImV4cCI6MjA5MTU1NDAzOH0.Qc4hAZ0AqFAgNcPcRkNk2SUvs4uR2hwk9m2JeZ7lIV0',
 *       siteId: 'exaltdigital.com.au'
 *     };
 *   </script>
 *   <script src="/tracker/embed.js" defer></script>
 */
(function () {
  'use strict';

  var cfg = window.RR || {};
  var SUPABASE_URL = (cfg.url || '').replace(/\/$/, '');
  var SUPABASE_KEY = cfg.key || '';
  var SITE_ID      = cfg.siteId || location.hostname;

  // Skip if not configured or if it's a bot
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  if (/bot|crawl|spider|slurp|mediapartners/i.test(navigator.userAgent)) return;

  // ── Session ID ────────────────────────────────────────────────
  function getSessionId() {
    var key = '_rr_sid';
    var sid;
    try {
      sid = sessionStorage.getItem(key);
      if (!sid) {
        sid = Math.random().toString(36).slice(2) +
              Math.random().toString(36).slice(2);
        sessionStorage.setItem(key, sid);
      }
    } catch (e) {
      sid = Math.random().toString(36).slice(2) +
            Math.random().toString(36).slice(2);
    }
    return sid;
  }

  // ── UA Parsing ────────────────────────────────────────────────
  function parseUA(ua) {
    var browser = 'Other';
    if      (/Edg\//.test(ua))              browser = 'Edge';
    else if (/OPR\/|Opera/.test(ua))        browser = 'Opera';
    else if (/Chrome\//.test(ua))           browser = 'Chrome';
    else if (/Firefox\//.test(ua))          browser = 'Firefox';
    else if (/Safari\//.test(ua))           browser = 'Safari';
    else if (/MSIE|Trident/.test(ua))       browser = 'IE';

    var os = 'Other';
    if      (/Windows NT/.test(ua))         os = 'Windows';
    else if (/iPhone|iPad/.test(ua))        os = 'iOS';
    else if (/Android/.test(ua))            os = 'Android';
    else if (/Mac OS X/.test(ua))           os = 'macOS';
    else if (/Linux/.test(ua))              os = 'Linux';

    var device = 'desktop';
    if      (/tablet|ipad/i.test(ua))       device = 'tablet';
    else if (/mobile|iphone|android/i.test(ua)) device = 'mobile';

    return { browser: browser, os: os, device: device };
  }

  // ── Send ──────────────────────────────────────────────────────
  function send(payload) {
    try {
      fetch(SUPABASE_URL + '/rest/v1/page_views', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Prefer':        'return=minimal'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) { /* silent fail — never break the host page */ }
  }

  // ── Track ─────────────────────────────────────────────────────
  function track() {
    var ua     = navigator.userAgent;
    var parsed = parseUA(ua);

    send({
      site_id:     SITE_ID,
      url:         location.href,
      path:        location.pathname,
      title:       document.title,
      referrer:    document.referrer || '',
      browser:     parsed.browser,
      os:          parsed.os,
      device_type: parsed.device,
      screen_size: screen.width + 'x' + screen.height,
      language:    navigator.language || '',
      session_id:  getSessionId()
    });
  }

  // Fire on load
  track();

  // ── SPA support (history.pushState navigation) ────────────────
  var _push = history.pushState;
  history.pushState = function () {
    _push.apply(history, arguments);
    setTimeout(track, 50); // wait a tick for document.title to update
  };

  window.addEventListener('popstate', function () {
    setTimeout(track, 50);
  });

})();
