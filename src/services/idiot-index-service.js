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

function toTitleCase(value) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function buildStageContributors(stageBreakdown, options = {}) {
  const {
    includeStage = () => true,
    includeComponent = () => true,
    labelForComponent = (stageName, componentName) => ({
      label: toTitleCase(componentName),
      component: toTitleCase(stageName),
    }),
  } = options;

  return stageBreakdown
    .filter(stage => includeStage(stage.stage))
    .flatMap(stage =>
      Object.entries(stage.components)
        .filter(([, value]) => Number.isFinite(value) && value > 0)
        .filter(([componentName]) => includeComponent(stage.stage, componentName))
        .map(([componentName, value]) => {
          const labels = labelForComponent(stage.stage, componentName);
          return {
            label: labels.label,
            component: labels.component,
            value: round4(value),
          };
        })
    )
    .sort((a, b) => b.value - a.value);
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

export function buildBessIdiotIndex({ totalCost, stageBreakdown }) {
  const labelMap = {
    cathode: {
      activeMaterial: 'Cathode Active Material',
      additive: 'Conductive Additive',
      binder: 'Positive Binder',
    },
    anode: {
      activeMaterial: 'Anode Active Material',
      binder: 'Negative Binder',
      cuFoil: 'Copper Foil',
    },
    cellComponents: {
      electrolyte: 'Electrolyte',
      separator: 'Separator',
      alFoil: 'Aluminum Foil',
    },
    pack: {
      bms: 'BMS Electronics',
      thermalManagement: 'Thermal Management Hardware',
      housing: 'Pack Housing',
      wiring: 'Wiring & Connectors',
    },
  };

  const contributors = buildStageContributors(stageBreakdown, {
    includeStage: stageName => stageName !== 'cellAssembly',
    includeComponent: (stageName, componentName) =>
      stageName !== 'pack' || !['moduleLabor', 'packLabor'].includes(componentName),
    labelForComponent: (stageName, componentName) => ({
      label: labelMap[stageName]?.[componentName] || toTitleCase(componentName),
      component: toTitleCase(stageName),
    }),
  });

  const baseCost = contributors.reduce((sum, item) => sum + item.value, 0);
  const topDriver = contributors[0] ? { ...contributors[0] } : null;

  const index = buildBaseCostIndex({
    title: 'Idiot Index',
    kind: 'system',
    unit: '$/kWh',
    baseCost,
    finishedCost: totalCost,
    topDriver,
    explanation: 'Finished BESS pack cost divided by a bottom-up material and hardware basket derived from BatPaC stage components. The gap captures assembly labor, formation, testing, and the rest of the conversion layer.',
  });

  index.baseLabel = 'Bottom-up material basket';
  index.upliftLabel = 'Assembly / conversion layer';
  index.contributors = contributors;
  return index;
}

export function buildWindIdiotIndex({ totalCost, stageBreakdown }) {
  const excludedComponents = new Set([
    'blade_mold_labor',
    'blade_transport',
    'tower_fabrication',
    'tower_transport',
    'crane_erection',
    'civil_works',
    'commissioning',
  ]);

  const labelMap = {
    fiberglass_shell: 'Fiberglass Shell',
    carbon_fiber_spar: 'Carbon Fiber Spar',
    resin_adhesive: 'Resin & Adhesive',
    generator_copper: 'Generator Copper',
    permanent_magnets: 'Permanent Magnets',
    gearbox_bearings: 'Gearbox & Bearings',
    power_electronics: 'Power Electronics',
    nacelle_housing: 'Nacelle Housing',
    yaw_pitch_systems: 'Yaw & Pitch Systems',
    tower_steel: 'Tower Steel',
    tower_galvanizing: 'Tower Galvanizing',
    internal_cabling: 'Internal Cabling',
    substation_share: 'Substation Equipment',
    scada_controls: 'SCADA & Controls',
    foundation: 'Foundation Materials',
  };

  const contributors = buildStageContributors(stageBreakdown, {
    includeComponent: (_stageName, componentName) => !excludedComponents.has(componentName),
    labelForComponent: (stageName, componentName) => ({
      label: labelMap[componentName] || toTitleCase(componentName),
      component: toTitleCase(stageName),
    }),
  });

  const baseCost = contributors.reduce((sum, item) => sum + item.value, 0);
  const topDriver = contributors[0] ? { ...contributors[0] } : null;

  const index = buildBaseCostIndex({
    title: 'Idiot Index',
    kind: 'system',
    unit: '$/kW',
    baseCost,
    finishedCost: totalCost,
    topDriver,
    explanation: 'Finished wind turbine cost divided by a bottom-up material and equipment basket from the wind model. The remainder reflects fabrication, transport, erection, and other conversion layers.',
  });

  index.baseLabel = 'Bottom-up material basket';
  index.upliftLabel = 'Fabrication / install layer';
  index.contributors = contributors;
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
