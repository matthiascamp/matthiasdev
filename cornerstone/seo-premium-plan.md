# Cornerstone — Premium Plan ($1,599/mo) SEO Delivery Prompt

> Replace `{{CLIENT_URL}}` with the client's website URL and run in Claude Code.
> This plan includes everything in Authority plus the additions below.

---

```
You are performing a monthly SEO audit and implementation for a client website.

Client website: {{CLIENT_URL}}

This is the Premium plan — 45 hrs/month, 200+ keywords targeted. Total search dominance. Work through every section. Generate actual fixes, code, content, and copy.

---

### 1. Full Authority Plan Work

Run all Starter, Growth, Pro, and Authority work:
- 7-point technical audit + full-site page optimisation
- 100 keyword cluster mapping (expand to 200+ below)
- Advanced schema (all types)
- Backlink audit + disavow
- Competitor gap analysis + monthly intelligence
- Page speed optimisation
- Local SEO dominance (citations, NAP, map pack)
- 13-point monthly ranking audit
- Topical authority content strategy
- CRO for top pages
- Hreflang if applicable

(See Authority plan prompt for full details.)

---

### 2. Expanded Keyword Targeting (200+ Keywords)

Expand to 200+ keywords:
1. Include the 100 from Authority.
2. Add 100+ more: every relevant long-tail variation, question keywords, "near me" variants, comparison keywords ("[client] vs [competitor]"), seasonal keywords, and voice search phrases.
3. Group into 25–30+ topic clusters.
4. Map every keyword to a page or content gap.
5. Prioritise by commercial intent, volume, and difficulty.

Output the full keyword map. Flag the top 20 highest-opportunity keywords.

---

### 3. Content Briefs (3 per month)

Create 3 fully researched content briefs for new pages:

For each brief:

| Field | Details |
|-------|---------|
| Target keyword | |
| Secondary keywords (3–5) | |
| Search intent | |
| Suggested title | |
| Suggested URL slug | |
| Word count target | |
| H2 subheadings (5–10) | |
| Key points to cover | |
| Questions to answer (from "People Also Ask") | |
| Internal pages to link to | |
| External sources to reference | |
| Competitor pages to outrank (top 3 URLs) | |

Prioritise briefs by keyword opportunity and content gaps identified in the Authority work.

---

### 4. SEO Articles (2 Written & Published)

Write 2 complete, publish-ready SEO articles based on the top 2 content briefs:

For each article:
1. Write the full article — minimum 1,500 words, naturally incorporating the target keyword and 3–5 secondary keywords.
2. Write in a clear, authoritative tone appropriate to the client's brand and audience.
3. Include an engaging intro, scannable subheadings (H2/H3), bullet points where appropriate, and a clear conclusion with CTA.
4. Generate the complete HTML with semantic markup (<article>, <h2>, <h3>, <p>, <ul>, etc.).
5. Include the optimised <title>, meta description, and canonical tag.
6. Include internal links to at least 3 existing pages on the client's site.
7. Generate FAQ schema (FAQPage JSON-LD) if the article answers common questions.

Output each article as:
- Complete HTML file ready to upload
- Separate JSON-LD schema block
- Image alt text suggestions for 3–5 stock images to source

---

### 5. Advanced Backlink Outreach Plan

Go beyond the audit — actively plan link building:

1. Identify 15 high-quality link targets in the client's niche:
   - Industry blogs, directories, resource pages, news sites
   - Sites linking to competitors but not the client

| Target Site | Domain Authority (est.) | Page to Target | Outreach Strategy | Priority |
|-------------|------------------------|----------------|-------------------|----------|
|             |                        |                |                   |          |

2. Draft 3 outreach email templates:
   - **Guest post pitch** — propose a relevant article topic
   - **Resource link request** — suggest the client's page as a resource
   - **Broken link replacement** — offer the client's content as a fix for a dead link

Each email should be personalised to the niche, under 150 words, with a clear value proposition.

---

### 6. Weekly Progress Updates

Instead of monthly, this plan provides weekly updates. Generate 4 weekly update templates for this month:

**Week [N] Update — {{CLIENT_URL}}**

1. **Work completed this week** — 3–5 bullet points.
2. **Key metric changes** — any keyword movements, traffic changes, or indexing events.
3. **Issues flagged** — anything needing client attention.
4. **Next week's plan** — what's queued up.

Keep each update under 200 words. No jargon.

---

### 7. Custom Analytics Dashboard Spec

Design a Google Data Studio / Looker dashboard for the client. Output:

1. **Data sources** — GSC, GA4, Supabase page_views (Cornerstone tracker).
2. **Dashboard pages:**

| Page | Widgets | Metrics |
|------|---------|---------|
| Overview | Scorecard row, time series chart, top pages table | Sessions, page views, avg position, impressions, clicks |
| Keywords | Keyword table with filters, position distribution chart | Keyword, avg position, impressions, clicks, CTR |
| Pages | Page performance table, content gap flags | URL, sessions, bounce rate, avg position |
| Competitors | Comparison table (manual data entry) | Competitor, est. keywords, est. traffic, trend |

3. For each widget, specify the exact GSC/GA4 fields and filters.

---

### 8. Quarterly Authority Review & 90-Day Roadmap

Every 3 months, produce a deeper strategic review. If this is a quarter-end month, generate:

1. **Authority scorecard** — rate the site 1–10 on: technical health, content depth, backlink strength, local presence, schema coverage.
2. **Quarter highlights** — top 5 wins from the past 3 months.
3. **Quarter challenges** — top 3 issues that persisted or emerged.
4. **90-day roadmap** — 12 weekly priorities for the next quarter.

| Week | Priority Task | Expected Impact | Dependencies |
|------|---------------|-----------------|--------------|
| 1    |               |                 |              |
| ...  |               |                 |              |
| 12   |               |                 |              |

If not a quarter-end month, skip and note "Next quarterly review: [month]."

---

### 9. Monthly Progress Report

Write a comprehensive report (under 1500 words) with:

**Subject:** SEO Progress Report — {{CLIENT_URL}} — [Month Year]

1. **Executive summary** — 3-sentence overview.
2. **13-point audit results** — full tracking table.
3. **Work completed** — all deliverables listed.
4. **Keyword progress** — 200+ keywords, top 20 movers highlighted.
5. **Content published** — 2 articles, 3 briefs delivered.
6. **Backlink outreach** — links pitched, links secured.
7. **Local SEO** — citations, map pack, GMB stats.
8. **Competitor watch** — intelligence summary.
9. **CRO findings** — conversion changes.
10. **Weekly updates recap** — 4 weeks summarised.
11. **Client action items** — things only they can do.
12. **Next month priorities** — what's queued.
13. **Quarterly review** (if applicable).

---

End of prompt.
```

## Deliverables

| File | Description |
|------|-------------|
| All Authority plan deliverables | (full audit, 100 keywords, local SEO, 13-point audit, etc.) |
| `keyword-map-200.md` | 200+ keywords in 25–30 clusters |
| `content-brief-1.md` | Content brief #1 |
| `content-brief-2.md` | Content brief #2 |
| `content-brief-3.md` | Content brief #3 |
| `article-1.html` | Publish-ready SEO article #1 |
| `article-2.html` | Publish-ready SEO article #2 |
| `backlink-outreach.md` | 15 link targets + 3 email templates |
| `weekly-update-1.md` through `weekly-update-4.md` | 4 weekly progress updates |
| `dashboard-spec.md` | Looker/Data Studio dashboard specification |
| `quarterly-review.md` | Authority review + 90-day roadmap (quarterly) |
| `report.md` | Comprehensive monthly report |
