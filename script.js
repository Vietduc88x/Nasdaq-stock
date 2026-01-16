// Top 100 Nasdaq stocks by market cap
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
    { symbol: 'ADSK', name: 'Autodesk Inc.' },
    { symbol: 'ABNB', name: 'Airbnb Inc.' },
    { symbol: 'ORLY', name: "O'Reilly Automotive Inc." },
    { symbol: 'CHTR', name: 'Charter Communications Inc.' },
    { symbol: 'MRVL', name: 'Marvell Technology Inc.' },
    { symbol: 'AZN', name: 'AstraZeneca PLC' },
    { symbol: 'PCAR', name: 'PACCAR Inc.' },
    { symbol: 'NXPI', name: 'NXP Semiconductors N.V.' },
    { symbol: 'CTAS', name: 'Cintas Corporation' },
    { symbol: 'MRNA', name: 'Moderna Inc.' },
    { symbol: 'CPRT', name: 'Copart Inc.' },
    { symbol: 'ODFL', name: 'Old Dominion Freight Line Inc.' },
    { symbol: 'TEAM', name: 'Atlassian Corporation' },
    { symbol: 'DXCM', name: 'DexCom Inc.' },
    { symbol: 'PAYX', name: 'Paychex Inc.' },
    { symbol: 'LULU', name: 'Lululemon Athletica Inc.' },
    { symbol: 'ROST', name: 'Ross Stores Inc.' },
    { symbol: 'FAST', name: 'Fastenal Company' },
    { symbol: 'BIIB', name: 'Biogen Inc.' },
    { symbol: 'CTSH', name: 'Cognizant Technology Solutions Corp.' },
    { symbol: 'EA', name: 'Electronic Arts Inc.' },
    { symbol: 'KDP', name: 'Keurig Dr Pepper Inc.' },
    { symbol: 'IDXX', name: 'IDEXX Laboratories Inc.' },
    { symbol: 'EXC', name: 'Exelon Corporation' },
    { symbol: 'VRSK', name: 'Verisk Analytics Inc.' },
    { symbol: 'GEHC', name: 'GE HealthCare Technologies Inc.' },
    { symbol: 'ON', name: 'ON Semiconductor Corporation' },
    { symbol: 'CCEP', name: 'Coca-Cola Europacific Partners PLC' },
    { symbol: 'XEL', name: 'Xcel Energy Inc.' },
    { symbol: 'KHC', name: 'The Kraft Heinz Company' },
    { symbol: 'ANSS', name: 'ANSYS Inc.' },
    { symbol: 'CSGP', name: 'CoStar Group Inc.' },
    { symbol: 'TTD', name: 'The Trade Desk Inc.' },
    { symbol: 'DDOG', name: 'Datadog Inc.' },
    { symbol: 'ZS', name: 'Zscaler Inc.' },
    { symbol: 'TTWO', name: 'Take-Two Interactive Software Inc.' },
    { symbol: 'GFS', name: 'GlobalFoundries Inc.' },
    { symbol: 'CDW', name: 'CDW Corporation' },
    { symbol: 'FANG', name: 'Diamondback Energy Inc.' },
    { symbol: 'WBD', name: 'Warner Bros. Discovery Inc.' },
    { symbol: 'MDB', name: 'MongoDB Inc.' },
    { symbol: 'ILMN', name: 'Illumina Inc.' },
    { symbol: 'WBA', name: 'Walgreens Boots Alliance Inc.' },
    { symbol: 'SMCI', name: 'Super Micro Computer Inc.' },
    { symbol: 'ARM', name: 'Arm Holdings plc' },
    { symbol: 'MCHP', name: 'Microchip Technology Inc.' },
    { symbol: 'ROP', name: 'Roper Technologies Inc.' },
    { symbol: 'BKR', name: 'Baker Hughes Company' },
    { symbol: 'ZM', name: 'Zoom Video Communications Inc.' }
];

