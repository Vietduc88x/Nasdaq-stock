// ===== IMPROVED SAVINGS METHODOLOGY CALCULATOR (USD) =====

// Format number to USD currency
function formatUSD(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.round(amount));
}

// Global state
let savingsState = {
    monthlyIncome: 3000,
    otherIncome: 500,
    livingExpenses: 800,
    transportExpenses: 200,
    discretionaryExpenses: 300,
    otherExpenses: 200,
    emergencySlider: 50,
    sinkingSlider: 25,
    investmentSlider: 25,
    sinkingGoal: 5000,
    cryptoValue: 0,
    stockValue: 0,
    realEstateValue: 0,
    bondsValue: 0
};

// Calculate total income
function getTotalIncome() {
    return savingsState.monthlyIncome + savingsState.otherIncome;
}

// Calculate total expenses
function getTotalExpenses() {
    return savingsState.livingExpenses + savingsState.transportExpenses +
           savingsState.discretionaryExpenses + savingsState.otherExpenses;
}

// Calculate available savings
function getAvailableSavings() {
    return getTotalIncome() - getTotalExpenses();
}

// Update income display
function updateIncomeDisplay() {
    const total = getTotalIncome();
    document.getElementById('totalIncome').textContent = formatUSD(total);
    document.getElementById('summaryIncome').textContent = formatUSD(total);
}

// Update expenses display
function updateExpensesDisplay() {
    const total = getTotalExpenses();
    const available = getAvailableSavings();

    document.getElementById('totalExpenses').textContent = formatUSD(total);
    document.getElementById('availableSavings').textContent = formatUSD(available);
    document.getElementById('availableForAllocation').textContent = available.toLocaleString();
    document.getElementById('expensesForGoals').textContent = total.toLocaleString();

    // Update summary
    document.getElementById('summaryExpenses').textContent = formatUSD(total);
    document.getElementById('summaryLiving').textContent = savingsState.livingExpenses.toLocaleString();
    document.getElementById('summaryTransport').textContent = savingsState.transportExpenses.toLocaleString();
    document.getElementById('summaryDiscretionary').textContent = savingsState.discretionaryExpenses.toLocaleString();
    document.getElementById('summaryOtherExp').textContent = savingsState.otherExpenses.toLocaleString();
}

// Update allocation sliders
function updateAllocationDisplay() {
    const available = getAvailableSavings();

    // Calculate amounts
    const emergencyAmount = (available * savingsState.emergencySlider) / 100;
    const sinkingAmount = (available * savingsState.sinkingSlider) / 100;
    const investmentAmount = (available * savingsState.investmentSlider) / 100;

    // Update displays
    document.getElementById('emergencyPercent').textContent = savingsState.emergencySlider + '%';
    document.getElementById('emergencyAmount').textContent = formatUSD(emergencyAmount);

    document.getElementById('sinkingPercent').textContent = savingsState.sinkingSlider + '%';
    document.getElementById('sinkingAmount').textContent = formatUSD(sinkingAmount);

    document.getElementById('investmentPercent').textContent = savingsState.investmentSlider + '%';
    document.getElementById('investmentAmount').textContent = formatUSD(investmentAmount);

    // Update summary
    document.getElementById('summaryEmergency').textContent = emergencyAmount.toLocaleString();
    document.getElementById('summarySinking').textContent = sinkingAmount.toLocaleString();
    document.getElementById('summaryInvestment').textContent = investmentAmount.toLocaleString();
    document.getElementById('summarySavings').textContent = formatUSD(available);

    // Update allocation status
    const totalAllocated = savingsState.emergencySlider + savingsState.sinkingSlider + savingsState.investmentSlider;
    const unallocated = 100 - totalAllocated;
    const unallocatedAmount = (available * unallocated) / 100;

    document.getElementById('allocationBar').style.width = totalAllocated + '%';
    document.getElementById('allocationStatus').textContent = 'Allocated: ' + totalAllocated + '%';
    document.getElementById('unallocatedAmount').textContent = formatUSD(unallocatedAmount) + ' unallocated';
    document.getElementById('unallocatedAmount').className = unallocated === 0 ? 'success' : (unallocated < 0 ? 'danger' : '');

    // Update slider backgrounds
    updateSliderBackground('emergencySlider', savingsState.emergencySlider);
    updateSliderBackground('sinkingSlider', savingsState.sinkingSlider);
    updateSliderBackground('investmentSlider', savingsState.investmentSlider);

    // Update goals table
    updateGoalsTable(emergencyAmount, sinkingAmount, investmentAmount);
}

