// ===== TRADINGVIEW CHART INTEGRATION =====

// Symbol mapping for TradingView
const tvSymbolMap = {
    // Stocks (NASDAQ)
    stocks: {
        'AAPL': 'NASDAQ:AAPL',
        'MSFT': 'NASDAQ:MSFT',
        'GOOGL': 'NASDAQ:GOOGL',
        'AMZN': 'NASDAQ:AMZN',
        'NVDA': 'NASDAQ:NVDA',
        'META': 'NASDAQ:META',
        'TSLA': 'NASDAQ:TSLA',
        'AVGO': 'NASDAQ:AVGO',
        'COST': 'NASDAQ:COST',
        'NFLX': 'NASDAQ:NFLX',
        'AMD': 'NASDAQ:AMD',
        'ADBE': 'NASDAQ:ADBE',
        'PEP': 'NASDAQ:PEP',
        'CSCO': 'NASDAQ:CSCO',
        'INTC': 'NASDAQ:INTC',
        'CMCSA': 'NASDAQ:CMCSA',
        'TMUS': 'NASDAQ:TMUS',
        'INTU': 'NASDAQ:INTU',
        'TXN': 'NASDAQ:TXN',
        'QCOM': 'NASDAQ:QCOM',
        'AMGN': 'NASDAQ:AMGN',
        'ISRG': 'NASDAQ:ISRG',
        'HON': 'NASDAQ:HON',
        'BKNG': 'NASDAQ:BKNG',
        'AMAT': 'NASDAQ:AMAT',
        'SBUX': 'NASDAQ:SBUX',
        'VRTX': 'NASDAQ:VRTX',
        'GILD': 'NASDAQ:GILD',
        'ADI': 'NASDAQ:ADI',
        'MDLZ': 'NASDAQ:MDLZ',
        'ADP': 'NASDAQ:ADP',
        'REGN': 'NASDAQ:REGN',
        'PANW': 'NASDAQ:PANW',
        'LRCX': 'NASDAQ:LRCX',
        'MU': 'NASDAQ:MU',
        'KLAC': 'NASDAQ:KLAC',
        'SNPS': 'NASDAQ:SNPS',
        'CDNS': 'NASDAQ:CDNS',
        'MELI': 'NASDAQ:MELI',
        'PYPL': 'NASDAQ:PYPL',
        'ORLY': 'NASDAQ:ORLY',
        'MAR': 'NASDAQ:MAR',
        'CTAS': 'NASDAQ:CTAS',
        'ASML': 'NASDAQ:ASML',
        'MNST': 'NASDAQ:MNST',
        'CSX': 'NASDAQ:CSX',
        'ABNB': 'NASDAQ:ABNB',
        'PCAR': 'NASDAQ:PCAR',
        'MRVL': 'NASDAQ:MRVL',
        'FTNT': 'NASDAQ:FTNT',
        'NXPI': 'NASDAQ:NXPI',
        'DXCM': 'NASDAQ:DXCM',
        'WDAY': 'NASDAQ:WDAY',
        'AZN': 'NASDAQ:AZN',
        'CPRT': 'NASDAQ:CPRT',
        'LULU': 'NASDAQ:LULU',
        'MCHP': 'NASDAQ:MCHP',
        'KDP': 'NASDAQ:KDP',
        'ROST': 'NASDAQ:ROST',
        'PAYX': 'NASDAQ:PAYX',
        'AEP': 'NASDAQ:AEP',
        'ODFL': 'NASDAQ:ODFL',
        'CHTR': 'NASDAQ:CHTR',
        'IDXX': 'NASDAQ:IDXX',
        'KHC': 'NASDAQ:KHC',
        'FAST': 'NASDAQ:FAST',
        'VRSK': 'NASDAQ:VRSK',
        'EXC': 'NASDAQ:EXC',
        'EA': 'NASDAQ:EA',
        'CSGP': 'NASDAQ:CSGP',
        'CTSH': 'NASDAQ:CTSH',
        'XEL': 'NASDAQ:XEL',
        'GEHC': 'NASDAQ:GEHC',
        'ON': 'NASDAQ:ON',
        'ANSS': 'NASDAQ:ANSS',
        'ZS': 'NASDAQ:ZS',
        'DDOG': 'NASDAQ:DDOG',
        'TTWO': 'NASDAQ:TTWO',
        'CDW': 'NASDAQ:CDW',
        'ILMN': 'NASDAQ:ILMN',
        'BKR': 'NASDAQ:BKR',
        'GFS': 'NASDAQ:GFS',
        'TEAM': 'NASDAQ:TEAM',
        'WBD': 'NASDAQ:WBD',
        'FANG': 'NASDAQ:FANG',
        'MRNA': 'NASDAQ:MRNA',
        'DLTR': 'NASDAQ:DLTR',
        'ALGN': 'NASDAQ:ALGN',
        'WBA': 'NASDAQ:WBA',
        'EBAY': 'NASDAQ:EBAY',
        'ENPH': 'NASDAQ:ENPH',
        'ZM': 'NASDAQ:ZM',
        'SIRI': 'NASDAQ:SIRI',
        'LCID': 'NASDAQ:LCID',
        'RIVN': 'NASDAQ:RIVN',
        'CEG': 'NASDAQ:CEG',
        'SPLK': 'NASDAQ:SPLK',
        'BIIB': 'NASDAQ:BIIB',
        'CRWD': 'NASDAQ:CRWD'
    },

    // Cryptocurrencies
    crypto: {
        'bitcoin': 'BINANCE:BTCUSDT',
        'ethereum': 'BINANCE:ETHUSDT',
        'tether': 'BINANCE:USDTUSD',
        'binancecoin': 'BINANCE:BNBUSDT',
        'solana': 'BINANCE:SOLUSDT',
        'ripple': 'BINANCE:XRPUSDT',
        'usd-coin': 'COINBASE:USDCUSD',
        'cardano': 'BINANCE:ADAUSDT',
        'avalanche-2': 'BINANCE:AVAXUSDT',
        'dogecoin': 'BINANCE:DOGEUSDT',
        'polkadot': 'BINANCE:DOTUSDT',
        'tron': 'BINANCE:TRXUSDT',
        'chainlink': 'BINANCE:LINKUSDT',
        'polygon': 'BINANCE:MATICUSDT',
        'shiba-inu': 'BINANCE:SHIBUSDT',
        'litecoin': 'BINANCE:LTCUSDT',
        'bitcoin-cash': 'BINANCE:BCHUSDT',
        'uniswap': 'BINANCE:UNIUSDT',
        'stellar': 'BINANCE:XLMUSDT',
        'monero': 'BINANCE:XMRUSDT',
        'ethereum-classic': 'BINANCE:ETCUSDT',
        'cosmos': 'BINANCE:ATOMUSDT',
        'filecoin': 'BINANCE:FILUSDT',
        'internet-computer': 'BINANCE:ICPUSDT',
        'hedera-hashgraph': 'BINANCE:HBARUSDT',
        'vechain': 'BINANCE:VETUSDT',
        'aptos': 'BINANCE:APTUSDT',
        'arbitrum': 'BINANCE:ARBUSDT',
        'optimism': 'BINANCE:OPUSDT',
        'near': 'BINANCE:NEARUSDT',
        'aave': 'BINANCE:AAVEUSDT',
        'the-graph': 'BINANCE:GRTUSDT',
        'algorand': 'BINANCE:ALGOUSDT',
        'fantom': 'BINANCE:FTMUSDT',
        'flow': 'BINANCE:FLOWUSDT',
        'decentraland': 'BINANCE:MANAUSDT',
        'the-sandbox': 'BINANCE:SANDUSDT',
        'axie-infinity': 'BINANCE:AXSUSDT',
        'eos': 'BINANCE:EOSUSDT',
        'theta-token': 'BINANCE:THETAUSDT',
        'elrond-erd-2': 'BINANCE:EGLDUSDT',
        'tezos': 'BINANCE:XTZUSDT',
        'maker': 'BINANCE:MKRUSDT',
        'neo': 'BINANCE:NEOUSDT',
        'iota': 'BINANCE:IOTAUSDT',
        'zcash': 'BINANCE:ZECUSDT',
        'dash': 'BINANCE:DASHUSDT',
        'compound': 'BINANCE:COMPUSDT',
        'yearn-finance': 'BINANCE:YFIUSDT',
        'sushi': 'BINANCE:SUSHIUSDT'
    },

    // Commodities
    commodities: {
        // Precious Metals
        'XAU': 'TVC:GOLD',
        'XAG': 'TVC:SILVER',
        'XPT': 'TVC:PLATINUM',
        'XPD': 'NYMEX:PA1!',
        'XRH': 'NYMEX:PA1!', // Rhodium approximation

        // Energy
        'CL': 'NYMEX:CL1!',
        'BZ': 'NYMEX:BB1!',
        'NG': 'NYMEX:NG1!',
        'HO': 'NYMEX:HO1!',
        'RB': 'NYMEX:RB1!',
        'UX': 'COMEX:UX1!',

        // Agriculture
        'ZC': 'CBOT:ZC1!',
        'ZW': 'CBOT:ZW1!',
        'ZS': 'CBOT:ZS1!',
        'KC': 'NYMEX:KC1!',
        'SB': 'NYMEX:SB1!',
        'CT': 'NYMEX:CT1!',
        'CC': 'NYMEX:CC1!',
        'OJ': 'NYMEX:OJ1!',
        'ZO': 'CBOT:ZO1!',
        'ZR': 'CBOT:ZR1!',

        // Livestock
        'LE': 'CME:LE1!',
        'GF': 'CME:GF1!',
        'HE': 'CME:HE1!',

        // Industrial Metals
        'HG': 'COMEX:HG1!',
        'ALI': 'COMEX:ALI1!',
        'LBS': 'CME:LBS1!'
    }
};

