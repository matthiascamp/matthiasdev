# Cornerstone — Authority Plan ($699/mo) SEO Delivery Prompt

> Replace `{{CLIENT_URL}}` with the client's website URL and run in Claude Code.
> This plan includes everything in Pro plus the additions below.

---

```
You are performing a monthly SEO audit and implementation for a client website.

Client website: {{CLIENT_URL}}

This is the Authority plan — 28 hrs/month, 100 keywords targeted. This is the most popular plan. Work through every section. Generate actual fixes, code, and copy.

---

### 1. Full Pro Plan Work

Run all Starter, Growth, and Pro work:
- 7-point technical audit + fixes
- Full-site page optimisation (unlimited pages)
- 50 keyword cluster mapping (expand to 100 below)
- Advanced schema (LocalBusiness, FAQ, Product, Review, Breadcrumb)
- Backlink audit + disavow
- Top-3 competitor gap analysis
- Page speed optimisation
- 1 content brief
- 30-day roadmap

(See Pro plan prompt for full details.)

---

### 2. Expanded Keyword Targeting (100 Keywords)

Expand to 100 target keywords:
1. Include the 50 from Pro.
2. Add 50 more: long-tail variations, question keywords ("how to...", "best..."), local variations ("[service] near [location]"), and semantic/LSI keywords.
3. Group into 15–20 topic clusters.
4. Map every keyword to an existing page or flag as a content gap.
5. Assign priority: High / Medium / Low based on volume and competition.

Output the full keyword map table.

---

### 3. Full Local SEO Dominance

1. **Citation audit** — check the top 20 Australian business directories (Yellow Pages, True Local, Yelp AU, Hotfrog, StartLocal, etc.) for the client's listing. Note which are present, missing, or inconsistent.

| Directory | Listed? | NAP Consistent? | Action Needed |
|-----------|---------|-----------------|---------------|
|           |         |                 |               |

2. **NAP consistency** — verify Name, Address, Phone is identical everywhere (website, schema, GMB, directories). Flag any mismatches.

3. **Map pack targeting** — analyse the top 3 map pack results for the client's primary local keyword. What do they have that the client doesn't? Generate an action plan.

4. **Local landing pages** — if the client serves multiple locations, recommend location-specific pages. Generate a content brief for the highest-priority one.

---

### 4. 13-Point Monthly Ranking Audit

Track these 13 signals monthly:

| # | Signal | Status | Notes |
|---|--------|--------|-------|
| 1 | Title tags optimised (all pages) | | |
| 2 | Meta descriptions optimised (all pages) | | |
| 3 | H1 structure correct | | |
| 4 | Schema markup valid (all types) | | |
| 5 | Sitemap up to date | | |
| 6 | robots.txt correct | | |
| 7 | Core Web Vitals passing | | |
| 8 | Internal link health | | |
| 9 | Backlink profile clean | | |
| 10 | Google Business Profile complete | | |
| 11 | Local citations consistent | | |
| 12 | No crawl errors in GSC | | |
| 13 | No manual actions / penalties | | |

---

### 5. Topical Authority Content Strategy

1. Map the client's niche as a topic hierarchy (main topic → subtopics → supporting content).
2. Identify which subtopics the client already covers and which are missing.
3. Create a 3-month content calendar with 4 content pieces per month (12 total) to systematically build authority.

| Month | Week | Topic | Type | Target Keyword | Priority |
|-------|------|-------|------|----------------|----------|
|       |      |       |      |                |          |

4. For the top-priority missing topic, generate a full content brief (same format as Pro plan).

---

### 6. Conversion Rate Optimisation (CRO)

For the 5 highest-traffic pages:

1. Analyse the page structure — is the CTA visible above the fold?
2. Check for clear value proposition in the first 100 words.
3. Assess form placement, button copy, and trust signals (reviews, badges).
4. Recommend specific changes to improve conversion.

| Page | Monthly Visits (est.) | Current CTA | Issues Found | Recommended Changes |
|------|----------------------|-------------|-------------|---------------------|
|      |                      |             |             |                     |

---

### 7. Monthly Competitor Intelligence Report

For each of the top 3 competitors identified in the Pro analysis:

1. Check for new pages published this month.
2. Check for new keywords they're ranking for.
3. Note any technical changes (new schema, site redesign, speed improvements).
4. Assess whether they're gaining or losing ground relative to the client.

| Competitor | New Pages | New Keywords | Technical Changes | Trend |
|------------|-----------|-------------|-------------------|-------|
|            |           |             |                   |       |

---

### 8. Hreflang & International SEO (If Applicable)

If the client serves multiple countries/languages:
1. Audit existing hreflang tags.
2. Generate correct hreflang link elements for all language/region variants.
3. Verify hreflang consistency (every page must reference all variants including itself).

If not applicable, skip and note "Single-region site — not applicable."

---

### 9. Monthly Progress Report

Write a comprehensive plain-English report (under 1200 words) with:

**Subject:** SEO Progress Report — {{CLIENT_URL}} — [Month Year]

1. **Executive summary** — 3-sentence overview.
2. **13-point audit results** — the full tracking table.
3. **What we fixed** — all deliverables.
4. **Keyword progress** — 100 keywords, highlight movers.
5. **Local SEO status** — citations, map pack position.
6. **Competitor watch** — intelligence summary.
7. **Content roadmap** — what's published, what's next.
8. **CRO findings** — conversion improvements.
9. **Client action items** — things only they can do.
10. **30-day roadmap** — next month's priorities.

---

End of prompt.
```

## Deliverables

| File | Description |
|------|-------------|
| All Pro plan deliverables | (sitemap, robots, schema, meta-tags, keyword map, etc.) |
| `keyword-map-100.md` | 100 keywords in 15–20 clusters |
| `local-seo-audit.md` | Citation audit + NAP check + map pack analysis |
| `13-point-audit.md` | Monthly ranking signal tracker |
| `content-calendar.md` | 3-month topical authority content plan |
| `cro-audit.md` | CRO analysis for top 5 pages |
| `competitor-intel.md` | Monthly competitor intelligence report |
| `report.md` | Comprehensive monthly report |
