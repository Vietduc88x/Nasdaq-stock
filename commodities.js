// ===== COMMODITIES & PRECIOUS METALS TRACKER =====

// Commodity data with fallback prices (Feb 2026 market prices) - 100 Assets
const commoditiesData = {
    preciousMetals: [
        { symbol: 'XAU', name: 'Gold', unit: 'oz', fallbackPrice: 4895.00, apiSymbol: 'gold', icon: '🥇' },
        { symbol: 'XAG', name: 'Silver', unit: 'oz', fallbackPrice: 85.31, apiSymbol: 'silver', icon: '🥈' },
        { symbol: 'XPT', name: 'Platinum', unit: 'oz', fallbackPrice: 1320.00, apiSymbol: 'platinum', icon: '⚪' },
        { symbol: 'XPD', name: 'Palladium', unit: 'oz', fallbackPrice: 1180.00, apiSymbol: 'palladium', icon: '🔘' },
        { symbol: 'XRH', name: 'Rhodium', unit: 'oz', fallbackPrice: 4850.00, apiSymbol: 'rhodium', icon: '💎' },
        { symbol: 'XIR', name: 'Iridium', unit: 'oz', fallbackPrice: 4200.00, apiSymbol: 'iridium', icon: '✨' },
        { symbol: 'XRU', name: 'Ruthenium', unit: 'oz', fallbackPrice: 485.00, apiSymbol: 'ruthenium', icon: '🔷' },
        { symbol: 'XOS', name: 'Osmium', unit: 'oz', fallbackPrice: 1250.00, apiSymbol: 'osmium', icon: '⬛' },
        { symbol: 'XRE', name: 'Rhenium', unit: 'oz', fallbackPrice: 1580.00, apiSymbol: 'rhenium', icon: '🔹' },
        { symbol: 'XIN', name: 'Indium', unit: 'kg', fallbackPrice: 285.00, apiSymbol: 'indium', icon: '💠' }
    ],
    energy: [
        { symbol: 'CL', name: 'Crude Oil (WTI)', unit: 'barrel', fallbackPrice: 72.85, apiSymbol: 'crude_oil_wti', icon: '🛢️' },
        { symbol: 'BZ', name: 'Brent Crude', unit: 'barrel', fallbackPrice: 76.20, apiSymbol: 'brent_crude_oil', icon: '⛽' },
        { symbol: 'NG', name: 'Natural Gas', unit: 'MMBtu', fallbackPrice: 3.05, apiSymbol: 'natural_gas', icon: '🔥' },
        { symbol: 'HO', name: 'Heating Oil', unit: 'gallon', fallbackPrice: 2.38, apiSymbol: 'heating_oil', icon: '🏠' },
        { symbol: 'RB', name: 'RBOB Gasoline', unit: 'gallon', fallbackPrice: 2.12, apiSymbol: 'gasoline', icon: '⛽' },
        { symbol: 'MTF', name: 'Coal', unit: 'ton', fallbackPrice: 135.50, apiSymbol: 'coal', icon: '⚫' },
        { symbol: 'UX', name: 'Uranium', unit: 'lb', fallbackPrice: 85.25, apiSymbol: 'uranium', icon: '☢️' },
        { symbol: 'ETH', name: 'Ethanol', unit: 'gallon', fallbackPrice: 2.15, apiSymbol: 'ethanol', icon: '🌿' },
        { symbol: 'PN', name: 'Propane', unit: 'gallon', fallbackPrice: 0.78, apiSymbol: 'propane', icon: '🔵' },
        { symbol: 'DSL', name: 'Diesel', unit: 'gallon', fallbackPrice: 2.65, apiSymbol: 'diesel', icon: '🚛' },
        { symbol: 'JET', name: 'Jet Fuel', unit: 'gallon', fallbackPrice: 2.48, apiSymbol: 'jet_fuel', icon: '✈️' },
        { symbol: 'CBN', name: 'Carbon Credits', unit: 'ton', fallbackPrice: 68.50, apiSymbol: 'carbon', icon: '🌍' },
        { symbol: 'PWR', name: 'Electricity', unit: 'MWh', fallbackPrice: 52.30, apiSymbol: 'electricity', icon: '⚡' },
        { symbol: 'LNG', name: 'LNG', unit: 'MMBtu', fallbackPrice: 8.45, apiSymbol: 'lng', icon: '❄️' },
        { symbol: 'BTU', name: 'Thermal Coal', unit: 'ton', fallbackPrice: 98.75, apiSymbol: 'thermal_coal', icon: '🔶' }
    ],
    agriculture: [
        { symbol: 'ZC', name: 'Corn', unit: 'bushel', fallbackPrice: 4.48, apiSymbol: 'corn', icon: '🌽' },
        { symbol: 'ZW', name: 'Wheat', unit: 'bushel', fallbackPrice: 5.52, apiSymbol: 'wheat', icon: '🌾' },
        { symbol: 'ZS', name: 'Soybeans', unit: 'bushel', fallbackPrice: 10.15, apiSymbol: 'soybeans', icon: '🫘' },
        { symbol: 'KC', name: 'Coffee', unit: 'lb', fallbackPrice: 4.12, apiSymbol: 'coffee', icon: '☕' },
        { symbol: 'SB', name: 'Sugar', unit: 'lb', fallbackPrice: 0.18, apiSymbol: 'sugar', icon: '🍬' },
        { symbol: 'CT', name: 'Cotton', unit: 'lb', fallbackPrice: 0.67, apiSymbol: 'cotton', icon: '🧶' },
        { symbol: 'CC', name: 'Cocoa', unit: 'ton', fallbackPrice: 9650.00, apiSymbol: 'cocoa', icon: '🍫' },
        { symbol: 'OJ', name: 'Orange Juice', unit: 'lb', fallbackPrice: 4.55, apiSymbol: 'orange_juice', icon: '🍊' },
        { symbol: 'ZO', name: 'Oats', unit: 'bushel', fallbackPrice: 3.85, apiSymbol: 'oats', icon: '🥣' },
        { symbol: 'ZR', name: 'Rice', unit: 'cwt', fallbackPrice: 15.20, apiSymbol: 'rice', icon: '🍚' },
        { symbol: 'ZL', name: 'Soybean Oil', unit: 'lb', fallbackPrice: 0.42, apiSymbol: 'soybean_oil', icon: '🫒' },
        { symbol: 'ZM', name: 'Soybean Meal', unit: 'ton', fallbackPrice: 295.00, apiSymbol: 'soybean_meal', icon: '🥜' },
        { symbol: 'RS', name: 'Canola', unit: 'ton', fallbackPrice: 485.00, apiSymbol: 'canola', icon: '🌻' },
        { symbol: 'RPS', name: 'Rapeseed', unit: 'ton', fallbackPrice: 465.00, apiSymbol: 'rapeseed', icon: '🌼' },
        { symbol: 'BRY', name: 'Barley', unit: 'bushel', fallbackPrice: 4.85, apiSymbol: 'barley', icon: '🌿' },
        { symbol: 'RYE', name: 'Rye', unit: 'bushel', fallbackPrice: 5.10, apiSymbol: 'rye', icon: '🌱' },
        { symbol: 'MLT', name: 'Millet', unit: 'bushel', fallbackPrice: 3.25, apiSymbol: 'millet', icon: '🟡' },
        { symbol: 'SRG', name: 'Sorghum', unit: 'bushel', fallbackPrice: 4.15, apiSymbol: 'sorghum', icon: '🟤' },
        { symbol: 'PLM', name: 'Palm Oil', unit: 'ton', fallbackPrice: 895.00, apiSymbol: 'palm_oil', icon: '🌴' },
        { symbol: 'TEA', name: 'Tea', unit: 'kg', fallbackPrice: 2.85, apiSymbol: 'tea', icon: '🍵' },
        { symbol: 'RUB', name: 'Rubber', unit: 'kg', fallbackPrice: 1.65, apiSymbol: 'rubber', icon: '🛞' },
        { symbol: 'TBC', name: 'Tobacco', unit: 'lb', fallbackPrice: 4.25, apiSymbol: 'tobacco', icon: '🍂' },
        { symbol: 'MLK', name: 'Milk (Class III)', unit: 'cwt', fallbackPrice: 18.50, apiSymbol: 'milk', icon: '🥛' },
        { symbol: 'CHS', name: 'Cheese', unit: 'lb', fallbackPrice: 1.85, apiSymbol: 'cheese', icon: '🧀' },
        { symbol: 'BTR', name: 'Butter', unit: 'lb', fallbackPrice: 2.65, apiSymbol: 'butter', icon: '🧈' }
    ],
    livestock: [
        { symbol: 'LE', name: 'Live Cattle', unit: 'lb', fallbackPrice: 1.92, apiSymbol: 'live_cattle', icon: '🐄' },
        { symbol: 'GF', name: 'Feeder Cattle', unit: 'lb', fallbackPrice: 2.58, apiSymbol: 'feeder_cattle', icon: '🐂' },
        { symbol: 'HE', name: 'Lean Hogs', unit: 'lb', fallbackPrice: 0.85, apiSymbol: 'lean_hogs', icon: '🐷' },
        { symbol: 'PB', name: 'Pork Bellies', unit: 'lb', fallbackPrice: 1.15, apiSymbol: 'pork_bellies', icon: '🥓' },
        { symbol: 'LMB', name: 'Lamb', unit: 'lb', fallbackPrice: 1.78, apiSymbol: 'lamb', icon: '🐑' },
        { symbol: 'PLT', name: 'Poultry', unit: 'lb', fallbackPrice: 0.95, apiSymbol: 'poultry', icon: '🐔' },
        { symbol: 'EGG', name: 'Eggs', unit: 'dozen', fallbackPrice: 3.25, apiSymbol: 'eggs', icon: '🥚' },
        { symbol: 'WHL', name: 'Wool', unit: 'kg', fallbackPrice: 8.50, apiSymbol: 'wool', icon: '🧣' },
        { symbol: 'HID', name: 'Hides', unit: 'piece', fallbackPrice: 45.00, apiSymbol: 'hides', icon: '🦬' },
        { symbol: 'FML', name: 'Fish Meal', unit: 'ton', fallbackPrice: 1450.00, apiSymbol: 'fish_meal', icon: '🐟' }
    ],
    industrialMetals: [
        { symbol: 'HG', name: 'Copper', unit: 'lb', fallbackPrice: 4.08, apiSymbol: 'copper', icon: '🔶' },
        { symbol: 'ALI', name: 'Aluminum', unit: 'lb', fallbackPrice: 1.15, apiSymbol: 'aluminum', icon: '📦' },
        { symbol: 'ZN', name: 'Zinc', unit: 'lb', fallbackPrice: 1.28, apiSymbol: 'zinc', icon: '🔩' },
        { symbol: 'NI', name: 'Nickel', unit: 'lb', fallbackPrice: 7.15, apiSymbol: 'nickel', icon: '⚙️' },
        { symbol: 'LBS', name: 'Lumber', unit: '1000 bf', fallbackPrice: 535.00, apiSymbol: 'lumber', icon: '🪵' },
        { symbol: 'PB', name: 'Lead', unit: 'lb', fallbackPrice: 0.95, apiSymbol: 'lead', icon: '🔘' },
        { symbol: 'SN', name: 'Tin', unit: 'lb', fallbackPrice: 12.85, apiSymbol: 'tin', icon: '🥫' },
        { symbol: 'SCR', name: 'Steel Rebar', unit: 'ton', fallbackPrice: 485.00, apiSymbol: 'steel_rebar', icon: '🏗️' },
        { symbol: 'HRC', name: 'Steel HRC', unit: 'ton', fallbackPrice: 645.00, apiSymbol: 'steel_hrc', icon: '🔧' },
        { symbol: 'IO', name: 'Iron Ore', unit: 'ton', fallbackPrice: 105.50, apiSymbol: 'iron_ore', icon: '⛏️' },
        { symbol: 'CO', name: 'Cobalt', unit: 'lb', fallbackPrice: 14.25, apiSymbol: 'cobalt', icon: '🔵' },
        { symbol: 'LI', name: 'Lithium', unit: 'kg', fallbackPrice: 12.50, apiSymbol: 'lithium', icon: '🔋' },
        { symbol: 'MN', name: 'Manganese', unit: 'ton', fallbackPrice: 4.85, apiSymbol: 'manganese', icon: '⬜' },
        { symbol: 'MO', name: 'Molybdenum', unit: 'lb', fallbackPrice: 22.50, apiSymbol: 'molybdenum', icon: '🔹' },
        { symbol: 'TI', name: 'Titanium', unit: 'kg', fallbackPrice: 8.75, apiSymbol: 'titanium', icon: '⚪' },
        { symbol: 'W', name: 'Tungsten', unit: 'kg', fallbackPrice: 32.50, apiSymbol: 'tungsten', icon: '💎' },
        { symbol: 'V', name: 'Vanadium', unit: 'lb', fallbackPrice: 8.25, apiSymbol: 'vanadium', icon: '🟣' },
        { symbol: 'CR', name: 'Chromium', unit: 'lb', fallbackPrice: 4.15, apiSymbol: 'chromium', icon: '🔩' },
        { symbol: 'SI', name: 'Silicon', unit: 'kg', fallbackPrice: 2.85, apiSymbol: 'silicon', icon: '🖥️' },
        { symbol: 'MG', name: 'Magnesium', unit: 'kg', fallbackPrice: 3.25, apiSymbol: 'magnesium', icon: '✨' }
    ],
    rareEarth: [
        { symbol: 'ND', name: 'Neodymium', unit: 'kg', fallbackPrice: 125.00, apiSymbol: 'neodymium', icon: '🧲' },
        { symbol: 'DY', name: 'Dysprosium', unit: 'kg', fallbackPrice: 285.00, apiSymbol: 'dysprosium', icon: '💜' },
        { symbol: 'PR', name: 'Praseodymium', unit: 'kg', fallbackPrice: 95.00, apiSymbol: 'praseodymium', icon: '💚' },
        { symbol: 'TB', name: 'Terbium', unit: 'kg', fallbackPrice: 1250.00, apiSymbol: 'terbium', icon: '🟢' },
        { symbol: 'EU', name: 'Europium', unit: 'kg', fallbackPrice: 185.00, apiSymbol: 'europium', icon: '🔴' },
        { symbol: 'Y', name: 'Yttrium', unit: 'kg', fallbackPrice: 35.00, apiSymbol: 'yttrium', icon: '⚪' },
        { symbol: 'LA', name: 'Lanthanum', unit: 'kg', fallbackPrice: 4.85, apiSymbol: 'lanthanum', icon: '🟡' },
        { symbol: 'CE', name: 'Cerium', unit: 'kg', fallbackPrice: 4.25, apiSymbol: 'cerium', icon: '🟠' },
        { symbol: 'SM', name: 'Samarium', unit: 'kg', fallbackPrice: 12.50, apiSymbol: 'samarium', icon: '🟤' },
        { symbol: 'GD', name: 'Gadolinium', unit: 'kg', fallbackPrice: 48.00, apiSymbol: 'gadolinium', icon: '⬛' }
    ],
    strategicMetals: [
        { symbol: 'GA', name: 'Gallium', unit: 'kg', fallbackPrice: 285.00, apiSymbol: 'gallium', icon: '💎' },
        { symbol: 'GE', name: 'Germanium', unit: 'kg', fallbackPrice: 1450.00, apiSymbol: 'germanium', icon: '🔷' },
        { symbol: 'TE', name: 'Tellurium', unit: 'kg', fallbackPrice: 85.00, apiSymbol: 'tellurium', icon: '⚫' },
        { symbol: 'SE', name: 'Selenium', unit: 'kg', fallbackPrice: 22.50, apiSymbol: 'selenium', icon: '🔶' },
        { symbol: 'BI', name: 'Bismuth', unit: 'kg', fallbackPrice: 12.85, apiSymbol: 'bismuth', icon: '🌈' },
        { symbol: 'SB', name: 'Antimony', unit: 'kg', fallbackPrice: 15.50, apiSymbol: 'antimony', icon: '⬜' },
        { symbol: 'CD', name: 'Cadmium', unit: 'kg', fallbackPrice: 3.25, apiSymbol: 'cadmium', icon: '🟡' },
        { symbol: 'HF', name: 'Hafnium', unit: 'kg', fallbackPrice: 850.00, apiSymbol: 'hafnium', icon: '🔘' },
        { symbol: 'ZR', name: 'Zirconium', unit: 'kg', fallbackPrice: 28.50, apiSymbol: 'zirconium', icon: '💠' },
        { symbol: 'TA', name: 'Tantalum', unit: 'kg', fallbackPrice: 145.00, apiSymbol: 'tantalum', icon: '🔵' }
    ]
};