// Current chart state
let tvChartState = {
    symbol: null,
    interval: '60',
    assetType: null,
    widget: null
};

// Format price for display
function formatTvPrice(price) {
    if (price >= 10000) {
        return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
        return '$' + price.toFixed(2);
    } else if (price >= 0.01) {
        return '$' + price.toFixed(4);
    } else {
        return '$' + price.toFixed(8);
    }
}

// Format large numbers
function formatLargeNumber(num) {
    if (!num || isNaN(num)) return '-';
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(2) + 'K';
    return '$' + num.toFixed(2);
}

// Get TradingView symbol
function getTvSymbol(symbol, assetType) {
    const symbolMap = tvSymbolMap[assetType];
    if (symbolMap && symbolMap[symbol]) {
        return symbolMap[symbol];
    }

    // Fallback mappings
    if (assetType === 'stocks') {
        return `NASDAQ:${symbol}`;
    } else if (assetType === 'crypto') {
        return `BINANCE:${symbol.toUpperCase()}USDT`;
    } else if (assetType === 'commodities') {
        return `TVC:${symbol}`;
    }

    return symbol;
}

// Create TradingView Widget
function createTvWidget(symbol, interval) {
    const container = document.getElementById('tvWidgetContainer');
    if (!container) return;

    // Clear previous widget
    container.innerHTML = `
        <div class="tv-chart-loading">
            <div class="spinner"></div>
            <span>Loading chart...</span>
        </div>
    `;

    // Small delay to show loading state
    setTimeout(() => {
        container.innerHTML = '';

        // Create new TradingView widget
        try {
            tvChartState.widget = new TradingView.widget({
                "width": "100%",
                "height": "100%",
                "symbol": symbol,
                "interval": interval,
                "timezone": "Etc/UTC",
                "theme": "dark",
                "style": "1", // Candlestick
                "locale": "en",
                "toolbar_bg": "#131722",
                "enable_publishing": false,
                "hide_top_toolbar": false,
                "hide_legend": false,
                "save_image": true,
                "container_id": "tvWidgetContainer",
                "hide_volume": false,
                "studies": [
                    "MASimple@tv-basicstudies",
                    "Volume@tv-basicstudies"
                ],
                "show_popup_button": false,
                "popup_width": "1000",
                "popup_height": "650",
                "allow_symbol_change": false,
                "watchlist": [],
                "details": false,
                "hotlist": false,
                "calendar": false,
                "news": [],
                "withdateranges": true,
                "hide_side_toolbar": true,
                "backgroundColor": "#131722",
                "gridColor": "rgba(255, 255, 255, 0.05)"
            });
        } catch (e) {
            console.log('TradingView widget error:', e);
            container.innerHTML = `
                <div class="tv-chart-loading">
                    <span style="color: #EF4444;">Chart unavailable for this asset</span>
                    <span style="font-size: 0.8rem; opacity: 0.6; margin-top: 8px;">Try a different timeframe or asset</span>
                </div>
            `;
        }
    }, 300);
}

