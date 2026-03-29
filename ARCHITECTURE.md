# Renewable Energy Materials Intelligence - Revised Architecture

## 1. Product Vision

Renewable Energy Materials Intelligence is a market intelligence platform for people making decisions around renewable energy supply chains and raw-material markets. It connects upstream commodity moves to downstream equipment costs, turning fragmented pricing signals into something operationally useful and financially actionable.

At its best, the product does two things exceptionally well:

1. It tracks a curated set of renewable-energy-relevant materials and clearly shows whether each value is live, cached, vendor-supplied, or modeled reference data.
2. It translates those material moves into explainable impacts on solar PV, BESS, and wind cost structures.

This is not just another market dashboard. It is a decision-support product for users who need to trust the inputs, understand the assumptions, and act on the output with confidence. Trust, provenance, and graceful degradation are first-class requirements.

**Primary users:** EPC procurement managers, project developers, energy analysts, supply-chain researchers, commodity traders, and investors tracking raw-material futures, proxies, and related market signals

**Primary domain:** `market.techmadeeasy.info`

---

## 2. Product Scope

### Phase 1 (ship first)

| Page | Route | Purpose |
|------|-------|---------|
| Materials Dashboard | `/` | The market front page: covered materials, freshness, top movers, downstream cost impact, and market context |
| Solar PV Cost Model | `/solar` | The flagship modeled experience: IRENA-based solar economics with explainable material sensitivity |
| Material Detail | `/material/[slug]` | The bridge between market and industry context: price state, source metadata, related instruments, and cross-system impact |

### Phase 1.5

| Page | Route | Purpose |
|------|-------|---------|
| Markets Overview | `/markets` | Trading-oriented overview of futures-linked materials, leaders/laggards, and sector context |

### Phase 2 (shipped)

| Page | Route | Purpose |
|------|-------|---------|
| BESS Cost Model | `/bess` | Battery pack model (LFP/NMC811), Argonne BatPaC v5.0 |
| Wind Cost Model | `/wind` | Onshore turbine model (IRENA + NREL 2024), 5-stage |
| Solar Country Comparison | `/solar` | Side-by-side 6-country cost comparison |
| Solar Forecast | `/solar` | Nowcast + 30-day estimate + lead indicator |
| Morning Brief | `/` | Daily top material movers with cross-system cost impact |
| BESS Anatomy | `/bess/anatomy` | Interactive battery component explorer |
| Wind Anatomy | `/wind/anatomy` | Interactive turbine component explorer |

### Phase 3 (not started)

| Page | Route | Purpose |
|------|-------|---------|
| Scenario Studio | `/scenario` | Multi-material what-if simulation across systems |

### User modes

The product supports two primary usage modes:

| Mode | Primary question |
|------|------------------|
| Procurement/industry | "How does this material move affect equipment cost and project economics?" |
| Trading/investment | "Which raw materials or futures-linked markets are moving, and which renewable sectors may respond next?" |

The UI should let users move between these modes naturally, without turning the product into two disconnected experiences.

### Scope guardrail

Phase 1 should answer questions 1-4 in the final recommendation with high confidence.

Phase 1.5 introduces question 5 more fully:

- related tradable instruments
- markets overview
- movers/correlation views
- richer trader and investor workflows

---

## 3. Architectural Principles

1. The system cost engines are the source of truth for total system cost.
2. Material BOM data is an explainability layer, not the only model.
3. Market data coverage must be explicit per material; do not pretend everything is live-priced.
4. Every response that influences user decisions must expose freshness, source, and model version.
5. The frontend should fetch page-shaped payloads, not orchestrate many low-level endpoints.
6. Trading-oriented features should be clearly separated from modeled downstream cost impact so users can distinguish market facts from derived interpretation.

---

## 4. System Architecture

```text
USER BROWSER
  |
  | same-origin requests to /api/*
  v
NEXT.JS APP ON VERCEL
  |
  | route handlers / server components
  | aggregate page data and hide backend topology
  v
MARKET API (FASTIFY)
  |
  | services
  |-- market-data service
  |-- solar model engine
  |-- impact service
  |-- provenance/version service
  v
DATA LAYER
  |-- versioned model datasets (solar/BOM/reference prices)
  |-- cache store
  |-- source catalog
  v
UPSTREAM DATA SOURCES
  |-- live market feeds for exchange-traded materials
  |-- optional paid/partner feeds for specialty materials
  |-- internal reference dataset for non-live inputs
```

