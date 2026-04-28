# Cornerstone — Pro Plan ($499/mo) SEO Delivery Prompt

> Replace `{{CLIENT_URL}}` with the client's website URL and run in Claude Code.
> This plan includes everything in Growth plus the additions below.

---

```
You are performing a monthly SEO audit and implementation for a client website.

Client website: {{CLIENT_URL}}

This is the Pro plan — 16 hrs/month, 50 keywords targeted. Work through every section. Generate actual fixes, code, and copy — not just recommendations.

---

### 1. Full Growth Plan Audit & Optimisation

Run the complete Starter audit (7-point check, sitemap, robots.txt, schema, title/meta rewrites) AND the full Growth work (on-page optimisation for up to 13 pages, keyword cluster mapping for 20 keywords, internal link restructure, image alt text, Core Web Vitals, Google Business Profile).

(See the Growth plan prompt for full details.)

---

### 2. Unlimited Page Optimisation

Expand beyond the 13-page limit. Fetch EVERY indexable page on the site. For each page:

1. Audit title, meta, H1, canonical, schema, content quality.
2. Identify primary and secondary keywords.
3. Flag thin content, duplicate content, cannibalisation issues.
4. Generate fixes for every issue found.

Output a master page audit table covering the full site.

---

### 3. Expanded Keyword Targeting (50 Keywords)

1. Identify 50 target keywords (expand the 20 from Growth with 30 more long-tail and semantic variations).
2. Group into 8–12 topic clusters.
3. Map each to existing pages or flag content gaps.
4. Prioritise by search volume estimate (high / medium / low) and competition.

| Cluster | Keyword | Volume | Competition | Mapped Page | Gap? |
|---------|---------|--------|-------------|-------------|------|
|         |         |        |             |             |      |

---

### 4. Advanced Schema Implementation

Go beyond LocalBusiness. Implement all applicable schema types:

1. **FAQ schema** — for any page with Q&A content, generate FAQPage JSON-LD.
2. **Product schema** — for any product/service pages, generate Product JSON-LD.
3. **Review/AggregateRating schema** — if testimonials exist, generate Review JSON-LD.
4. **BreadcrumbList schema** — generate for the full site navigation hierarchy.

Output each as a ready-to-paste <script type="application/ld+json"> block, labelled by page.

---

### 5. Backlink Profile Audit

1. Note: full backlink data requires third-party tools (Ahrefs, Moz, etc.). If you can access the site's GSC link data, analyse it.
2. Check for obvious toxic backlink patterns (spammy domains, link farms).
3. If toxic links found, generate a Google Disavow file (disavow.txt) in the correct format.
4. List the site's top referring domains and assess quality.

Output:

| Referring Domain | Link Quality | Action |
|------------------|-------------|--------|
|                  |             |        |

---

### 6. Top-3 Competitor Gap Analysis

1. Identify the 3 most visible competitors in the same niche (based on the site's keywords and services).
2. For each competitor, check:
   - What keywords they rank for that the client doesn't
   - What content they have that the client lacks
   - Technical advantages (faster site, better schema, more backlinks)
3. Output a ranked action plan:

| Priority | Gap Found | Competitor | Recommended Action |
|----------|-----------|------------|-------------------|
| 1        |           |            |                   |
| 2        |           |            |                   |
| 3        |           |            |                   |

---

### 7. Page Speed Optimisation

Go deeper than Core Web Vitals:

1. **Lazy loading** — identify all below-fold images missing loading="lazy". Generate fixes.
2. **Image compression** — flag images over 200KB. Recommend formats (WebP/AVIF) and target sizes.
3. **Cache headers** — check HTTP cache headers. Recommend optimal Cache-Control values.
4. **Render-blocking resources** — identify CSS/JS blocking first paint. Recommend defer/async.
5. **Font loading** — check for FOUT/FOIT. Recommend font-display: swap if missing.

Output specific code fixes for each issue.

---

### 8. Content Brief (1 per month)

Based on the keyword gap analysis and cluster mapping, create 1 fully researched content brief for a new page the client should publish:

| Field | Details |
|-------|---------|
| Target keyword | |
| Search intent | (informational / transactional / navigational) |
| Suggested title | |
| Suggested URL slug | |
| Word count target | |
| H2 subheadings (5–8) | |
| Key points to cover | |
| Internal pages to link to | |
| Competitor pages to beat | |

---

### 9. 30-Day SEO Roadmap

Create a prioritised task list for the next 30 days:

| Week | Task | Priority | Est. Impact |
|------|------|----------|-------------|
| 1    |      |          |             |
| 2    |      |          |             |
| 3    |      |          |             |
| 4    |      |          |             |

---

### 10. Monthly Progress Report

Write a plain-English report (under 900 words) with:

**Subject:** SEO Progress Report — {{CLIENT_URL}} — [Month Year]

1. **What we checked** — full-site audit summary.
2. **What we found** — issues as Critical / Should Fix / Nice to Have.
3. **What we fixed** — all deliverables.
4. **Keyword progress** — 50 keywords tracked, movement noted.
5. **Competitor watch** — key changes from competitors.
6. **Content roadmap** — brief published/planned this month.
7. **What to do next** — client action items.
8. **30-day roadmap** — link to the roadmap above.

---

End of prompt.
```

## Deliverables

| File | Description |
|------|-------------|
| `sitemap.xml` | Full XML sitemap |
| `robots.txt` | Optimised robots.txt |
| `schema/` | Folder with all JSON-LD blocks (LocalBusiness, FAQ, Product, Breadcrumb) |
| `meta-tags.html` | Title + meta for all optimised pages |
| `keyword-map.md` | 50 keywords mapped to clusters and pages |
| `internal-links.md` | Internal link recommendations |
| `competitor-analysis.md` | Top-3 competitor gap analysis + action plan |
| `backlink-audit.md` | Backlink profile + disavow file if needed |
| `page-speed.md` | Speed fixes with code snippets |
| `content-brief.md` | Researched content brief for 1 new page |
| `roadmap.md` | 30-day prioritised SEO roadmap |
| `report.md` | Plain-English monthly report |
