# BESS Cost Reference Data

## Sources

1. **Argonne National Laboratory** — ANL/CSE-24/1 "Cost Analysis and Projections for U.S.-Manufactured Batteries" (2024)
   - BatPaC v5.0 based, bottom-up model
   - PDF: `Data/BESS/Argonne_Battery_Cost_Analysis_2024.pdf`

2. **Faraday Institution** — Insights Issue 6 "Battery Cell Material Content" (2022)
   - Material intensity (kg/kWh) by chemistry
   - PDF: `Data/BESS/Faraday_Material_Intensity.pdf`

3. **NREL** — "Cost Projections for Utility-Scale Battery Storage" (2025)
   - System-level installed cost projections
   - PDF: `Data/BESS/NREL_Battery_Cost_Projections_2025.pdf`

4. **BNEF** — Battery Price Survey (2025)
   - Pack prices: LFP $81/kWh, NMC $128/kWh, global average $108/kWh

---

## Material Prices (Argonne BatPaC, Table 11)

| Material | 2023 | 2026 | 2030 | 2035 |
|---|---|---|---|---|
| NMC622 cathode | $31.9/kg | — | — | — |
| NMC811 cathode | — | $34/kg | — | — |
| NMC95 cathode | — | — | $31.3/kg | — |
| LFP cathode | $13/kg | $11.5/kg | $10/kg | $9.5/kg |
| Graphite anode | $10/kg | $9/kg | $8/kg | $8/kg |
| Silicon anode | $30/kg | $30/kg | $30/kg | $30/kg |
| Electrolyte | $10/L | $10/L | $10/L | $10/L |
| Separator | $0.50/m² | $0.50/m² | $0.50/m² | $0.50/m² |

## Other Cell Components (Table 12)

| Component | Price |
|---|---|
| Carbon additive | $7/kg |
| Positive binder (PVDF) | $15/kg |
| Positive solvent (NMP) | $2.70/kg |
| Positive current collector (Al foil) | $0.20/m² |
| Negative binder (CMC/SBR) | $10/kg |
| Negative current collector (Cu foil) | $1.20/m² |

---

## Material Intensity (Faraday Institution, kg per kWh)

| Material | LFP | NMC111 | NMC622 | NMC811 |
|---|---|---|---|---|
| Lithium (as LCE) | 0.10 | 0.15 | 0.13 | 0.11 |
| Nickel | 0 | 0.40 | 0.61 | 0.75 |
| Cobalt | 0 | 0.40 | 0.19 | 0.09 |
| Manganese | 0 | 0.37 | 0.20 | 0.09 |
| Iron | 0.88 | 0 | 0 | 0 |
| Phosphorus | 0.49 | 0 | 0 | 0 |
| Graphite (anode) | 1.10 | 1.10 | 1.10 | 1.10 |
| Copper (foil) | 0.35 | 0.35 | 0.35 | 0.35 |
| Aluminum (foil) | 0.15 | 0.15 | 0.15 | 0.15 |
| Electrolyte | 0.80 | 0.80 | 0.80 | 0.80 |

---

## Pack Cost Benchmarks (Argonne, BEV 90kWh Midsize SUV)

| Chemistry | 2023 | 2026 | 2030 | 2035 |
|---|---|---|---|---|
| NMC (Ni/Mn) | $140/kWh | ~$120/kWh | ~$100/kWh | $86/kWh |
| LFP | $115/kWh | ~$95/kWh | ~$80/kWh | $72/kWh |

## BNEF 2025 Pack Prices

| Segment | $/kWh |
|---|---|
| Global average | $108 |
| LFP packs | $81 |
| NMC packs | $128 |
| Stationary storage | $70 |
| China packs | $84 |

---

## Cost Component Breakdown (% of Cell Cost, typical)

| Component | % of Cell Cost |
|---|---|
| Cathode active material | 29-51% (chemistry dependent) |
| Anode (graphite) | ~12% |
| Separator | ~7% |
| Electrolyte | ~4% |
| Current collectors (Cu/Al foil) | ~5% |
| Manufacturing | ~24% |

Manufacturing sub-breakdown:
- 45% electrode manufacturing (coating, calendering)
- 30% cell finishing (formation cycling, aging)
- 25% cell assembly (stacking, welding, filling)

---

## Cell Design Parameters (LFP, from Argonne Table 10)

| Parameter | 2023 | 2026 | 2030 | 2035 |
|---|---|---|---|---|
| Cell capacity (BEV) | 75 Ah | 125 Ah | 190 Ah | 255 Ah |
| Electrode thickness | 75 µm | 90 µm | 110 µm | 130 µm |
| Cell voltage | 3.325 V | 3.316 V | 3.316 V | 3.316 V |
| Cell yield | 89% | 92% | 95% | 95% |
| Plant capacity | 35 GWh/yr | 50 GWh/yr | 70 GWh/yr | 70 GWh/yr |

---

## Simplified BESS Cost Model (for our calculator)

For a stationary BESS system (4-hour, 100MW/400MWh):

### Cell Level ($/kWh)

**LFP Cell (2025 estimate):**
- Cathode material: LFP at $12/kg × 0.88 kg/kWh (iron) + $12/kg × 0.49 kg/kWh (phosphorus) ≈ $15/kWh
- Anode material: Graphite at $9/kg × 1.10 kg/kWh ≈ $10/kWh
- Electrolyte: $10/L × 0.30 L/kWh ≈ $3/kWh
- Separator: $0.50/m² × 1.5 m²/kWh ≈ $0.75/kWh
- Current collectors: Cu $1.20/m² + Al $0.20/m² ≈ $2/kWh
- Cell manufacturing (coating, assembly, formation): ≈ $12/kWh
- **Total cell: ~$43/kWh**

**NMC811 Cell (2025 estimate):**
- Cathode material: NMC811 at $34/kg × ~1.1 kg/kWh ≈ $37/kWh
- Anode material: Graphite at $9/kg × 1.10 kg/kWh ≈ $10/kWh
- Electrolyte: $10/L × 0.30 L/kWh ≈ $3/kWh
- Separator: $0.50/m² × 1.5 m²/kWh ≈ $0.75/kWh
- Current collectors: ≈ $2/kWh
- Cell manufacturing: ≈ $14/kWh
- **Total cell: ~$67/kWh**

### Pack Level (add to cell cost)

| Component | $/kWh |
|---|---|
| Battery Management System (BMS) | $5 |
| Thermal management | $4 |
| Pack housing (steel/aluminum) | $6 |
| Wiring, connectors, busbars | $3 |
| Module assembly labor | $4 |
| Pack assembly labor | $3 |
| **Total pack overhead** | **~$25/kWh** |

### System Level (add to pack cost)

| Component | $/kWh |
|---|---|
| Power conversion (inverter) | $15 |
| Balance of system | $10 |
| Installation labor | $8 |
| Engineering, permitting | $5 |
| **Total system overhead** | **~$38/kWh** |

### Total BESS Cost Summary (2025)

| Level | LFP | NMC811 |
|---|---|---|
| Cell | $43/kWh | $67/kWh |
| Pack (cell + pack overhead) | $68/kWh | $92/kWh |
| System (installed) | $106/kWh | $130/kWh |

Cross-check: BNEF says LFP packs at $81/kWh (close to our $68 cell + $25 pack = $93 — within range considering BNEF includes some margin). Stationary storage at $70/kWh matches well for utility-scale.

---

*Document created: 2026-03-28*
*Status: Ready for implementation*
