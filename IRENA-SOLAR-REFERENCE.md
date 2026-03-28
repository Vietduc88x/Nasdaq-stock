# IRENA Solar Reference

This file holds the detailed solar implementation reference that supports the architecture in [ARCHITECTURE.md](/C:/Market_Techmade/ARCHITECTURE.md).

It is intentionally separate from the architecture doc so the architecture stays readable while the solar model retains exact implementation inputs and benchmark outputs.

## 1. Source

Primary source:

- IRENA (2026), "Solar PV Supply Chain Cost Tool: Methodology, results and analysis"

Supporting references mentioned in the original planning notes:

- NREL 2025
- PV Magazine
- Business Analytiq 2025
- Solar Panel 2023

## 2. Reference Output

### Vietnam, domestic production

| Technology | 2025 ($/Wp) | 2030 ($/Wp) |
|------------|-------------|-------------|
| TOPCon (without ESG) | 0.178 | 0.168 |
| TOPCon (with ESG) | 0.180 | 0.171 |
| Monocrystalline (without ESG) | 0.174 | 0.169 |
| Monocrystalline (with ESG) | 0.177 | 0.173 |

### TOPCon waterfall, Vietnam, 2025 with ESG

| Stage | Cost ($/Wp) |
|-------|-------------|
| Polysilicon | 0.023 |
| Wafer | 0.033 |
| Cell | 0.040 |
| Module | 0.083 |
| Total | 0.180 |

### Import scenarios, TOPCon, Vietnam, 2025

| Scenario | Cost ($/Wp) | Delta |
|----------|-------------|-------|
| Full domestic | 0.180 | baseline |
| Import wafers from China | 0.146 | -19% |
| Import cells from China | 0.124 | -31% |

## 3. Supply Chain Stages

```text
Polysilicon -> Wafer/Ingot -> Cell -> Module Assembly = Total Module
0.023/Wp       0.033/Wp       0.040/Wp   0.083/Wp       0.180/Wp
```

## 4. Cost Components Per Stage

Each stage includes the following cost components:

1. Electricity
2. Materials
3. Equipment depreciation
4. Building and facilities depreciation
5. Labour
6. Maintenance
7. Overheads
8. Operating profit

## 5. Key Assumptions

### Polysilicon

| Parameter | Value | Source |
|-----------|-------|--------|
| Electricity consumption | 40 kWh/kg | PV Magazine |
| Equipment lifetime | 10 years | NREL 2025 |
| Building lifetime | 20 years | NREL 2025 |
| Maintenance | 4% of CAPEX | NREL 2025 |
| Silicon metal price | $1.7/kg | Business Analytiq 2025 |
| Other materials | $1.2/kg | NREL 2025 |
| Conversion rate | 2.1 g/W (TOPCon), 1.9 g/W (Mono) | Solar Panel 2023 |

### Wafer/Ingot

| Parameter | TOPCon | Mono |
|-----------|--------|------|
| Wafer area | 0.03822 m2 | 0.033124 m2 |
| Wafer thickness | 130 um | 145 um |
| Electricity consumption | 0.9 kWh/wafer | 0.81 kWh/wafer |
| Other materials | $0.077/Wp | $0.0693/Wp |
| Equipment lifetime | 7 years | 7 years |

### Solar Cell

| Parameter | TOPCon | Mono |
|-----------|--------|------|
| Electricity consumption | 0.056 kWh/W | 0.0504 kWh/W |
| Silver price | $853/kg | $853/kg |
| Equipment lifetime | 5 years | 5 years |

### Module

| Parameter | TOPCon | Mono |
|-----------|--------|------|
| Electricity consumption | 0.025 kWh/module | 0.025 kWh/module |
| Other materials (Al frames, glass, EVA, junction boxes) | $0.057/Wp | $0.0513/Wp |
| Equipment lifetime | 5 years | 5 years |
| ESG certification | $0.0006/W | $0.0006/W |

## 6. Country-Specific Inputs

| Parameter | China | Vietnam | India | Germany | USA | Australia |
|-----------|-------|---------|-------|---------|-----|-----------|
| Electricity ($/kWh) | 0.06 | 0.07 | 0.08 | 0.15 | 0.07 | 0.10 |
| Avg salary ($/yr) | 12000 | 9000 | 7000 | 45000 | 55000 | 50000 |
| Equipment polysilicon ($/kg) | 10 | 15 | 15 | 25 | 30 | 30 |
| Equipment wafer ($/kW) | 30 | 40 | 40 | 60 | 60 | 60 |
| Equipment cell ($/kW) | 25 | 35 | 35 | 50 | 55 | 55 |
| Equipment module ($/kW) | 10 | 13 | 13 | 20 | 20 | 20 |
| Building polysilicon ($/kg) | 3 | 5 | 5 | 10 | 12 | 12 |
| Building wafer ($/kWp) | 20 | 30 | 30 | 50 | 55 | 55 |
| Building cell ($/kWp) | 20 | 30 | 30 | 50 | 55 | 55 |
| Building module ($/kWp) | 15 | 20 | 20 | 35 | 40 | 40 |

## 7. Technology Roadmap 2025-2030

| Parameter | Component | 2025 | 2030 | Change | Yearly |
|-----------|-----------|------|------|--------|--------|
| Electricity consumption | Polysilicon | 40 kWh/kg | 37.8 kWh/kg | -6% | -1.1% |
| Electricity consumption | Wafer | 0.9 kWh/wafer | 0.85 kWh/wafer | -6% | -1.1% |
| Electricity consumption | Cell | 0.056 kWh/W | 0.042 kWh/W | -25% | -5% |
| Electricity consumption | Module | 0.025 kWh/mod | 0.020 kWh/mod | -20% | -4% |
| Silicon conversion | Polysilicon | 1.26% | 1.18% | -6% | -1.3% |
| Polysilicon to W | Polysilicon | 2.1 g/W | 1.89 g/W | -10% | -2% |
| Silver consumption | Cell | 0.01 kg/Wp | 0.008 kg/Wp | -25% | -5% |
| Cell efficiency | Cell | 25.3% | 26.0% | +3% | +0.6% |
| Module efficiency | Module | 25.0% | 26.0% | +4% | +0.8% |
| Cell power | Module | 9.67 W/cell | 9.94 W/cell | +3% | +0.4% |

## 8. Implementation note

The production model should eventually move these values into a structured dataset such as:

- `data/models/solar-irena-v2026.03.json`

Until then, this file is the reference source for implementation and regression testing.