// Update slider background for visual feedback
function updateSliderBackground(sliderId, value) {
    const slider = document.getElementById(sliderId);
    if (slider) {
        slider.style.background = `linear-gradient(to right, var(--primary-blue) 0%, var(--primary-blue) ${value}%, var(--border-color) ${value}%, var(--border-color) 100%)`;
    }
}

// Update goals table
function updateGoalsTable(emergencyMonthly, sinkingMonthly, investmentMonthly) {
    const expenses = getTotalExpenses();

    // Emergency Fund (6 months)
    const emergencyTarget = expenses * 6;
    const emergencyMonths = emergencyMonthly > 0 ? Math.ceil(emergencyTarget / emergencyMonthly) : 0;

    document.getElementById('emergencyTarget').textContent = formatUSD(emergencyTarget);
    document.getElementById('emergencyContribution').textContent = formatUSD(emergencyMonthly);
    document.getElementById('emergencyTime').textContent = emergencyMonths > 0 ? emergencyMonths + ' months' : '-';

    // Sinking Funds
    const sinkingTarget = savingsState.sinkingGoal;
    const sinkingMonths = sinkingMonthly > 0 ? Math.ceil(sinkingTarget / sinkingMonthly) : 0;

    document.getElementById('sinkingContribution').textContent = formatUSD(sinkingMonthly);
    document.getElementById('sinkingTime').textContent = sinkingMonths > 0 ? sinkingMonths + ' months' : '-';

    // Financial Security (12 months)
    const securityTarget = expenses * 12;
    document.getElementById('securityTarget').textContent = formatUSD(securityTarget);

    // Financial Independence (25x annual expenses)
    const annualExpenses = expenses * 12;
    const independenceTarget = annualExpenses * 25;
    const yearsToFI = investmentMonthly > 0 ? Math.round((independenceTarget / (investmentMonthly * 12)) / 1.07) : 0;  // rough estimate with 7% return

    document.getElementById('independenceTarget').textContent = formatUSD(independenceTarget);
    document.getElementById('investmentContribution').textContent = formatUSD(investmentMonthly);
    document.getElementById('independenceTime').textContent = yearsToFI > 0 ? '~' + yearsToFI + ' years*' : '-';

    // Update savings rate
    updateSavingsRate();
}

// Update savings rate
function updateSavingsRate() {
    const income = getTotalIncome();
    const expenses = getTotalExpenses();
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    document.getElementById('savingsRate').textContent = Math.round(savingsRate) + '%';

    let desc = '';
    if (savingsRate >= 50) {
        desc = 'Excellent! You\'re on track to financial independence';
    } else if (savingsRate >= 30) {
        desc = 'Great job! You\'re building wealth steadily';
    } else if (savingsRate >= 15) {
        desc = 'Good start! Try to increase your savings rate';
    } else {
        desc = 'Consider reducing expenses to increase savings';
    }

    document.getElementById('savingsRateDesc').textContent = desc;
}