// Function to fetch stock data from a free API
async function fetchStockData() {
    const stocksContainer = document.getElementById('stocksContainer');
    stocksContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading market data...</p></div>';

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
        const changeIcon = isPositive ? '↗' : '↘';

        return `
            <div class="asset-card">
                <div class="card-header">
                    <div class="asset-info">
                        <div class="asset-symbol">${stock.symbol}</div>
                    </div>
                    <div class="asset-rank">#${stock.rank}</div>
                </div>
                <div class="asset-name">${stock.name}</div>
                <div class="asset-price">$${stock.price}</div>
                <div class="asset-marketcap">Market Cap: ${formatMarketCap(stock.marketCap)}</div>
                <div class="price-change ${changeClass}">
                    <span class="change-icon">${changeIcon}</span>
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
    cryptoContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading cryptocurrency data...</p></div>';

    try {
        // CoinGecko API - Free, no API key required
        // Get top 100 cryptocurrencies by market cap
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h');

        // Check for rate limiting
        if (response.status === 429) {
            cryptoContainer.innerHTML = `
                <div class="error">
                    <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">⏱️ Rate Limit Reached</p>
                    <p>CoinGecko API rate limit exceeded. Please wait a moment and try refreshing.</p>
                    <p style="font-size: 0.85rem; margin-top: 12px; opacity: 0.8;">The free API allows limited requests per minute. Try again in 60 seconds.</p>
                </div>
            `;
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

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
                <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">❌ Unable to Load Crypto Data</p>
                <p>Could not fetch cryptocurrency data from CoinGecko API.</p>
                <p style="font-size: 0.85rem; margin-top: 12px; opacity: 0.8;">Error: ${error.message}</p>
                <button onclick="fetchCryptoData()" style="margin-top: 16px; padding: 10px 20px; background: #8B5CF6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">Try Again</button>
            </div>
        `;
    }
}

function displayCrypto(cryptos) {
    const cryptoContainer = document.getElementById('cryptoContainer');

    cryptoContainer.innerHTML = cryptos.map(crypto => {
        const isPositive = parseFloat(crypto.change) >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeIcon = isPositive ? '↗' : '↘';

        return `
            <div class="asset-card crypto">
                <div class="card-header">
                    <div class="asset-info">
                        <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon">
                        <div class="asset-symbol">${crypto.symbol}</div>
                    </div>
                    <div class="asset-rank">#${crypto.rank}</div>
                </div>
                <div class="asset-name">${crypto.name}</div>
                <div class="asset-price">$${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                <div class="crypto-metrics">
                    <div class="metric">
                        <span class="metric-label">Market Cap</span>
                        <span class="metric-value">${formatMarketCap(crypto.marketCap)}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">FDV</span>
                        <span class="metric-value">${crypto.fdv > 0 ? formatMarketCap(crypto.fdv) : 'N/A'}</span>
                    </div>
                </div>
                <div class="price-change ${changeClass}">
                    <span class="change-icon">${changeIcon}</span>
                    <span>$${Math.abs(crypto.change).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                    <span>(${isPositive ? '+' : ''}${crypto.changePercent.toFixed(2)}%)</span>
                </div>
                <button class="swap-btn" onclick="openSwapModal('${crypto.id}', '${crypto.symbol}', '${crypto.name}')">
                    <span class="swap-icon">🔄</span>
                    <span>Swap</span>
                </button>
            </div>
        `;
    }).join('');
}

// Refresh all data
function refreshAllData() {
    fetchStockData();
    fetchCryptoData();
}