### Hosting

- Frontend: Vercel
- Backend API: existing droplet on `167.172.72.194`
- Reverse proxy: nginx
- Process manager: PM2

### Network boundary

- Browsers never call Yahoo, Metals API, or other market vendors directly.
- Browsers only call same-origin Next.js routes.
- Next.js can either rewrite to Fastify or proxy through route handlers.
- Prefer route handlers for page aggregation, auth expansion, and edge-safe request shaping.

---

## 5. Data Classification

The product becomes much more credible if it is honest about data quality. Not every renewable material has a clean, liquid, real-time market feed, so the platform should classify every material into one of four coverage tiers.

| Tier | Meaning | Example materials | UI badge |
|------|---------|-------------------|----------|
| `live_exchange` | Direct market price available from an exchange or reliable real-time feed | silver, copper, aluminum | `Live` |
| `delayed_vendor` | Vendor/API price available but not true real time | lithium carbonate, cobalt, nickel sulfate | `Vendor` |
| `indexed_reference` | Updated periodically from reports or curated datasets | graphite, rare earth oxides | `Indexed` |
| `modeled_reference` | No trustworthy live market source; value maintained as reference assumption | EVA, electrolyte, fiberglass | `Reference` |

### Consequences

- The dashboard must display coverage tier for every material.
- The smoke test must not require all materials to show `Live`.
- The backend must preserve the distinction between "current market data" and "reference assumption".
- Futures-linked instruments and spot/reference material records must be related, but not treated as interchangeable prices.

### Phase 1 coverage plan

The first release should keep live market coverage intentionally narrow and high-confidence.

| Tier | Phase 1 target | Initial candidates |
|------|----------------|-------------------|
| `live_exchange` | 6-8 materials | silver, copper, aluminum, tin, zinc, nickel, gold-as-reference-anchor |
| `delayed_vendor` | 0-3 materials | lithium carbonate, cobalt if a credible source is secured |
| `indexed_reference` | 3-4 materials | neodymium, dysprosium, graphite, carbon fiber |
| `modeled_reference` | 5-6 materials | EVA, solar glass, fiberglass, electrolyte, iron phosphate, polysilicon-grade silicon inputs |

Implementation rule: it is better to support fewer materials honestly than to overstate live coverage.

### Trading instrument mapping

Some users care about tradable exposure, not just modeled material inputs. For that reason, the catalog should support an optional mapping between a material and one or more market instruments.

```text
material_market_mapping
  material_id
  instrument_type         // futures, ETF, producer equity, proxy index
  instrument_symbol
  venue
  relationship_type       // direct, proxy, basket
  confidence
```

Examples:

- silver -> COMEX silver futures
- copper -> COMEX or LME copper
- aluminum -> LME aluminum
- lithium carbonate -> proxy/index or vendor reference, not fake exchange mapping

---

## 6. Canonical Data Model

The model needs two related but different datasets.

### 6.1 System Model Dataset

This powers total system cost.

```text
system_model
  id
  system_type              // solar, bess, wind
  model_version            // e.g. solar-irena-v2026.03
  valid_years              // 2025-2030
  dimension_set            // country, tech, chemistry, turbine_type, etc.
  stage_inputs[]           // electricity, labor, capex, overhead, yield, profit
  material_inputs[]        // linked material assumptions used by this model
  reference_outputs[]      // known benchmark outputs for regression tests
```

### 6.2 Material Impact Dataset

This powers explainability and sensitivity.

```text
material_impact_map
  material_id
  system_type
  model_version
  usage_basis              // g/Wp, g/Wh, kg/kW, or cost-share input
  baseline_usage
  baseline_price
  baseline_cost_contribution
  contribution_kind        // direct_material, derived_material, proxy_material
  source_ref
```

### Important distinction