// Update portfolio
function updatePortfolio() {
    const crypto = savingsState.cryptoValue;
    const stocks = savingsState.stockValue;
    const realEstate = savingsState.realEstateValue;
    const bonds = savingsState.bondsValue;

    const total = crypto + stocks + realEstate + bonds;
    document.getElementById('totalPortfolioValue').textContent = formatUSD(total);

    if (total === 0) {
        document.getElementById('cryptoPercent').textContent = '0%';
        document.getElementById('stocksPercent').textContent = '0%';
        document.getElementById('realEstatePercent').textContent = '0%';
        document.getElementById('bondsPercent').textContent = '0%';
        document.getElementById('rebalanceText').textContent = 'Enter your portfolio values to get personalized recommendations';
        return;
    }

    const cryptoPercent = (crypto / total) * 100;
    const stocksPercent = (stocks / total) * 100;
    const realEstatePercent = (realEstate / total) * 100;
    const bondsPercent = (bonds / total) * 100;

    document.getElementById('cryptoPercent').textContent = cryptoPercent.toFixed(1) + '%';
    document.getElementById('stocksPercent').textContent = stocksPercent.toFixed(1) + '%';
    document.getElementById('realEstatePercent').textContent = realEstatePercent.toFixed(1) + '%';
    document.getElementById('bondsPercent').textContent = bondsPercent.toFixed(1) + '%';

    // Provide recommendations
    let recommendation = '';
    if (cryptoPercent > 20) {
        recommendation = '⚠️ High crypto allocation (' + cryptoPercent.toFixed(1) + '%). Consider reducing to <20% for lower risk.';
    } else if (stocksPercent < 40 && realEstatePercent < 30) {
        recommendation = '💡 Low growth assets. Consider increasing stocks or real estate for long-term wealth building.';
    } else if (bondsPercent < 10 && total > 10000) {
        recommendation = '🏦 Consider adding bonds/cash (10-20%) for stability and emergency access.';
    } else {
        recommendation = '✅ Balanced portfolio! Crypto: ' + cryptoPercent.toFixed(1) + '%, Stocks: ' + stocksPercent.toFixed(1) + '%, Real Estate: ' + realEstatePercent.toFixed(1) + '%, Bonds: ' + bondsPercent.toFixed(1) + '%';
    }

    document.getElementById('rebalanceText').textContent = recommendation;
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('savingsStateV2', JSON.stringify(savingsState));
}

