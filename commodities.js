// ===== COMMODITIES & PRECIOUS METALS TRACKER =====

// Commodity data with fallback prices (Jan 2026 estimates)
const commoditiesData = {
    preciousMetals: [
        { symbol: 'XAU', name: 'Gold', unit: 'oz', fallbackPrice: 2650.00, icon: '🥇' },
        { symbol: 'XAG', name: 'Silver', unit: 'oz', fallbackPrice: 31.50, icon: '🥈' },
        { symbol: 'XPT', name: 'Platinum', unit: 'oz', fallbackPrice: 985.00, icon: '⚪' },
        { symbol: 'XPD', name: 'Palladium', unit: 'oz', fallbackPrice: 1050.00, icon: '🔘' }
    ],
    energy: [
        { symbol: 'CL', name: 'Crude Oil (WTI)', unit: 'barrel', fallbackPrice: 78.50, icon: '🛢️' },
        { symbol: 'BZ', name: 'Brent Crude', unit: 'barrel', fallbackPrice: 82.30, icon: '⛽' },
        { symbol: 'NG', name: 'Natural Gas', unit: 'MMBtu', fallbackPrice: 3.25, icon: '🔥' },
        { symbol: 'HO', name: 'Heating Oil', unit: 'gallon', fallbackPrice: 2.65, icon: '🏠' },
        { symbol: 'RB', name: 'Gasoline', unit: 'gallon', fallbackPrice: 2.35, icon: '⛽' }
    ],
    agriculture: [
        { symbol: 'ZC', name: 'Corn', unit: 'bushel', fallbackPrice: 4.85, icon: '🌽' },
        { symbol: 'ZW', name: 'Wheat', unit: 'bushel', fallbackPrice: 6.20, icon: '🌾' },
        { symbol: 'ZS', name: 'Soybeans', unit: 'bushel', fallbackPrice: 13.50, icon: '🫘' },
        { symbol: 'KC', name: 'Coffee', unit: 'lb', fallbackPrice: 2.45, icon: '☕' },
        { symbol: 'SB', name: 'Sugar', unit: 'lb', fallbackPrice: 0.27, icon: '🍬' },
        { symbol: 'CT', name: 'Cotton', unit: 'lb', fallbackPrice: 0.82, icon: '🧶' },
        { symbol: 'CC', name: 'Cocoa', unit: 'ton', fallbackPrice: 4250.00, icon: '🍫' },
        { symbol: 'OJ', name: 'Orange Juice', unit: 'lb', fallbackPrice: 3.85, icon: '🍊' }
    ],
    industrialMetals: [
        { symbol: 'HG', name: 'Copper', unit: 'lb', fallbackPrice: 4.25, icon: '🔶' },
        { symbol: 'ALI', name: 'Aluminum', unit: 'lb', fallbackPrice: 1.15, icon: '📦' },
        { symbol: 'ZN', name: 'Zinc', unit: 'lb', fallbackPrice: 1.28, icon: '🔩' },
        { symbol: 'NI', name: 'Nickel', unit: 'lb', fallbackPrice: 7.85, icon: '⚙️' },
        { symbol: 'LBS', name: 'Lumber', unit: '1000 bf', fallbackPrice: 565.00, icon: '🪵' }
    ]
};

// State for commodities
let commoditiesState = {
    prices: {},
    lastUpdated: null
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

// Generate random price change for demo
function generatePriceChange(basePrice) {
    const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
    const newPrice = basePrice * (1 + changePercent / 100);
    return {
        price: newPrice,
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
function updateFeaturedCards() {
    const metals = commoditiesData.preciousMetals;

    metals.forEach(metal => {
        const priceData = generatePriceChange(metal.fallbackPrice);
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
        const priceData = generatePriceChange(commodity.fallbackPrice);
        commoditiesState.prices[commodity.symbol] = priceData;
        html += createCommodityCard(commodity, priceData);
    });

    container.innerHTML = html;
}

// Initialize commodities display
function initCommodities() {
    // Update featured cards
    updateFeaturedCards();

    // Render each category
    renderCommodityCategory('energyContainer', commoditiesData.energy);
    renderCommodityCategory('agricultureContainer', commoditiesData.agriculture);
    renderCommodityCategory('metalsContainer', commoditiesData.industrialMetals);

    commoditiesState.lastUpdated = new Date();
}

// Refresh commodities data
function refreshCommodities() {
    updateFeaturedCards();
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
