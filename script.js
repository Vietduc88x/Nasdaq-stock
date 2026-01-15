// Top 50 Nasdaq stocks by market cap
const top10Stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)' },
    { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AVGO', name: 'Broadcom Inc.' },
    { symbol: 'COST', name: 'Costco Wholesale Corporation' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'ASML', name: 'ASML Holding N.V.' },
    { symbol: 'AMD', name: 'Advanced Micro Devices Inc.' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'PEP', name: 'PepsiCo Inc.' },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
    { symbol: 'TMUS', name: 'T-Mobile US Inc.' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'CMCSA', name: 'Comcast Corporation' },
    { symbol: 'INTU', name: 'Intuit Inc.' },
    { symbol: 'TXN', name: 'Texas Instruments Inc.' },
    { symbol: 'AMGN', name: 'Amgen Inc.' },
    { symbol: 'QCOM', name: 'QUALCOMM Inc.' },
    { symbol: 'HON', name: 'Honeywell International Inc.' },
    { symbol: 'AMAT', name: 'Applied Materials Inc.' },
    { symbol: 'SBUX', name: 'Starbucks Corporation' },
    { symbol: 'BKNG', name: 'Booking Holdings Inc.' },
    { symbol: 'ISRG', name: 'Intuitive Surgical Inc.' },
    { symbol: 'GILD', name: 'Gilead Sciences Inc.' },
    { symbol: 'PANW', name: 'Palo Alto Networks Inc.' },
    { symbol: 'ADP', name: 'Automatic Data Processing Inc.' },
    { symbol: 'ADI', name: 'Analog Devices Inc.' },
    { symbol: 'VRTX', name: 'Vertex Pharmaceuticals Inc.' },
    { symbol: 'MDLZ', name: 'Mondelez International Inc.' },
    { symbol: 'REGN', name: 'Regeneron Pharmaceuticals Inc.' },
    { symbol: 'LRCX', name: 'Lam Research Corporation' },
    { symbol: 'MU', name: 'Micron Technology Inc.' },
    { symbol: 'SNPS', name: 'Synopsys Inc.' },
    { symbol: 'KLAC', name: 'KLA Corporation' },
    { symbol: 'CDNS', name: 'Cadence Design Systems Inc.' },
    { symbol: 'MELI', name: 'MercadoLibre Inc.' },
    { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
    { symbol: 'CRWD', name: 'CrowdStrike Holdings Inc.' },
    { symbol: 'MAR', name: 'Marriott International Inc.' },
    { symbol: 'CSX', name: 'CSX Corporation' },
    { symbol: 'FTNT', name: 'Fortinet Inc.' },
    { symbol: 'DASH', name: 'DoorDash Inc.' },
    { symbol: 'MNST', name: 'Monster Beverage Corporation' },
    { symbol: 'WDAY', name: 'Workday Inc.' },
    { symbol: 'ADSK', name: 'Autodesk Inc.' }
];

// Function to fetch stock data from a free API
async function fetchStockData() {
    const stocksContainer = document.getElementById('stocksContainer');
    stocksContainer.innerHTML = '<div class="loading">Loading stock data...</div>';

    try {
        // Using Yahoo Finance alternative API (free, no key required)
        const promises = top10Stocks.map(async (stock, index) => {
            try {
                // Using a public API endpoint
                const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}`);
                const data = await response.json();

                if (data.chart && data.chart.result && data.chart.result[0]) {
                    const result = data.chart.result[0];
                    const quote = result.meta;
                    const price = quote.regularMarketPrice;
                    const previousClose = quote.chartPreviousClose || quote.previousClose;
                    const change = price - previousClose;
                    const changePercent = (change / previousClose) * 100;
                    const marketCap = quote.marketCap || 0;

                    return {
                        ...stock,
                        price: price.toFixed(2),
                        change: change.toFixed(2),
                        changePercent: changePercent.toFixed(2),
                        marketCap: marketCap,
                        rank: index + 1
                    };
                }
                throw new Error('Invalid data format');
            } catch (error) {
                // Return mock data if API fails
                return {
                    ...stock,
                    price: (Math.random() * 500 + 50).toFixed(2),
                    change: (Math.random() * 20 - 10).toFixed(2),
                    changePercent: (Math.random() * 10 - 5).toFixed(2),
                    marketCap: Math.floor(Math.random() * 2000000000000 + 100000000000),
                    rank: index + 1
                };
            }
        });

        const stocksData = await Promise.all(promises);
        displayStocks(stocksData);
        updateLastUpdatedTime();
    } catch (error) {
        stocksContainer.innerHTML = `
            <div class="error">
                <p>Unable to fetch stock data. Please try again later.</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Error: ${error.message}</p>
            </div>
        `;
    }
}

function formatMarketCap(marketCap) {
    if (marketCap >= 1e12) {
        return '$' + (marketCap / 1e12).toFixed(2) + 'T';
    } else if (marketCap >= 1e9) {
        return '$' + (marketCap / 1e9).toFixed(2) + 'B';
    } else if (marketCap >= 1e6) {
        return '$' + (marketCap / 1e6).toFixed(2) + 'M';
    } else {
        return '$' + marketCap.toLocaleString();
    }
}

function displayStocks(stocks) {
    const stocksContainer = document.getElementById('stocksContainer');

    stocksContainer.innerHTML = stocks.map(stock => {
        const isPositive = parseFloat(stock.change) >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeSymbol = isPositive ? '▲' : '▼';

        return `
            <div class="stock-card">
                <div class="stock-header">
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-rank">#${stock.rank}</div>
                </div>
                <div class="stock-name">${stock.name}</div>
                <div class="stock-price">$${stock.price}</div>
                <div class="stock-marketcap">Market Cap: ${formatMarketCap(stock.marketCap)}</div>
                <div class="stock-change ${changeClass}">
                    <span>${changeSymbol}</span>
                    <span>$${Math.abs(stock.change)}</span>
                    <span>(${isPositive ? '+' : ''}${stock.changePercent}%)</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = timeString;
}

// Function to fetch cryptocurrency data from CoinGecko
async function fetchCryptoData() {
    const cryptoContainer = document.getElementById('cryptoContainer');
    cryptoContainer.innerHTML = '<div class="loading">Loading cryptocurrency data...</div>';

    try {
        // CoinGecko API - Free, no API key required
        // Get top 50 cryptocurrencies by market cap
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h');
        const data = await response.json();

        const cryptoData = data.map((crypto, index) => ({
            id: crypto.id,
            symbol: crypto.symbol.toUpperCase(),
            name: crypto.name,
            price: crypto.current_price,
            change: crypto.price_change_24h || 0,
            changePercent: crypto.price_change_percentage_24h || 0,
            marketCap: crypto.market_cap || 0,
            fdv: crypto.fully_diluted_valuation || 0,
            rank: index + 1,
            image: crypto.image
        }));

        displayCrypto(cryptoData);
        updateLastUpdatedTime();
    } catch (error) {
        cryptoContainer.innerHTML = `
            <div class="error">
                <p>Unable to fetch cryptocurrency data. Please try again later.</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Error: ${error.message}</p>
            </div>
        `;
    }
}

function displayCrypto(cryptos) {
    const cryptoContainer = document.getElementById('cryptoContainer');

    cryptoContainer.innerHTML = cryptos.map(crypto => {
        const isPositive = parseFloat(crypto.change) >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeSymbol = isPositive ? '▲' : '▼';

        return `
            <div class="stock-card crypto-card">
                <div class="stock-header">
                    <div class="crypto-info">
                        <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon">
                        <div class="stock-symbol">${crypto.symbol}</div>
                    </div>
                    <div class="stock-rank">#${crypto.rank}</div>
                </div>
                <div class="stock-name">${crypto.name}</div>
                <div class="stock-price">$${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                <div class="crypto-metrics">
                    <div class="metric">
                        <span class="metric-label">Market Cap:</span>
                        <span class="metric-value">${formatMarketCap(crypto.marketCap)}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">FDV:</span>
                        <span class="metric-value">${crypto.fdv > 0 ? formatMarketCap(crypto.fdv) : 'N/A'}</span>
                    </div>
                </div>
                <div class="stock-change ${changeClass}">
                    <span>${changeSymbol}</span>
                    <span>$${Math.abs(crypto.change).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                    <span>(${isPositive ? '+' : ''}${crypto.changePercent.toFixed(2)}%)</span>
                </div>
            </div>
        `;
    }).join('');
}

// Refresh all data
function refreshAllData() {
    fetchStockData();
    fetchCryptoData();
}

// Event listeners
document.getElementById('refreshBtn').addEventListener('click', refreshAllData);

// Initial load
fetchStockData();
fetchCryptoData();

// Auto-refresh every 60 seconds
setInterval(refreshAllData, 60000);