- `system_model` computes the real answer.
- `material_impact_map` explains part of the answer and supports scenarios.
- Not every non-material component belongs in the impact map.

### 6.3 Model versioning strategy

- Every published model dataset gets an immutable version string such as `solar-irena-v2026.03`.
- The API should default to the latest approved model version.
- The API may accept `modelVersion=solar-irena-v2026.03` for reproducibility and debugging.
- Older model versions are retained, not overwritten, so historical outputs remain reproducible.
- When a new IRENA methodology or data release arrives, create a new dataset version rather than mutating the old one.

---

## 7. Backend Architecture

### 7.1 Directory Structure

```text
/opt/market-api/
|-- src/
|   |-- server.js
|   |
|   |-- routes/
|   |   |-- page-data.js            // page-shaped responses for frontend
|   |   |-- materials.js
|   |   |-- solar.js
|   |   |-- scenarios.js
|   |   |-- health.js
|   |
|   |-- services/
|   |   |-- market-data-service.js
|   |   |-- solar-model-service.js
|   |   |-- bess-cost-engine.js
|   |   |-- wind-cost-engine.js
|   |   |-- forecast-service.js
|   |   |-- brief-service.js
|   |   |-- impact-service.js
|   |   |-- provenance-service.js
|   |
|   |-- data/
|   |   |-- materials/
|   |   |   |-- catalog.json             // 21 materials, 4 coverage tiers
|   |   |-- models/
|   |   |   |-- solar-irena-v2026.03.json
|   |   |   |-- bess-argonne-v2024.json
|   |   |   |-- wind-irena-v2026.json
|   |   |-- forecast/
|   |   |   |-- solar-lag-model.json
|   |   |-- snapshots/                   // daily price snapshots (Morning Brief)
|   |
|   |-- __tests__/
|       |-- solar-model.test.js
|       |-- solar-compare.test.js
|       |-- solar-compare-route.test.js
|       |-- bess-cost-engine.test.js
|       |-- wind-cost-engine.test.js
|       |-- forecast-service.test.js
|       |-- brief-service.test.js
|       |-- impact-service.test.js
|
|-- ecosystem.config.js
|-- package.json
|-- .env
```

### 7.2 Backend Responsibilities

#### `market-data-service`

- Fetches live or delayed prices where available
- Normalizes vendor symbols and units
- Returns freshness metadata
- Never fabricates live coverage for unsupported materials

#### `solar-model-service`

- Implements the stage-based IRENA model
- Accepts `country`, `tech`, `year`
- Returns total cost, stage breakdown, and benchmark comparison

#### `impact-service`

- Maps material price changes onto model outputs
- Distinguishes direct material contribution from total system cost
- Handles scenario overrides with bounded validation

#### `provenance-service`

- Attaches dataset version, source references, as-of timestamp, and confidence tier
- Gives the UI enough information to display trust indicators

### 7.3 Phase 1 implementation notes

- Keep startup lightweight; schema validation files can exist without blocking Phase 1 delivery.
- Regression tests and benchmark tests are the primary safety net for the first release.
- Add strict startup schema validation once datasets become larger, user-editable, or shared across multiple services.
- Keep detailed IRENA implementation inputs in a separate reference artifact, not inline in this architecture doc.
- Reference file for the solar model: `IRENA-SOLAR-REFERENCE.md`

---

## 8. API Design

Prefer a hybrid API:

- page-shaped endpoints for frontend rendering
- smaller endpoints for drill-down and internal reuse

### 8.1 Primary Frontend Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/page/home` | Dashboard payload with top materials, freshness summary, and featured solar impacts |
| GET | `/api/page/solar` | Full solar page payload with forecast for selected params |
| GET | `/api/page/solar-compare` | Multi-country solar cost comparison (2-6 countries) |
| GET | `/api/page/bess` | BESS cost model payload (LFP/NMC811) |
| GET | `/api/page/wind` | Wind cost model payload (onshore) |
| GET | `/api/page/brief` | Morning Brief: top material movers with cost impact |
| GET | `/api/page/material/:slug` | Material detail payload with cross-system impact summary |
| GET | `/api/page/markets` | Trading-oriented market overview (Phase 3) |