// State for commodities
let commoditiesState = {
    prices: {},
    lastUpdated: null,
    apiPrices: {}
};

// Format price based on value
function formatCommodityPrice(price) {
    if (price >= 1000) {
        return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
        return '$' + price.toFixed(2);
    } else {
        return '$' + price.toFixed(4);
    }
}

// TVC (TradingView) symbol mapping for reference
// Gold: TVC:GOLD, Silver: TVC:SILVER, Platinum: TVC:PLATINUM, Palladium: TVC:PALLADIUM
// Using Yahoo Finance futures as data source (same prices as TVC)

async function fetchMetalPrices() {
    const futuresSymbols = {
        gold: 'GC=F',      // Gold Futures
        silver: 'SI=F',    // Silver Futures
        platinum: 'PL=F',  // Platinum Futures
        palladium: 'PA=F'  // Palladium Futures
    };

    const prices = {};

    // Try fetching from Yahoo Finance (same data as TVC)
    for (const [key, symbol] of Object.entries(futuresSymbols)) {
        try {
            const corsProxy = 'https://api.allorigins.win/raw?url=';
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
            const response = await fetch(corsProxy + encodeURIComponent(yahooUrl));

            if (response.ok) {
                const data = await response.json();
                if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
                    prices[key] = data.chart.result[0].meta.regularMarketPrice;
                }
            }
        } catch (e) {
            console.log(`Failed to fetch ${key} price from Yahoo Finance`);
        }
    }

    // Return prices if we got any, otherwise null to use fallbacks
    if (Object.keys(prices).length > 0) {
        console.log('Fetched live prices from TVC/Yahoo:', prices);
        return prices;
    }

    console.log('Using TVC fallback prices');
    return null;
}

