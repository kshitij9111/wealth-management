# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Financial analysis and visualization project for Tusk Investment Limited. Contains interactive React dashboards comparing three Indian wealth management platforms: MOFSL (Motilal Oswal Financial Services), Nuvama, and 360 ONE.

## Running Dashboards

No build process required. Open HTML files directly in any browser:
- `Wealth_Platform_Dashboard.html` — MOFSL Q3FY26 dashboard
- `Wealth_Platform_Comparison.html` — Cross-platform comparison

All dependencies (React 18, Recharts 2.12.7, Tailwind CSS, Babel) are loaded via CDN. The HTML files are fully self-contained.

## Architecture

### Two Core Components

**MOFSL_Q3FY26_Dashboard.jsx** — 8-tab dashboard for MOFSL:
- Tabs: Overview, WM, CM, AMC, PWM, HFC, Treasury, Capital Allocation
- Data spans Q1FY24–Q3FY26 (11 quarters) + FY21–FY25 actuals + FY25A–FY28E forecasts
- 40+ Recharts charts (bar, stacked bar, dual-axis composed, pie) + 100+ KPI cards

**Wealth_Platform_Comparison.jsx** — Side-by-side comparison of MOFSL, Nuvama, and 360 ONE across:
- Wealth segment: ARR, TBR, AUM, client families, retention
- Asset management: AUM, SIP flows, lending book
- Capital markets: revenue model, margins, cost-to-income
- Operating metrics: ROE, Net Worth, YoY growth

### Code Style

The JSX files use aggressive compression patterns established via `COMPRESSION_SUMMARY.txt`:
- Data constructed via helper functions: `mkQData()`, `mkFYData()`
- Inline component definitions, shortened variable names
- Single-line data objects

When editing JSX, maintain this compression style. When generating a new HTML file, embed the compiled component as a standalone page with CDN script tags matching the pattern in the existing HTML files.

### Data Sources

Excel databooks are the source of truth for all chart data:
- `Q3FY26-Data-Book.xlsx` — MOFSL
- `360_ONE_Q3_FY_26_Data_Book_9f8a8e3d89.xlsx` — 360 ONE
- `Nuvama_Data-Book_Q3-FY-25-26.xlsx` — Nuvama

When updating dashboard data, cross-reference these files. Segment definitions and metric names follow the company's own databook terminology.

### Key Metrics Glossary

- **ARR** — Annualized Recurring Revenue
- **TBR** — Transaction-Based Revenue
- **AUM** — Assets Under Management
- **SOTP** — Sum-of-the-Parts (valuation methodology)
- **NII** — Net Interest Income
- **HFC** — Housing Finance Company (MOFSL's lending arm)
- **PWM** — Private Wealth Management
- **WM** — Wealth Management (retail)
- **CM** — Capital Markets (broking)

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