### 8.2 Supporting Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/materials` | Search/filter material catalog |
| GET | `/api/materials/:slug` | Single material metadata and current price state |
| GET | `/api/materials/:slug/history` | Optional history or sparkline source |
| GET | `/api/materials/:slug/impact` | Impact by system/model version |
| GET | `/api/materials/:slug/markets` | Related tradable instruments, proxies, and market context (Phase 1.5) |
| GET | `/api/solar/cost` | Total solar model output |
| GET | `/api/solar/breakdown` | Stage and material contribution breakdown |
| POST | `/api/scenarios/solar` | Solar what-if scenario evaluation |
| GET | `/api/markets/movers` | Top movers among covered tradable materials (Phase 1.5) |
| GET | `/api/markets/correlations` | Optional sector/material correlation summary (Phase 1.5) |
| GET | `/api/health/live` | Liveness only |
| GET | `/api/health/ready` | Upstream, cache, and dataset readiness |

### 8.3 Example: `/api/page/solar`

```json
{
  "params": { "country": "VN", "tech": "topcon", "year": 2025 },
  "model": {
    "version": "solar-irena-v2026.03",
    "asOf": "2026-03-28T10:00:00Z",
    "totalCostPerWp": 0.180,
    "benchmarkDeltaPct": 0.4
  },
  "stageBreakdown": [
    { "stage": "polysilicon", "costPerWp": 0.023 },
    { "stage": "wafer", "costPerWp": 0.033 },
    { "stage": "cell", "costPerWp": 0.040 },
    { "stage": "module", "costPerWp": 0.083 }
  ],
  "materialImpacts": [
    {
      "material": "silver",
      "coverageTier": "live_exchange",
      "priceSource": "yahoo",
      "asOf": "2026-03-28T09:57:00Z",
      "baselineContributionPerWp": 0.0085,
      "shareOfSystemPct": 4.7
    }
  ],
  "meta": {
    "freshness": "mixed",
    "liveCoveragePct": 62,
    "referenceCoveragePct": 38
  }
}
```

### 8.4 Example: `/api/materials/:slug/markets`

```json
{
  "material": "copper",
  "spotState": {
    "coverageTier": "live_exchange",
    "source": "yahoo",
    "asOf": "2026-03-28T09:57:00Z"
  },
  "relatedInstruments": [
    {
      "symbol": "HG=F",
      "name": "COMEX Copper Futures",
      "relationshipType": "direct",
      "venue": "COMEX"
    }
  ],
  "signals": {
    "dailyChangePct": 1.8,
    "weeklyChangePct": 4.9,
    "downstreamSensitivity": [
      { "system": "solar", "rank": 3 },
      { "system": "wind", "rank": 2 }
    ]
  }
}
```

### 8.5 Validation Rules

| Param | Valid values |
|-------|--------------|
| `country` | `CN`, `VN`, `IN`, `DE`, `US`, `AU` |
| `tech` | `topcon`, `mono` |
| `year` | `2025` to `2030` |
| `changePct` | `-50` to `100` |
| `materialSlug` | allowlisted catalog slug |

---

## 9. Frontend Architecture

### 9.1 Tech Stack

- Next.js 14 app router
- Tailwind CSS
- Chart.js or Recharts for charts
- Server Components for initial payload fetch
- Client Components only where interactivity is necessary

### 9.2 Frontend Structure

```text
C:\Market_Techmade\
|-- src/
|   |-- app/
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   |-- solar/page.tsx
|   |   |-- material/[slug]/page.tsx
|   |   |-- api/
|   |       |-- page/
|   |       |   |-- home/route.ts
|   |       |   |-- solar/route.ts
|   |       |-- materials/[slug]/route.ts
|   |
|   |-- components/
|   |   |-- materials/
|   |   |-- solar/
|   |   |-- shared/
|   |
|   |-- lib/
|   |   |-- api.ts
|   |   |-- types.ts
|   |   |-- formatters.ts
|   |   |-- trust-badges.ts
|   |
|   |-- hooks/
|       |-- useSolarScenario.ts
|       |-- useMaterialFilters.ts
```

