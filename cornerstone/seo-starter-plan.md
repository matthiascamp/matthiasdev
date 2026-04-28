# Cornerstone — Starter Plan ($129/mo) SEO Delivery Prompt

> Replace `{{CLIENT_URL}}` with the client's website URL and run in Claude Code.

---

```
You are performing a monthly SEO audit and implementation for a client website.

Client website: {{CLIENT_URL}}

This is the Starter plan — 4 hrs/month, 5 pages pushed to rank. Work through each section below. For every issue found, generate the actual fix (code, file content, copy) — not just a recommendation. Output everything the client needs to deploy.

---

### 1. Technical Audit (7-Point Check)

Fetch the homepage and up to 5 key pages. For each check, report PASS or FAIL with a one-line explanation.

1. **Title tags** — unique <title> per page, under 60 chars, includes primary keyword.
2. **Meta descriptions** — unique per page, 120–155 chars, includes a call to action.
3. **H1 tags** — exactly one <h1> per page, differs from <title> but targets same keyword.
4. **Canonical tags** — <link rel="canonical"> on every page pointing to its own URL.
5. **XML sitemap** — /sitemap.xml exists, valid XML, lists all indexable pages.
6. **robots.txt** — /robots.txt exists, doesn't block important pages, references sitemap.
7. **Schema markup** — JSON-LD structured data present. At minimum LocalBusiness on homepage.

Output results as a table:

| Check             | Status | Notes |
|-------------------|--------|-------|
| Title tags        |        |       |
| Meta descriptions |        |       |
| H1 tags           |        |       |
| Canonicals        |        |       |
| XML sitemap       |        |       |
| robots.txt        |        |       |
| Schema markup     |        |       |

---

### 2. Google Search Console Setup

If not already set up:
1. Provide step-by-step GSC setup instructions (URL-prefix method).
2. Generate the exact HTML meta verification tag for their <head>.

If already set up, confirm and skip.

---

### 3. XML Sitemap

If /sitemap.xml is missing or broken:
1. Crawl the site, list all indexable pages.
2. Generate a complete valid XML sitemap file.
3. Provide the GSC submission URL.

If valid, confirm and note page count.

---

### 4. robots.txt

If missing or misconfigured:
1. Generate a correct robots.txt — allow public pages, disallow /admin /api /tmp, include Sitemap directive.
2. Output the complete file.

If fine, confirm.

---

### 5. Title Tag & Meta Description Rewrite (Up to 5 Pages)

Identify the 5 most important pages. For each:

| Page | Current Title | New Title | Current Meta | New Meta |
|------|---------------|-----------|--------------|----------|
|      |               |           |              |          |

Rules:
- Titles: under 60 chars, primary keyword near front, brand at end with " | ".
- Metas: 120–155 chars, primary keyword, ends with call to action.

Output ready-to-paste HTML for each page:
<!-- Page: [name] -->
<title>...</title>
<meta name="description" content="...">

---

### 6. LocalBusiness Schema Markup

Generate a complete JSON-LD LocalBusiness block for the homepage. Scrape real data from the site (name, address, phone, hours). Mark missing data with TODO:.

Include: @type, name, address (PostalAddress), telephone, openingHoursSpecification, url, image.

Output a ready-to-paste <script type="application/ld+json"> block.

---

### 7. Monthly Progress Report

Write a plain-English report (under 500 words, no jargon) with:

**Subject:** SEO Progress Report — {{CLIENT_URL}} — [Month Year]

1. **What we checked** — brief audit summary.
2. **What we found** — issues listed as Critical / Should Fix / Nice to Have.
3. **What we fixed** — everything delivered this month.
4. **What to do next** — action items only the client can do.
5. **Next month's focus** — 1–2 priorities for next cycle.

---

End of prompt.
```

## Deliverables

| File | Description |
|------|-------------|
| `sitemap.xml` | Generated or confirmed XML sitemap |
| `robots.txt` | Generated or confirmed robots.txt |
| `schema.json` | LocalBusiness JSON-LD block |
| `meta-tags.html` | Title + meta snippets for up to 5 pages |
| `report.md` | Plain-English monthly progress report |