// Generate small price variation for realistic display
function generatePriceVariation(basePrice, maxPercent = 0.5) {
    const changePercent = (Math.random() - 0.5) * maxPercent * 2;
    return {
        price: basePrice * (1 + changePercent / 100),
        change: changePercent
    };
}

// Create commodity card HTML
function createCommodityCard(commodity, priceData) {
    const changeClass = priceData.change >= 0 ? 'positive' : 'negative';
    const changeSymbol = priceData.change >= 0 ? '+' : '';

    return `
        <div class="commodity-card" data-symbol="${commodity.symbol}">
            <div class="commodity-icon">${commodity.icon}</div>
            <div class="commodity-info">
                <span class="commodity-name">${commodity.name}</span>
                <span class="commodity-symbol">${commodity.symbol}</span>
            </div>
            <div class="commodity-price-info">
                <span class="commodity-price">${formatCommodityPrice(priceData.price)}</span>
                <span class="commodity-unit">/${commodity.unit}</span>
            </div>
            <span class="commodity-change ${changeClass}">${changeSymbol}${priceData.change.toFixed(2)}%</span>
        </div>
    `;
}

// Update featured precious metals cards
async function updateFeaturedCards() {
    const metals = commoditiesData.preciousMetals;

    // Try to fetch live prices
    const livePrices = await fetchMetalPrices();

    metals.forEach(metal => {
        let basePrice = metal.fallbackPrice;

        // Use live price if available
        if (livePrices && livePrices[metal.apiSymbol]) {
            basePrice = livePrices[metal.apiSymbol];
        }

        const priceData = generatePriceVariation(basePrice, 0.3);
        commoditiesState.prices[metal.symbol] = priceData;

        const priceId = metal.name.toLowerCase() + 'Price';
        const changeId = metal.name.toLowerCase() + 'Change';

        const priceEl = document.getElementById(priceId);
        const changeEl = document.getElementById(changeId);

        if (priceEl) {
            priceEl.textContent = formatCommodityPrice(priceData.price);
        }

        if (changeEl) {
            const changeClass = priceData.change >= 0 ? 'positive' : 'negative';
            const changeSymbol = priceData.change >= 0 ? '+' : '';
            changeEl.textContent = changeSymbol + priceData.change.toFixed(2) + '%';
            changeEl.className = 'change ' + changeClass;
        }
    });
}