### 9.3 Rendering Strategy

- Initial page load comes from one aggregated endpoint per page.
- Sliders and scenario tools call narrow POST endpoints after hydration.
- Every price card shows source badge, timestamp, and fallback state.
- Every model page shows model version and benchmark status.
- Trading cards should show whether the displayed value is a tradable instrument, a spot/reference material, or a modeled proxy.

### 9.4 Next.js Proxy Pattern

Prefer route handlers over a pure rewrite-only architecture when possible.

```js
// app/api/page/solar/route.ts
// fetches Fastify backend and returns a stable frontend contract
```

This gives you:

- stable contracts during backend refactors
- easier instrumentation
- room for caching at the Next.js layer
- reduced browser exposure to backend topology

### 9.5 Phase 1 proxy recommendation

Use route handlers where aggregation earns the extra layer:

- `/api/page/home`
- `/api/page/solar`

Use simple rewrites or direct backend pass-through for lower-complexity endpoints in Phase 1:

- material detail support endpoints
- health endpoints
- simple lookup endpoints

---

## 10. Caching and Freshness

Caching should be explicit and layered.

### 10.1 Server-side

- In-memory cache for hot material requests: 60-300 seconds depending on source
- Separate cache keys by source and normalized unit
- Keep stale values for fallback if upstream is temporarily down

### 10.2 Frontend

- Short-lived cache for UX smoothness only
- Do not let browser cache become the trust source

### 10.3 Freshness contract

Every material price returned to the UI should include:

```json
{
  "value": 85.31,
  "unit": "USD/oz",
  "normalizedValue": 2.7426,
  "normalizedUnit": "USD/g",
  "coverageTier": "live_exchange",
  "source": "yahoo",
  "asOf": "2026-03-28T09:57:00Z",
  "staleAfterSeconds": 300,
  "fallbackUsed": false
}
```

---

## 11. Error Handling and Degradation

### 11.1 Error philosophy

- The product should remain usable when live feeds fail.
- The product must never hide when it is relying on fallback assumptions.

### 11.2 Failure matrix

| Failure | Expected behavior |
|---------|-------------------|
| Live feed timeout | serve stale cached value with warning metadata |
| Live feed schema change | mark source degraded, use cached/reference fallback |
| Unsupported material for live pricing | serve reference value with explicit tier |
| Solar model validation error | return 400 with parameter-specific error |
| Model calculation error | return 500 with request id and safe message |
| Backend unavailable | show unavailable banner and preserve static explanatory content |

### 11.3 Health endpoints

`/api/health/live`

- process up
- server responding

`/api/health/ready`

- dataset loaded
- cache operational
- upstream providers checked recently
- last successful live fetch timestamp available

---

## 12. Observability

The old design had logging but not enough operational visibility. Add the following:

### Metrics

- request count by endpoint
- p95 latency by endpoint
- upstream latency by provider
- cache hit rate
- fallback rate by material
- percent of dashboard materials currently live vs reference
- solar model benchmark drift
- tradable-instrument coverage rate
- quote lag for tradable instruments

### Structured logs

- request id
- endpoint
- params
- model version
- upstream source used
- fallback reason

### Admin/debug endpoint

Optional private endpoint:

`GET /api/admin/data-status`

Returns:

- loaded dataset versions
- per-source health
- materials with missing live coverage
- last refresh times

---

## 13. Security

| Threat | Mitigation |
|--------|------------|
| SSRF via upstream fetch | hardcode upstream providers and symbol maps |
| Query abuse | strict validation, bounded scenario payloads, size limits |
| Secrets exposure | backend-only env vars, never in browser payloads |
| Rate abuse | nginx + app-level rate limiting, but tuned per endpoint class |
| Cache poisoning | normalize symbols/units and keep trusted source mapping |

### Rate limiting strategy

Do not apply one flat `60 req/min` limit to every endpoint.

Use endpoint classes instead:

- page endpoints: moderate burst allowance
- scenario endpoints: tighter per-IP limit
- health/admin endpoints: internal or restricted

---

## 14. Deployment Sequence

### Step 1: Backend foundation