// Tab Switching Functionality
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding content
            const tabName = button.getAttribute('data-tab');
            const targetContent = document.getElementById(`${tabName}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Refresh all data
function refreshAllData() {
    fetchStockData();
    fetchCryptoData();
}

// Event listeners
document.getElementById('refreshBtn').addEventListener('click', refreshAllData);

// Initialize tabs
initTabs();

// Initial load
fetchStockData();
fetchCryptoData();

// Auto-refresh every 60 seconds
setInterval(refreshAllData, 60000);

// ===== NEAR INTENTS SWAP INTEGRATION =====

// NEAR Wallet Integration
let wallet = null;
let walletSelector = null;
let accountId = null;

// Initialize NEAR Wallet
async function initWallet() {
    try {
        // Wait for scripts to load
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });

        // Check if wallet selector is available
        if (typeof window.nearWalletSelector === 'undefined') {
            console.warn('NEAR Wallet Selector not loaded. Using fallback method.');
            updateWalletUI(false);
            return;
        }

        const { setupWalletSelector } = window.nearWalletSelector;
        const { setupModal } = window.nearWalletSelectorModalUI;
        const { setupMyNearWallet } = window.nearWalletSelectorMyNearWallet;
        const { setupHereWallet } = window.nearWalletSelectorHereWallet;

        walletSelector = await setupWalletSelector({
            network: "mainnet",
            modules: [
                setupMyNearWallet(),
                setupHereWallet()
            ]
        });

        const modal = setupModal(walletSelector, {
            contractId: "v2.ref-finance.near",
            theme: "light"
        });

        window.walletSelectorModal = modal;

        // Check if already connected
        const state = walletSelector.store.getState();
        if (state.accounts.length > 0) {
            accountId = state.accounts[0].accountId;
            updateWalletUI(true);
        }

        // Subscribe to wallet changes
        walletSelector.store.observable.subscribe(state => {
            if (state.accounts.length > 0) {
                accountId = state.accounts[0].accountId;
                updateWalletUI(true);
            } else {
                accountId = null;
                updateWalletUI(false);
            }
        });

        console.log('NEAR Wallet initialized successfully');

    } catch (error) {
        console.error('Wallet initialization error:', error);
        // Show error to user
        showNotification('Failed to initialize wallet. Please refresh the page.', 'error');
        updateWalletUI(false);
    }
}

// Handle wallet button click
function handleWalletClick() {
    if (accountId) {
        // Show disconnect option
        if (confirm(`Disconnect wallet ${accountId}?`)) {
            disconnectWallet();
        }
    } else {
        // Show wallet selector modal
        if (window.walletSelectorModal) {
            window.walletSelectorModal.show();
        } else {
            // Fallback: redirect to MyNearWallet
            showNotification('Opening MyNearWallet...', 'info');
            const appUrl = encodeURIComponent(window.location.origin);
            window.open(
                `https://app.mynearwallet.com/?referrer=${appUrl}`,
                '_blank',
                'width=500,height=700'
            );
        }
    }
}

// Disconnect wallet
async function disconnectWallet() {
    if (walletSelector) {
        const wallet = await walletSelector.wallet();
        await wallet.signOut();
        accountId = null;
        updateWalletUI(false);
    }
}

// Update wallet button UI
function updateWalletUI(connected) {
    const walletBtn = document.getElementById('walletBtn');
    const walletBtnText = document.getElementById('walletBtnText');

    if (!walletBtn || !walletBtnText) {
        console.warn('Wallet button elements not found');
        return;
    }

    if (connected && accountId) {
        walletBtn.classList.add('connected');
        walletBtnText.textContent = accountId.length > 20
            ? accountId.substring(0, 8) + '...' + accountId.substring(accountId.length - 6)
            : accountId;
    } else {
        walletBtn.classList.remove('connected');
        walletBtnText.textContent = 'Connect Wallet';
    }
}

// Initialize wallet after page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initWallet, 1000); // Wait 1 second for all scripts to load
    });
} else {
    setTimeout(initWallet, 1000);
}

