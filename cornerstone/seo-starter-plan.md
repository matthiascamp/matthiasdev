# Cornerstone — Starter Plan ($99/mo) SEO Delivery Checklist

> Claude Code prompt for delivering the monthly Starter SEO plan.
> Copy everything below the line, replace `{{CLIENT_URL}}` with the client's website URL, and run it in Claude Code.

---

## Prompt

```
You are performing a monthly SEO audit and implementation for a client website.

Client website: {{CLIENT_URL}}

Work through each section below in order. For every issue found, generate the fix (code, file content, or specific copy) — not just a recommendation. At the end, compile a plain-English summary report the client can read.

---

### 1. Technical Audit (7-Point Check)

Fetch the client website and check all of the following. For each point, report PASS or FAIL with a one-line explanation.

1. **Title tags** — Every page should have a unique <title> under 60 characters that includes the primary keyword.
2. **Meta descriptions** — Every page should have a unique meta description, 120-155 characters, with a call to action.
3. **H1 tags** — Every page should have exactly one <h1>. It should differ from the <title> but target the same keyword.
4. **Canonical tags** — Every page should have a <link rel="canonical"> pointing to its own URL (or the preferred version).
5. **XML sitemap** — Check for /sitemap.xml. It should exist, be valid XML, list all indexable pages, and exclude non-indexable ones.
6. **robots.txt** — Check for /robots.txt. It should exist, not block important pages, and reference the sitemap URL.
7. **Schema markup** — Check for structured data (JSON-LD preferred). At minimum, LocalBusiness schema should be present on the homepage.

Output a table summarising the results:

| Check            | Status | Notes |
|------------------|--------|-------|
| Title tags       |        |       |
| Meta descriptions|        |       |
| H1 tags          |        |       |
| Canonicals       |        |       |
| XML sitemap      |        |       |
| robots.txt       |        |       |
| Schema markup    |        |       |

---

### 2. Google Search Console Setup

Provide step-by-step instructions for the client (or their developer) to:

1. Add the property in Google Search Console (use the URL-prefix method for simplicity).
2. Verify ownership via HTML meta tag — generate the exact tag they need to paste into their <head>.
3. Confirm verification.

If the site already has GSC set up, note that and skip.

---

### 3. XML Sitemap Generation & Submission

If /sitemap.xml is missing or broken:

1. Crawl the site and list all indexable pages.
2. Generate a complete, valid XML sitemap file.
3. Provide the submission URL: https://search.google.com/search-console/sitemaps?resource_id={{CLIENT_URL}}
4. Remind the client to submit the sitemap in GSC.

If the sitemap exists and is valid, confirm it and note the page count.

---

### 4. robots.txt Creation or Repair

If /robots.txt is missing or misconfigured:

1. Generate a correct robots.txt file with these rules:
   - Allow all important pages
   - Disallow /admin, /api, /tmp, and any other non-public paths found during the audit
   - Include a Sitemap directive pointing to the full sitemap URL
2. Output the complete file content ready to deploy.

If robots.txt is fine, confirm and move on.

---

### 5. Title Tag & Meta Description Rewrite (Up to 5 Pages)

Identify the 5 most important pages (homepage + up to 4 key landing/service pages).

For each page, output:

| Page | Current Title | New Title | Current Meta | New Meta |
|------|--------------|-----------|-------------|----------|
|      |              |           |             |          |

Rules for rewrites:
- Titles: under 60 chars, primary keyword near the front, brand name at the end separated by " | ".
- Meta descriptions: 120-155 chars, include primary keyword, end with a call to action.
- Write for humans first, search engines second.

Also output the HTML snippets ready to paste:
```html
<!-- Page: [page name] -->
<title>New title here</title>
<meta name="description" content="New description here">
```

---

### 6. LocalBusiness Schema Markup

Generate a complete JSON-LD LocalBusiness schema block for the homepage.

Populate it with real data scraped from the website (business name, address, phone, hours, etc.). If any data is missing from the site, leave a placeholder marked with `TODO:` so the client can fill it in.

The output should be a ready-to-paste <script type="application/ld+json"> block.

At minimum include these properties:
- @type (LocalBusiness or a more specific subtype if obvious)
- name
- address (PostalAddress)
- telephone
- openingHoursSpecification
- url
- image (logo URL if found)

---

### 7. Monthly Progress Report

Compile a plain-English report with these sections. No jargon — the client should understand every word.

**Subject line:** SEO Progress Report — {{CLIENT_URL}} — [Month Year]

**Sections:**

1. **What we checked** — Brief summary of the audit.
2. **What we found** — List each issue, categorised as Critical / Should Fix / Nice to Have.
3. **What we fixed** — List everything delivered this month (files, copy, schema, etc.).
4. **What to do next** — Action items for the client (things only they can do, like verifying GSC or updating their CMS).
5. **Next month's focus** — One or two things to tackle in the next cycle.

Keep the entire report under 500 words. Use short sentences and bullet points.

---

End of prompt.
```

## Monthly Reuse

Each month, re-run this prompt with the same `{{CLIENT_URL}}`. Claude Code will re-crawl, re-audit, and generate an updated report. Compare against the previous month's report to track progress.

### Month-over-month tracking checklist

- [ ] All previous FAIL items now PASS
- [ ] No new issues introduced
- [ ] Sitemap reflects any new/removed pages
- [ ] Schema still validates (test at https://validator.schema.org/)
- [ ] GSC shows no new crawl errors
- [ ] Client action items from last month completed

## Files Delivered to Client

Each month you should deliver:

| File | Description |
|------|-------------|
| `sitemap.xml` | Generated or confirmed XML sitemap |
| `robots.txt` | Generated or confirmed robots.txt |
| `schema.json` | LocalBusiness JSON-LD block |
| `meta-tags.html` | Title and meta description snippets for up to 5 pages |
| `report.md` | Plain-English monthly progress report |
