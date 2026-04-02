# RE Materials Intelligence

A market intelligence platform that tracks how raw material prices affect solar, battery, and wind energy costs. Built for energy procurement professionals who need to trust the inputs, understand the assumptions, and act on the output with confidence.

**Live:** [market.techmadeeasy.info](https://market.techmadeeasy.info)

## Features

### Cost Models (3 engines)

| Model | Route | Source | Unit | Countries/Options |
|-------|-------|--------|------|-------------------|
| **Solar PV** | `/solar` | IRENA 2026 | $/Wp | 6 countries, 2 technologies, 2025-2030 |
| **BESS** | `/bess` | Argonne BatPaC v5.0 | $/kWh | LFP, NMC811, 2025-2035 |
| **Wind** | `/wind` | IRENA + NREL 2024 | $/kW | Onshore, 2025-2030 |

Each model provides:
- Stage-by-stage waterfall cost breakdown
- Material impact analysis with live price sensitivity
- Provenance metadata (model version, data freshness, coverage tier)
- Interactive anatomy pages explaining every component

### Materials Dashboard

- 21 renewable energy materials tracked across solar, BESS, and wind systems
- 6 materials with live Yahoo Finance prices (silver, copper, aluminum, tin, zinc, steel)
- 4-tier data classification: live exchange, delayed vendor, indexed reference, modeled reference
- Filterable by system (Solar / BESS / Wind)
- 5-day sparkline charts and 24h price changes

### Morning Brief

- Daily material price movers with cross-system cost impact
- Automated snapshot persistence for day-over-day comparisons
- Trust-aware: only compares live-vs-live prices, never fabricates deltas against reference data
- Degraded-state detection when insufficient data exists for reliable comparison

### Solar Forecast

- Nowcast: IRENA model adjusted for current material price movements
- 30-day forward estimate based on weighted signal contributions
- Lead indicator (Falling / Stable / Rising / Strongly Rising) with confidence level
- Top 3 material drivers with pass-through rates and lag estimates

### Country Comparison

- Side-by-side solar PV cost comparison across all 6 countries
- Stacked horizontal bars showing stage breakdown per country
- Delta vs cheapest (absolute and percentage)

### Landed Cost Simulator

- EXW → FOB → CIF → DDP calculation across 6 trade routes
- Real tariff rates: Section 301 (US), BCD+AIDC (India), ACFTA (Vietnam), ChAFTA (Australia), EU MFN
- Product-specific HS codes and duties for modules (8541.43), cells (8541.42), wafers (8541.49)
- Route comparison table sorted by DDP, with confidence indicators and transit times

### Solar Import Stage Simulator

- Compare 4 sourcing strategies: full domestic, import wafers, import cells, import modules
- Combines IRENA manufacturing costs with landed-cost trade adders
- Best-driver analysis: manufacturing advantage vs tariff/freight burden
- Stage breakdown waterfalls per scenario with trade adder decomposition

### Anatomy Pages

Interactive educational pages for each technology:
- **Solar:** `/solar/anatomy` — exploded module view, supply chain flow, interactive cost calculator
- **BESS:** `/bess/anatomy` — 8-layer battery explorer, LFP vs NMC811 comparison
- **Wind:** `/wind/anatomy` — 5-component turbine breakdown, scale context

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Chart.js |
| Backend | Fastify, Node.js |
| Hosting | Vercel (frontend), DigitalOcean droplet (API) |
| Process Manager | PM2 |
| Reverse Proxy | nginx with SSL (Certbot) |
| Testing | Vitest (294 tests) |

## Architecture

```
Browser --> Next.js (Vercel) <-- rewrites --> Fastify API (Droplet)
                                                  |
                                          Services Layer
                                          |-- solar-model-service
                                          |-- bess-cost-engine
                                          |-- wind-cost-engine
                                          |-- forecast-service
                                          |-- brief-service
                                          |-- landed-cost-engine
                                          |-- solar-import-simulator
                                          |-- impact-service
                                          |-- market-data-service
                                          |-- provenance-service
                                                  |
                                          Data Layer
                                          |-- materials/catalog.json (21 materials)
                                          |-- models/solar-irena-v2026.03.json
                                          |-- models/bess-argonne-v2024.json
                                          |-- models/wind-irena-v2026.json
                                          |-- forecast/solar-lag-model.json
                                          |-- trade/landed-cost-v2026.json
                                          |-- snapshots/ (daily price snapshots)
```

Page-shaped API design: one fetch per page, backend owns aggregation. See [ARCHITECTURE.md](ARCHITECTURE.md) for full details.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/page/home` | Dashboard with all materials and featured solar |
| GET | `/api/page/solar` | Solar cost model with forecast |
| GET | `/api/page/solar-compare` | Multi-country solar comparison |
| GET | `/api/page/bess` | BESS cost model |
| GET | `/api/page/wind` | Wind cost model |
| GET | `/api/page/brief` | Morning Brief with top movers |
| GET | `/api/page/landed-cost` | Landed cost simulator (EXW → DDP) |
| GET | `/api/page/solar-import` | Solar import stage simulator |
| GET | `/api/page/material/:slug` | Material detail with cross-system impact |

## Development

```bash
# Backend
cd C:\Market_Techmade
npm install
npx vitest run          # 294 tests

# Frontend
cd frontend
npm install
npm run dev             # http://localhost:3000
npx tsc --noEmit        # Type check
```

## Deployment

```bash
# Backend: push to GitHub, then on droplet:
ssh root@167.172.72.194 "cd /opt/market-api && bash deploy.sh"
# deploy.sh: git pull, npm install, vitest run, pm2 restart

# Frontend: auto-deploys via Vercel on push to main
```

## Data Sources

- **IRENA:** Renewable Power Generation Costs 2023 (solar, wind models)
- **Argonne National Laboratory:** BatPaC v5.0 (battery model)
- **NREL:** 2024 Cost of Wind Energy Review
- **Yahoo Finance:** Live exchange prices for traded materials
- **Faraday Institution:** Battery material intensity data