// Open chart modal
function openTvChart(assetData) {
    const modal = document.getElementById('tvChartModal');
    if (!modal) return;

    // Store current state
    tvChartState.symbol = assetData.symbol;
    tvChartState.assetType = assetData.type;

    // Update modal content
    document.getElementById('tvAssetIcon').textContent = assetData.icon || '📊';
    document.getElementById('tvAssetName').textContent = assetData.name;
    document.getElementById('tvAssetSymbol').textContent = assetData.symbol;
    document.getElementById('tvCurrentPrice').textContent = formatTvPrice(assetData.price);

    // Update price change
    const changeEl = document.getElementById('tvPriceChange');
    const changeValue = assetData.change || 0;
    changeEl.textContent = (changeValue >= 0 ? '+' : '') + changeValue.toFixed(2) + '%';
    changeEl.className = 'tv-price-change ' + (changeValue >= 0 ? 'positive' : 'negative');

    // Update stats
    document.getElementById('tvOpen').textContent = assetData.open ? formatTvPrice(assetData.open, assetData.type) : '-';
    document.getElementById('tvHigh').textContent = assetData.high ? formatTvPrice(assetData.high, assetData.type) : '-';
    document.getElementById('tvLow').textContent = assetData.low ? formatTvPrice(assetData.low, assetData.type) : '-';
    document.getElementById('tvVolume').textContent = assetData.volume ? formatLargeNumber(assetData.volume) : '-';
    document.getElementById('tvMarketCap').textContent = assetData.marketCap ? formatLargeNumber(assetData.marketCap) : '-';

    // Update timestamp
    document.getElementById('tvLastUpdated').textContent = 'Updated: ' + new Date().toLocaleTimeString();

    // Reset to default timeframe
    tvChartState.interval = '60';
    document.querySelectorAll('.tv-timeframe-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.interval === '60');
    });

    // Get TradingView symbol and create widget
    const tvSymbol = getTvSymbol(assetData.symbol, assetData.type);
    createTvWidget(tvSymbol, tvChartState.interval);

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close chart modal
function closeTvChart() {
    const modal = document.getElementById('tvChartModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';

        // Clear widget
        const container = document.getElementById('tvWidgetContainer');
        if (container) container.innerHTML = '';
        tvChartState.widget = null;
    }
}