// Load from localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('savingsStateV2');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            savingsState = { ...savingsState, ...loaded };

            // Ensure allocation sliders always total exactly 100%
            const totalAllocation = savingsState.emergencySlider + savingsState.sinkingSlider + savingsState.investmentSlider;
            if (totalAllocation !== 100) {
                // Reset to default balanced allocation
                savingsState.emergencySlider = 50;
                savingsState.sinkingSlider = 25;
                savingsState.investmentSlider = 25;
            }

            // Update all inputs with loaded values
            document.getElementById('monthlyIncome').value = savingsState.monthlyIncome;
            document.getElementById('otherIncome').value = savingsState.otherIncome;
            document.getElementById('livingExpenses').value = savingsState.livingExpenses;
            document.getElementById('transportExpenses').value = savingsState.transportExpenses;
            document.getElementById('discretionaryExpenses').value = savingsState.discretionaryExpenses;
            document.getElementById('otherExpenses').value = savingsState.otherExpenses;
            document.getElementById('emergencySlider').value = savingsState.emergencySlider;
            document.getElementById('sinkingSlider').value = savingsState.sinkingSlider;
            document.getElementById('investmentSlider').value = savingsState.investmentSlider;
            document.getElementById('sinkingGoal').value = savingsState.sinkingGoal;
            document.getElementById('cryptoValue').value = savingsState.cryptoValue;
            document.getElementById('stockValue').value = savingsState.stockValue;
            document.getElementById('realEstateValue').value = savingsState.realEstateValue;
            document.getElementById('bondsValue').value = savingsState.bondsValue;
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Initialize all event listeners
function initSavingsCalculatorV2() {
    // Income inputs
    document.getElementById('monthlyIncome').addEventListener('input', (e) => {
        savingsState.monthlyIncome = parseFloat(e.target.value) || 0;
        updateAll();
        saveToLocalStorage();
    });

    document.getElementById('otherIncome').addEventListener('input', (e) => {
        savingsState.otherIncome = parseFloat(e.target.value) || 0;
        updateAll();
        saveToLocalStorage();
    });

    // Expense inputs
    document.getElementById('livingExpenses').addEventListener('input', (e) => {
        savingsState.livingExpenses = parseFloat(e.target.value) || 0;
        updateAll();
        saveToLocalStorage();
    });

    document.getElementById('transportExpenses').addEventListener('input', (e) => {
        savingsState.transportExpenses = parseFloat(e.target.value) || 0;
        updateAll();
        saveToLocalStorage();
    });

    document.getElementById('discretionaryExpenses').addEventListener('input', (e) => {
        savingsState.discretionaryExpenses = parseFloat(e.target.value) || 0;
        updateAll();
        saveToLocalStorage();
    });

    document.getElementById('otherExpenses').addEventListener('input', (e) => {
        savingsState.otherExpenses = parseFloat(e.target.value) || 0;
        updateAll();
        saveToLocalStorage();
    });

    // Allocation sliders - auto-adjust others to maintain 100% total
    document.getElementById('emergencySlider').addEventListener('input', (e) => {
        const newValue = parseFloat(e.target.value) || 0;
        savingsState.emergencySlider = Math.min(newValue, 100);

        // Auto-adjust sinking and investment to maintain 100%
        const remaining = 100 - savingsState.emergencySlider;
        const currentOthers = savingsState.sinkingSlider + savingsState.investmentSlider;

        if (currentOthers > 0 && remaining >= 0) {
            // Distribute remaining proportionally
            const ratio = remaining / currentOthers;
            savingsState.sinkingSlider = Math.round(savingsState.sinkingSlider * ratio);
            savingsState.investmentSlider = 100 - savingsState.emergencySlider - savingsState.sinkingSlider;
        } else if (remaining >= 0) {
            // Split remaining between the two
            savingsState.sinkingSlider = Math.round(remaining / 2);
            savingsState.investmentSlider = remaining - savingsState.sinkingSlider;
        } else {
            savingsState.sinkingSlider = 0;
            savingsState.investmentSlider = 0;
        }

        // Update slider positions
        document.getElementById('sinkingSlider').value = savingsState.sinkingSlider;
        document.getElementById('investmentSlider').value = savingsState.investmentSlider;

        updateAllocationDisplay();
        saveToLocalStorage();
    });

    document.getElementById('sinkingSlider').addEventListener('input', (e) => {
        const newValue = parseFloat(e.target.value) || 0;
        const maxAllowed = 100 - savingsState.emergencySlider;
        savingsState.sinkingSlider = Math.min(newValue, maxAllowed);

        // Auto-adjust investment to maintain 100%
        savingsState.investmentSlider = 100 - savingsState.emergencySlider - savingsState.sinkingSlider;

        // Update slider position
        e.target.value = savingsState.sinkingSlider;
        document.getElementById('investmentSlider').value = savingsState.investmentSlider;

        updateAllocationDisplay();
        saveToLocalStorage();
    });

    document.getElementById('investmentSlider').addEventListener('input', (e) => {
        const newValue = parseFloat(e.target.value) || 0;
        const maxAllowed = 100 - savingsState.emergencySlider;
        savingsState.investmentSlider = Math.min(newValue, maxAllowed);

        // Auto-adjust sinking to maintain 100%
        savingsState.sinkingSlider = 100 - savingsState.emergencySlider - savingsState.investmentSlider;

        // Update slider position
        e.target.value = savingsState.investmentSlider;
        document.getElementById('sinkingSlider').value = savingsState.sinkingSlider;

        updateAllocationDisplay();
        saveToLocalStorage();
    });

    // Sinking goal
    document.getElementById('sinkingGoal').addEventListener('input', (e) => {
        savingsState.sinkingGoal = parseFloat(e.target.value) || 0;
        updateAllocationDisplay();
        saveToLocalStorage();
    });

    // Portfolio inputs
    document.getElementById('cryptoValue').addEventListener('input', (e) => {
        savingsState.cryptoValue = parseFloat(e.target.value) || 0;
        updatePortfolio();
        saveToLocalStorage();
    });

    document.getElementById('stockValue').addEventListener('input', (e) => {
        savingsState.stockValue = parseFloat(e.target.value) || 0;
        updatePortfolio();
        saveToLocalStorage();
    });

    document.getElementById('realEstateValue').addEventListener('input', (e) => {
        savingsState.realEstateValue = parseFloat(e.target.value) || 0;
        updatePortfolio();
        saveToLocalStorage();
    });

    document.getElementById('bondsValue').addEventListener('input', (e) => {
        savingsState.bondsValue = parseFloat(e.target.value) || 0;
        updatePortfolio();
        saveToLocalStorage();
    });

    // Initial calculations
    updateAll();
}

// Update all calculations
function updateAll() {
    updateIncomeDisplay();
    updateExpensesDisplay();
    updateAllocationDisplay();
    updatePortfolio();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure DOM is fully loaded
    setTimeout(() => {
        // Clear old corrupted data if version mismatch
        const version = localStorage.getItem('savingsStateVersion');
        if (version !== '2.1') {
            localStorage.removeItem('savingsStateV2');
            localStorage.setItem('savingsStateVersion', '2.1');
        }
        loadFromLocalStorage();
        initSavingsCalculatorV2();
    }, 500);
});
