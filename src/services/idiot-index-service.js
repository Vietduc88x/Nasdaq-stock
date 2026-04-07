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
  const rawMaterialCost = round4(
    materials.reduce((sum, material) => sum + (Number(material[baselineKey]) || 0), 0)
  );
  const finishedCost = round4(totalCost);
  const conversionCost = round4(finishedCost - rawMaterialCost);
  const multiplier = safeRatio(finishedCost, rawMaterialCost);
  const rawShare = safeRatio(rawMaterialCost, finishedCost);

  return {
    title,
    kind: 'system',
    unit,
    rawMaterialCost,
    finishedCost,
    conversionCost,
    multiplier: multiplier ? round2(multiplier) : null,
    rawSharePct: rawShare ? round2(rawShare * 100) : null,
    topDriver: buildTopMaterial(materials, material => Number(material[baselineKey]) || 0),
    explanation: 'Finished cost divided by the raw-material basket. Higher values imply more conversion cost, overhead, logistics, or margin layered on top of materials.',
  };
}

export function buildTradeUpliftIndex(selectedRoute) {
  if (!selectedRoute) return null;

  const rawMaterialCost = round4(selectedRoute.breakdown.exw);
  const finishedCost = round4(selectedRoute.breakdown.ddp);
  const conversionCost = round4(finishedCost - rawMaterialCost);
  const multiplier = safeRatio(finishedCost, rawMaterialCost);
  const rawShare = safeRatio(rawMaterialCost, finishedCost);

  return {
    title: 'Trade Uplift Index',
    kind: 'trade',
    unit: '$/Wp',
    rawMaterialCost,
    finishedCost,
    conversionCost,
    multiplier: multiplier ? round2(multiplier) : null,
    rawSharePct: rawShare ? round2(rawShare * 100) : null,
    topDriver: buildTopTradeAdder(selectedRoute),
    explanation: 'Delivered landed cost divided by factory EXW cost. Higher values mean tariffs, freight, insurance, and clearance are adding more friction to the route.',
  };
}