// Handle timeframe change
function changeTimeframe(interval) {
    tvChartState.interval = interval;

    // Update active button
    document.querySelectorAll('.tv-timeframe-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.interval === interval);
    });

    // Recreate widget with new interval
    const tvSymbol = getTvSymbol(tvChartState.symbol, tvChartState.assetType);
    createTvWidget(tvSymbol, interval);
}

// Extract asset data from card element
function extractAssetData(card, type) {
    const data = {
        type: type,
        symbol: '',
        name: '',
        price: 0,
        change: 0,
        icon: '📊'
    };

    if (type === 'stocks') {
        data.symbol = card.dataset.symbol || card.querySelector('.asset-symbol')?.textContent || '';
        data.name = card.querySelector('.asset-name')?.textContent || data.symbol;
        const priceText = card.querySelector('.asset-price')?.textContent || '0';
        data.price = parseFloat(priceText.replace(/[$,]/g, '')) || 0;
        const changeEl = card.querySelector('.price-change');
        if (changeEl) {
            const changeMatch = changeEl.textContent.match(/([+-]?\d+\.?\d*)%/);
            data.change = changeMatch ? parseFloat(changeMatch[1]) : 0;
        }
        data.icon = '📈';
    } else if (type === 'crypto') {
        data.symbol = card.dataset.id || card.dataset.symbol?.toLowerCase() || '';
        data.name = card.querySelector('.asset-name')?.textContent || data.symbol;
        const priceText = card.querySelector('.asset-price')?.textContent || '0';
        data.price = parseFloat(priceText.replace(/[$,]/g, '')) || 0;
        const changeEl = card.querySelector('.price-change');
        if (changeEl) {
            const changeMatch = changeEl.textContent.match(/([+-]?\d+\.?\d*)%/);
            data.change = changeMatch ? parseFloat(changeMatch[1]) : 0;
        }
        data.icon = '₿';
        // Get crypto icon if available
        const iconImg = card.querySelector('.crypto-icon');
        if (iconImg) {
            data.iconUrl = iconImg.src;
        }
    } else if (type === 'commodities') {
        data.symbol = card.dataset.symbol || '';
        data.name = card.querySelector('.commodity-name')?.textContent || data.symbol;
        const priceText = card.querySelector('.commodity-price')?.textContent || '0';
        data.price = parseFloat(priceText.replace(/[$,]/g, '')) || 0;
        const changeText = card.querySelector('.commodity-change')?.textContent || '0';
        const changeMatch = changeText.match(/([+-]?\d+\.?\d*)%/);
        data.change = changeMatch ? parseFloat(changeMatch[1]) : 0;
        data.icon = card.querySelector('.commodity-icon')?.textContent || '🥇';
    } else if (type === 'featured-commodity') {
        // Featured precious metals cards
        const cardId = card.id || '';
        if (cardId.includes('gold')) {
            data.symbol = 'XAU';
            data.name = 'Gold';
            data.icon = '🥇';
        } else if (cardId.includes('silver')) {
            data.symbol = 'XAG';
            data.name = 'Silver';
            data.icon = '🥈';
        } else if (cardId.includes('platinum')) {
            data.symbol = 'XPT';
            data.name = 'Platinum';
            data.icon = '⚪';
        } else if (cardId.includes('palladium')) {
            data.symbol = 'XPD';
            data.name = 'Palladium';
            data.icon = '🔘';
        }
        const priceText = card.querySelector('.price')?.textContent || '0';
        data.price = parseFloat(priceText.replace(/[$,]/g, '')) || 0;
        const changeText = card.querySelector('.change')?.textContent || '0';
        const changeMatch = changeText.match(/([+-]?\d+\.?\d*)%/);
        data.change = changeMatch ? parseFloat(changeMatch[1]) : 0;
        data.type = 'commodities';
    }

    return data;
}

