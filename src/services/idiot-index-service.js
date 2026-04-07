function round4(n) {
  return Math.round(n * 10000) / 10000;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function safeRatio(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return numerator / denominator;
}

function buildBaseCostIndex({ title, kind, unit, baseCost, finishedCost, topDriver, explanation }) {
  const normalizedBaseCost = round4(baseCost);
  const normalizedFinishedCost = round4(finishedCost);
  const upliftCost = round4(normalizedFinishedCost - normalizedBaseCost);
  const multiplier = safeRatio(normalizedFinishedCost, normalizedBaseCost);
  const baseShare = safeRatio(normalizedBaseCost, normalizedFinishedCost);

  return {
    title,
    kind,
    unit,
    rawMaterialCost: normalizedBaseCost,
    finishedCost: normalizedFinishedCost,
    conversionCost: upliftCost,
    multiplier: multiplier ? round2(multiplier) : null,
    rawSharePct: baseShare ? round2(baseShare * 100) : null,
    baseLabel: kind === 'system' ? 'Raw material basket' : 'Factory-side value',
    upliftLabel: kind === 'system' ? 'Conversion layer' : 'Trade / delivery layer',
    topDriver,
    contributors: [],
    explanation,
  };
}

function buildContributors(materials, getBaseline) {
  return materials
    .map(material => ({
      label: material.name,
      component: material.component,
      value: round4(getBaseline(material)),
    }))
    .filter(item => Number.isFinite(item.value) && item.value > 0)
    .sort((a, b) => b.value - a.value);
}

function buildTopMaterial(materials, getBaseline) {
  const top = materials
    .map(material => ({
      label: material.name,
      component: material.component,
      value: getBaseline(material),
    }))
    .filter(item => Number.isFinite(item.value) && item.value > 0)
    .sort((a, b) => b.value - a.value)[0];

  return top
    ? {
        label: top.label,
        component: top.component,
        value: round4(top.value),
      }
    : null;
}

function buildTopTradeAdder(selectedRoute) {
  const entries = [
    { label: 'Customs Duty', value: selectedRoute.breakdown.customsDuty },
    { label: 'Anti-Dumping', value: selectedRoute.breakdown.antiDumping },
    { label: 'Countervailing', value: selectedRoute.breakdown.countervailing },
    { label: 'Ocean Freight', value: selectedRoute.breakdown.oceanFreight },
    { label: 'Inland Freight', value: selectedRoute.breakdown.inlandFreight },
    { label: 'Port Handling', value: selectedRoute.breakdown.portHandling },
    { label: 'Insurance', value: selectedRoute.breakdown.insurance },
    { label: 'Customs Clearance', value: selectedRoute.breakdown.customsClearance },
    { label: 'Inland Delivery', value: selectedRoute.breakdown.inlandDelivery },
  ]
    .filter(item => Number.isFinite(item.value) && item.value > 0)
    .sort((a, b) => b.value - a.value)[0];

  return entries ? { label: entries.label, value: round4(entries.value) } : null;
}

export function buildSystemIdiotIndex({ title = 'Idiot Index', totalCost, unit, materials, baselineKey = 'baselineCost' }) {
  const rawMaterialCost =
    materials.reduce((sum, material) => sum + (Number(material[baselineKey]) || 0), 0)
  const index = buildBaseCostIndex({
    title,
    kind: 'system',
    unit,
    baseCost: rawMaterialCost,
    finishedCost: totalCost,
    topDriver: buildTopMaterial(materials, material => Number(material[baselineKey]) || 0),
    explanation: 'Finished cost divided by the raw-material basket. Higher values imply more conversion cost, overhead, logistics, or margin layered on top of materials.',
  });
  index.contributors = buildContributors(materials, material => Number(material[baselineKey]) || 0);
  return index;
}

export function buildTradeUpliftIndex(selectedRoute) {
  if (!selectedRoute) return null;
  const index = buildBaseCostIndex({
    title: 'Trade Uplift Index',
    kind: 'trade',
    unit: '$/Wp',
    baseCost: selectedRoute.breakdown.exw,
    finishedCost: selectedRoute.breakdown.ddp,
    topDriver: buildTopTradeAdder(selectedRoute),
    explanation: 'Delivered landed cost divided by factory EXW cost. Higher values mean tariffs, freight, insurance, and clearance are adding more friction to the route.',
  });
  index.contributors = [
    { label: 'Inland Freight', value: round4(selectedRoute.breakdown.inlandFreight) },
    { label: 'Port Handling', value: round4(selectedRoute.breakdown.portHandling) },
    { label: 'Ocean Freight', value: round4(selectedRoute.breakdown.oceanFreight) },
    { label: 'Insurance', value: round4(selectedRoute.breakdown.insurance) },
    { label: 'Customs Duty', value: round4(selectedRoute.breakdown.customsDuty) },
    { label: 'Anti-Dumping', value: round4(selectedRoute.breakdown.antiDumping) },
    { label: 'Countervailing', value: round4(selectedRoute.breakdown.countervailing) },
    { label: 'Customs Clearance', value: round4(selectedRoute.breakdown.customsClearance) },
    { label: 'Inland Delivery', value: round4(selectedRoute.breakdown.inlandDelivery) },
  ].filter(item => item.value > 0).sort((a, b) => b.value - a.value);
  return index;
}

export function buildScenarioUpliftIndex({ title = 'Scenario Index', unit, baseCost, finishedCost, topDriver }) {
  const index = buildBaseCostIndex({
    title,
    kind: 'trade',
    unit,
    baseCost,
    finishedCost,
    topDriver,
    explanation: 'Delivered scenario cost divided by the underlying factory-side scenario value. Higher values mean more trade friction or downstream cost layered on top of the source manufacturing value.',
  });
  return index;
}