1. Create `market-api` service skeleton on the droplet.
2. Implement `solar-model-service` with benchmark regression tests.
3. Implement material catalog plus coverage-tier metadata.
4. Implement `market-data-service` for a small proven live subset first.
5. Add `/api/page/home` and `/api/page/solar`.

### Step 2: Frontend migration

1. Convert the frontend to Next.js app router.
2. Build the dashboard and solar page against page endpoints.
3. Surface trust badges, timestamps, and model version UI.

### Step 3: Deployment

1. Add nginx upstream for `market-api.techmadeeasy.info`.
2. Run PM2 process.
3. Configure SSL.
4. Connect Vercel project and domain.

### Step 4: Smoke tests

- home page loads
- solar page returns `VN/topcon/2025`
- solar total is within regression tolerance of reference benchmark
- unsupported materials show `Reference`, not fake `Live`
- source badges and timestamps render correctly
- backend readiness check is healthy

### Rollback

- frontend: Vercel rollback
- backend: deploy previous PM2 release or previous tagged commit
- data: revert to prior model dataset version

Avoid `git checkout HEAD~1` as the primary rollback plan. Prefer tagged releases or a release directory strategy.

---

## 15. Test Strategy

### Unit tests

- solar benchmark: `VN/topcon/2025 ~= 0.180`
- solar benchmark: `VN/topcon/2030 ~= 0.171`
- stage totals sum to total cost
- material impact contribution never exceeds logical bounds
- unit normalization for oz/kg/ton inputs

### Integration tests

- `/api/page/home` returns dashboard contract
- `/api/page/solar` returns model + impacts + meta
- unsupported live material returns `modeled_reference`
- stale cache path returns warning metadata
- invalid query params return useful 400s

### Contract tests

- page endpoints stay backward-compatible for frontend
- dataset schema validation on startup

### Operational tests

- readiness endpoint fails if model dataset is missing
- readiness endpoint warns if live source success rate drops below threshold

---

## 16. Resource Budget

### Droplet

- Fastify API should remain lightweight
- main memory risk is not the app server itself, but cached datasets and concurrent PM2 processes
- validate headroom again before adding BESS and Wind

### Vercel

- page aggregation can reduce browser chatter and total request count
- keep charts client-side only where required

---

## 17. Roadmap

### Phase 1 (shipped)

- Solar PV cost model (IRENA, 6 countries, 2 technologies)
- Materials dashboard (21 materials, 4 coverage tiers, filterable)
- Provenance/freshness system
- Page-shaped API
- Material detail pages with cross-system impact

### Phase 2 (shipped)

- BESS cost model (BatPaC, LFP/NMC811)
- Wind cost model (IRENA + NREL, onshore)
- Solar country comparison (6 countries)
- Solar cost forecast (nowcast, 30-day, lead indicator)
- Morning Brief (daily movers, trust-aware)
- Anatomy pages (solar, BESS, wind)
- 206 backend tests

### Phase 3 (next)

- Tariff/landed cost simulator
- Price alerts (email/Telegram)
- Historical cost tracker (daily snapshots foundation exists)
- Markets overview page
- Scenario studio

### Phase 4

- Technology comparison (TOPCon vs Mono vs HJT crossover)
- Supply chain risk map
- API access for developers
- Export/report generation
- Authenticated saved scenarios

---

## 18. Final Recommendation

Build the first release around one excellent solar model, a transparent material catalog, and explicit trust metadata. The goal is not to launch the widest possible dashboard on day one. The goal is to launch the most credible one.

Users should leave the product able to answer five practical questions immediately:

1. Which inputs are truly live?
2. Which values are reference assumptions?
3. How much does this material move change system cost?
4. Which model version produced this answer?
5. If I want to trade or monitor this material, what is the closest real market instrument?

If the product answers those five questions clearly, it will feel credible to operating teams, useful to analysts, and actionable for traders and investors. That is the wedge: a market product that does not stop at price visibility, but connects price action to industrial consequence.

---

*Document revised: 2026-03-29*
*Architecture version: 2.1*
*Status: Updated after Sprint 2 (Wind + Morning Brief shipped)*
