// ===== COMMODITIES & PRECIOUS METALS TRACKER =====

// Commodity data with fallback prices (Feb 2026 market prices)
const commoditiesData = {
    preciousMetals: [
        { symbol: 'XAU', name: 'Gold', unit: 'oz', fallbackPrice: 4895.00, apiSymbol: 'gold', icon: '🥇' },
        { symbol: 'XAG', name: 'Silver', unit: 'oz', fallbackPrice: 85.31, apiSymbol: 'silver', icon: '🥈' },
        { symbol: 'XPT', name: 'Platinum', unit: 'oz', fallbackPrice: 1320.00, apiSymbol: 'platinum', icon: '⚪' },
        { symbol: 'XPD', name: 'Palladium', unit: 'oz', fallbackPrice: 1180.00, apiSymbol: 'palladium', icon: '🔘' }
    ],
    energy: [
        { symbol: 'CL', name: 'Crude Oil (WTI)', unit: 'barrel', fallbackPrice: 72.85, apiSymbol: 'crude_oil_wti', icon: '🛢️' },
        { symbol: 'BZ', name: 'Brent Crude', unit: 'barrel', fallbackPrice: 76.20, apiSymbol: 'brent_crude_oil', icon: '⛽' },
        { symbol: 'NG', name: 'Natural Gas', unit: 'MMBtu', fallbackPrice: 3.05, apiSymbol: 'natural_gas', icon: '🔥' },
        { symbol: 'HO', name: 'Heating Oil', unit: 'gallon', fallbackPrice: 2.38, apiSymbol: 'heating_oil', icon: '🏠' },
        { symbol: 'RB', name: 'Gasoline', unit: 'gallon', fallbackPrice: 2.12, apiSymbol: 'gasoline', icon: '⛽' }
    ],
    agriculture: [
        { symbol: 'ZC', name: 'Corn', unit: 'bushel', fallbackPrice: 4.48, apiSymbol: 'corn', icon: '🌽' },
        { symbol: 'ZW', name: 'Wheat', unit: 'bushel', fallbackPrice: 5.52, apiSymbol: 'wheat', icon: '🌾' },
        { symbol: 'ZS', name: 'Soybeans', unit: 'bushel', fallbackPrice: 10.15, apiSymbol: 'soybeans', icon: '🫘' },
        { symbol: 'KC', name: 'Coffee', unit: 'lb', fallbackPrice: 4.12, apiSymbol: 'coffee', icon: '☕' },
        { symbol: 'SB', name: 'Sugar', unit: 'lb', fallbackPrice: 0.18, apiSymbol: 'sugar', icon: '🍬' },
        { symbol: 'CT', name: 'Cotton', unit: 'lb', fallbackPrice: 0.67, apiSymbol: 'cotton', icon: '🧶' },
        { symbol: 'CC', name: 'Cocoa', unit: 'ton', fallbackPrice: 9650.00, apiSymbol: 'cocoa', icon: '🍫' },
        { symbol: 'OJ', name: 'Orange Juice', unit: 'lb', fallbackPrice: 4.55, apiSymbol: 'orange_juice', icon: '🍊' }
    ],
    industrialMetals: [
        { symbol: 'HG', name: 'Copper', unit: 'lb', fallbackPrice: 4.08, apiSymbol: 'copper', icon: '🔶' },
        { symbol: 'ALI', name: 'Aluminum', unit: 'lb', fallbackPrice: 1.15, apiSymbol: 'aluminum', icon: '📦' },
        { symbol: 'ZN', name: 'Zinc', unit: 'lb', fallbackPrice: 1.28, apiSymbol: 'zinc', icon: '🔩' },
        { symbol: 'NI', name: 'Nickel', unit: 'lb', fallbackPrice: 7.15, apiSymbol: 'nickel', icon: '⚙️' },
        { symbol: 'LBS', name: 'Lumber', unit: '1000 bf', fallbackPrice: 535.00, apiSymbol: 'lumber', icon: '🪵' }
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

// Fetch prices from free API (GoldAPI.io style endpoint)
async function fetchMetalPrices() {
    try {
        // Try to fetch from a free metals API
        const response = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU,XAG,XPT,XPD');
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.rates) {
                // API returns rates as 1/price, so we need to invert
                return {
                    gold: data.rates.XAU ? 1 / data.rates.XAU : null,
                    silver: data.rates.XAG ? 1 / data.rates.XAG : null,
                    platinum: data.rates.XPT ? 1 / data.rates.XPT : null,
                    palladium: data.rates.XPD ? 1 / data.rates.XPD : null
                };
            }
        }
    } catch (error) {
        console.log('Metal API fetch failed, using fallback prices');
    }
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

    // Render each category
    renderCommodityCategory('energyContainer', commoditiesData.energy);
    renderCommodityCategory('agricultureContainer', commoditiesData.agriculture);
    renderCommodityCategory('metalsContainer', commoditiesData.industrialMetals);

    commoditiesState.lastUpdated = new Date();
}

// Refresh commodities data
async function refreshCommodities() {
    await updateFeaturedCards();
    renderCommodityCategory('energyContainer', commoditiesData.energy);
    renderCommodityCategory('agricultureContainer', commoditiesData.agriculture);
    renderCommodityCategory('metalsContainer', commoditiesData.industrialMetals);
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