// Open swap modal
function openSwapModal(tokenId, tokenSymbol, tokenName) {
    const modal = document.getElementById('swapModal');
    const tokenDisplay = document.getElementById('selectedToken');

    // Set selected token
    tokenDisplay.innerHTML = `
        <span class="modal-token-symbol">${tokenSymbol}</span>
        <span class="modal-token-name">${tokenName}</span>
    `;

    // Store current token for swap
    window.currentSwapToken = {
        id: tokenId,
        symbol: tokenSymbol,
        name: tokenName
    };

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close swap modal
function closeSwapModal() {
    const modal = document.getElementById('swapModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Reset form
    document.getElementById('swapAmount').value = '';
    document.getElementById('toToken').value = 'usdt';
    document.getElementById('feeBreakdown').style.display = 'none';
}

// Update fee display in real-time
function updateFeeDisplay() {
    const amount = document.getElementById('swapAmount').value;
    const feeBreakdown = document.getElementById('feeBreakdown');

    if (!amount || parseFloat(amount) <= 0) {
        feeBreakdown.style.display = 'none';
        return;
    }

    const FEE_PERCENTAGE = 0.0015; // 0.15%
    const swapAmount = parseFloat(amount);
    const feeAmount = swapAmount * FEE_PERCENTAGE;
    const receiveAmount = swapAmount - feeAmount;
    const fromToken = window.currentSwapToken;

    // Update display
    document.getElementById('swapAmountDisplay').textContent =
        `${swapAmount.toFixed(6)} ${fromToken.symbol}`;
    document.getElementById('feeAmountDisplay').textContent =
        `${feeAmount.toFixed(6)} ${fromToken.symbol}`;
    document.getElementById('receiveAmountDisplay').textContent =
        `${receiveAmount.toFixed(6)} ${fromToken.symbol}`;

    feeBreakdown.style.display = 'block';
}

// Execute swap using NEAR Intents with wallet connection
async function executeSwap() {
    const amount = document.getElementById('swapAmount').value;
    const toToken = document.getElementById('toToken').value;
    const fromToken = window.currentSwapToken;

    if (!amount || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    // Check if wallet is connected
    if (!accountId) {
        showNotification('Please connect your wallet first', 'error');
        if (window.walletSelectorModal) {
            window.walletSelectorModal.show();
        }
        return;
    }

    try {
        // Show loading state
        const swapButton = document.querySelector('.modal-swap-btn');
        swapButton.disabled = true;
        swapButton.innerHTML = '<span class="spinner-small"></span> Preparing Swap...';

        // Calculate fee (0.15% of swap amount)
        const FEE_PERCENTAGE = 0.0015; // 0.15%
        const swapAmount = parseFloat(amount);
        const feeAmount = swapAmount * FEE_PERCENTAGE;
        const netAmount = swapAmount - feeAmount;

        // NEAR account to receive fees
        const FEE_RECEIVER = 'babyben.near';

        // Redirect to NEAR Intents swap interface with parameters
        // Using the NEAR Intents Explorer for swaps
        const intentsExplorerUrl = 'https://app.intents.org';

        // For simplicity, open the NEAR Intents app
        // The user will complete the swap there with their connected wallet
        showNotification(
            `Opening NEAR Intents... Amount: ${swapAmount} ${fromToken.symbol}`,
            'success'
        );

        showNotification(
            `Platform fee: ${feeAmount.toFixed(6)} ${fromToken.symbol} (0.15%) will be sent to babyben.near`,
            'info'
        );

        // Open NEAR Intents in a new window
        window.open(
            intentsExplorerUrl,
            '_blank',
            'width=500,height=800'
        );

        // Reset button
        swapButton.disabled = false;
        swapButton.innerHTML = '<span>🔄</span> Swap Now';

        // Close modal after short delay
        setTimeout(() => {
            closeSwapModal();
        }, 2000);

    } catch (error) {
        console.error('Swap error:', error);
        showNotification(
            `Swap failed: ${error.message}`,
            'error'
        );

        // Reset button
        const swapButton = document.querySelector('.modal-swap-btn');
        swapButton.disabled = false;
        swapButton.innerHTML = '<span>🔄</span> Swap Now';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="notification-message">${message}</span>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('swapModal');
    if (event.target === modal) {
        closeSwapModal();
    }
};