// Initialize TradingView chart functionality
function initTvChart() {
    // Close button
    document.getElementById('tvCloseBtn')?.addEventListener('click', closeTvChart);

    // Overlay click to close
    document.querySelector('.tv-chart-overlay')?.addEventListener('click', closeTvChart);

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeTvChart();
    });

    // Timeframe buttons
    document.querySelectorAll('.tv-timeframe-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            changeTimeframe(btn.dataset.interval);
        });
    });

    // Add click handlers for stock cards
    document.getElementById('stocksContainer')?.addEventListener('click', (e) => {
        const card = e.target.closest('.stock-card');
        if (card) {
            const assetData = extractAssetData(card, 'stocks');
            if (assetData.symbol) openTvChart(assetData);
        }
    });

    // Add click handlers for crypto cards
    document.getElementById('cryptoContainer')?.addEventListener('click', (e) => {
        const card = e.target.closest('.crypto-card');
        if (card) {
            const assetData = extractAssetData(card, 'crypto');
            if (assetData.symbol) openTvChart(assetData);
        }
    });

    // Add click handlers for commodity cards
    document.querySelectorAll('.commodities-grid').forEach(container => {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.commodity-card');
            if (card) {
                const assetData = extractAssetData(card, 'commodities');
                if (assetData.symbol) openTvChart(assetData);
            }
        });
    });

    // Add click handlers for featured precious metals
    document.querySelectorAll('.featured-card').forEach(card => {
        card.addEventListener('click', () => {
            const assetData = extractAssetData(card, 'featured-commodity');
            if (assetData.symbol) openTvChart(assetData);
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initTvChart, 800);
});
