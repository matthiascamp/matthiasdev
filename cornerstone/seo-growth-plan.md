# Cornerstone — Growth Plan ($199/mo) SEO Delivery Prompt

> Replace `{{CLIENT_URL}}` with the client's website URL and run in Claude Code.
> This plan includes everything in Starter plus the additions below.

---

```
You are performing a monthly SEO audit and implementation for a client website.

Client website: {{CLIENT_URL}}

This is the Growth plan — 8 hrs/month, 20 keywords targeted. Work through every section. Generate actual fixes, code, and copy — not just recommendations.

---

### 1. Full Starter Plan Audit

Run the complete 7-point technical audit (title tags, meta descriptions, H1s, canonicals, sitemap, robots.txt, schema). Output the results table. Fix anything that fails. Generate GSC setup instructions if needed. Generate/verify sitemap and robots.txt. Rewrite titles and metas for up to 5 key pages. Generate LocalBusiness schema if missing.

(See the Starter plan prompt for full details on each check.)

---

### 2. On-Page Optimisation (Up to 13 Pages)

Fetch up to 13 pages from the site. For each page:

1. Check the title tag, meta description, H1, and first 200 words of body content.
2. Identify the primary keyword the page should target.
3. Check keyword density in title, H1, first paragraph, and URL slug.
4. Check for missing or duplicate content issues across pages.
5. Flag thin content (under 300 words on important pages).

Output a table:

| Page | Primary Keyword | Title Optimised? | H1 Optimised? | Content Issues | Recommended Changes |
|------|----------------|------------------|---------------|----------------|---------------------|
|      |                |                  |               |                |                     |

Generate the actual HTML fixes for every page that needs changes.

---

### 3. Keyword Cluster Mapping

1. Based on the site's content and niche, identify 20 target keywords.
2. Group them into 3–5 topic clusters.
3. Map each cluster to existing pages (or flag gaps where a new page is needed).

Output:

| Cluster | Keywords | Mapped Page | Gap? |
|---------|----------|-------------|------|
|         |          |             |      |

---

### 4. Internal Link Restructure

1. Crawl all pages and map the current internal link structure.
2. Identify orphan pages (no internal links pointing to them).
3. Identify pages with too few internal links.
4. Recommend specific internal links to add — output as:

| From Page | Anchor Text | To Page | Reason |
|-----------|-------------|---------|--------|
|           |             |         |        |

---

### 5. Image Alt Text Optimisation

1. Crawl all images across the site.
2. Flag images with missing, empty, or generic alt text.
3. Generate keyword-relevant alt text for each.

Output:

| Page | Image Src | Current Alt | New Alt |
|------|-----------|-------------|---------|
|      |           |             |         |

---

### 6. Core Web Vitals Check

Fetch the site and assess:
1. **LCP (Largest Contentful Paint)** — should be under 2.5s. Flag large unoptimised images, render-blocking resources, slow server response.
2. **CLS (Cumulative Layout Shift)** — should be under 0.1. Flag images/embeds without width/height, late-loading fonts, injected content.
3. **FID / INP (Interaction to Next Paint)** — flag heavy JavaScript, long tasks, blocking scripts.

For each issue found, provide the specific fix (code change, image compression recommendation, script defer attribute, etc.).

---

### 7. Google Business Profile

Check if the client has a Google Business Profile. If not, provide step-by-step setup instructions including:
- Business name, category, address, phone, hours, website URL
- Photo recommendations
- Review strategy (how to ask for reviews)

If already set up, audit it for completeness and suggest improvements.

---

### 8. Monthly Progress Report

Write a plain-English report (under 700 words) with:

**Subject:** SEO Progress Report — {{CLIENT_URL}} — [Month Year]

1. **What we checked** — audit summary + pages optimised.
2. **What we found** — issues as Critical / Should Fix / Nice to Have.
3. **What we fixed** — all deliverables this month.
4. **Keyword progress** — the 20 keywords being targeted and any movement.
5. **What to do next** — client action items.
6. **Next month's focus** — priorities for next cycle.

---

End of prompt.
```

## Deliverables

| File | Description |
|------|-------------|
| `sitemap.xml` | Generated or confirmed XML sitemap |
| `robots.txt` | Generated or confirmed robots.txt |
| `schema.json` | LocalBusiness JSON-LD block |
| `meta-tags.html` | Title + meta snippets for optimised pages |
| `keyword-map.md` | 20 keywords mapped to clusters and pages |
| `internal-links.md` | Recommended internal link additions |
| `alt-text.md` | Image alt text rewrites |
| `cwv-fixes.md` | Core Web Vitals issues and fixes |
| `report.md` | Plain-English monthly progress report |