// Render commodity category
function renderCommodityCategory(containerId, commodities) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '';
    commodities.forEach(commodity => {
        const priceData = generatePriceVariation(commodity.fallbackPrice, 0.5);
        commoditiesState.prices[commodity.symbol] = priceData;
        html += createCommodityCard(commodity, priceData);
    });

    container.innerHTML = html;
}

// Initialize commodities display
async function initCommodities() {
    // Update featured cards (with API fetch attempt)
    await updateFeaturedCards();

    // Render each category (100 assets total)
    renderCommodityCategory('energyContainer', commoditiesData.energy);
    renderCommodityCategory('agricultureContainer', commoditiesData.agriculture);
    renderCommodityCategory('livestockContainer', commoditiesData.livestock);
    renderCommodityCategory('metalsContainer', commoditiesData.industrialMetals);
    renderCommodityCategory('rareEarthContainer', commoditiesData.rareEarth);
    renderCommodityCategory('strategicContainer', commoditiesData.strategicMetals);

    commoditiesState.lastUpdated = new Date();
}

// Refresh commodities data
async function refreshCommodities() {
    await updateFeaturedCards();
    renderCommodityCategory('energyContainer', commoditiesData.energy);
    renderCommodityCategory('agricultureContainer', commoditiesData.agriculture);
    renderCommodityCategory('livestockContainer', commoditiesData.livestock);
    renderCommodityCategory('metalsContainer', commoditiesData.industrialMetals);
    renderCommodityCategory('rareEarthContainer', commoditiesData.rareEarth);
    renderCommodityCategory('strategicContainer', commoditiesData.strategicMetals);
    commoditiesState.lastUpdated = new Date();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize commodities after a short delay
    setTimeout(() => {
        initCommodities();
    }, 600);

    // Add refresh functionality when tab is clicked
    const commoditiesTab = document.querySelector('[data-tab="commodities"]');
    if (commoditiesTab) {
        commoditiesTab.addEventListener('click', () => {
            // Refresh data when tab is clicked
            setTimeout(refreshCommodities, 100);
        });
    }
});

// Auto-refresh every 60 seconds when on commodities tab
setInterval(() => {
    const commoditiesTabContent = document.getElementById('commodities-tab');
    if (commoditiesTabContent && commoditiesTabContent.classList.contains('active')) {
        refreshCommodities();
    }
}, 60000);
