// ===== SAVINGS METHODOLOGY CALCULATOR =====

// Format number to VND currency
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' VND';
}

// Calculate and update all savings values
function updateSavingsCalculations() {
    // Get income values
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;
    const totalIncome = monthlyIncome + otherIncome;

    // Update total income display
    document.getElementById('totalIncome').textContent = formatVND(totalIncome);
    document.getElementById('summaryIncome').textContent = formatVND(totalIncome);

    // Get allocation percentages
    const spendingPercent = parseFloat(document.getElementById('monthlySpending').value) || 0;
    const emergencyPercent = parseFloat(document.getElementById('emergencyFund').value) || 0;
    const otherPercent = parseFloat(document.getElementById('otherExpenses').value) || 0;

    // Calculate amounts
    const spendingAmount = (totalIncome * spendingPercent) / 100;
    const emergencyAmount = (totalIncome * emergencyPercent) / 100;
    const otherAmount = (totalIncome * otherPercent) / 100;

    // Update slider displays
    document.getElementById('monthlySpendingValue').textContent = spendingPercent.toFixed(2) + '%';
    document.getElementById('monthlySpendingAmount').textContent = formatVND(spendingAmount);
    document.getElementById('summarySpending').textContent = formatVND(spendingAmount);

    document.getElementById('emergencyFundValue').textContent = emergencyPercent.toFixed(2) + '%';
    document.getElementById('emergencyFundAmount').textContent = formatVND(emergencyAmount);
    document.getElementById('summaryEmergency').textContent = formatVND(emergencyAmount);

    document.getElementById('otherExpensesValue').textContent = otherPercent.toFixed(2) + '%';
    document.getElementById('otherExpensesAmount').textContent = formatVND(otherAmount);
    document.getElementById('summaryOther').textContent = formatVND(otherAmount);

    // Calculate total allocated
    const totalAllocated = spendingPercent + emergencyPercent + otherPercent;
    const remaining = totalIncome - (spendingAmount + emergencyAmount + otherAmount);

    document.getElementById('totalAllocatedPercent').textContent = totalAllocated.toFixed(2) + '%';
    document.getElementById('remainingAmount').textContent = formatVND(remaining);
    document.getElementById('summaryNetSavings').textContent = formatVND(remaining);

    // Color code remaining amount
    const remainingEl = document.getElementById('remainingAmount');
    if (remaining > 0) {
        remainingEl.className = 'success';
    } else if (remaining < 0) {
        remainingEl.className = 'danger';
    } else {
        remainingEl.className = '';
    }

    // Update emergency fund calculations
    updateEmergencyFund(emergencyAmount);

    // Update financial goals
    updateFinancialGoals(totalIncome);

    // Update portfolio
    updatePortfolio();
}

// Update emergency fund progress
function updateEmergencyFund(monthlyContribution) {
    const target = parseFloat(document.getElementById('emergencyTarget').value) || 0;
    const current = parseFloat(document.getElementById('emergencyCurrent').value) || 0;
    const gap = target - current;

    // Update gap display
    document.getElementById('emergencyGap').textContent = formatVND(gap);
    if (gap <= 0) {
        document.getElementById('emergencyGap').classList.remove('danger');
        document.getElementById('emergencyGap').classList.add('success');
    } else {
        document.getElementById('emergencyGap').classList.remove('success');
        document.getElementById('emergencyGap').classList.add('danger');
    }

    // Calculate months to goal
    let monthsToGoal = 0;
    if (monthlyContribution > 0 && gap > 0) {
        monthsToGoal = Math.ceil(gap / monthlyContribution);
    }
    document.getElementById('monthsToGoal').textContent = monthsToGoal > 0 ? monthsToGoal + ' months' : 'Goal reached!';

    // Update progress bar
    const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    document.getElementById('emergencyProgress').style.width = progress + '%';
    document.getElementById('emergencyProgressText').textContent = progress.toFixed(1) + '% of emergency fund goal';
}

// Update sinking fund gap
function updateSinkingFund() {
    const target = parseFloat(document.getElementById('sinkingTarget').value) || 0;
    const current = parseFloat(document.getElementById('sinkingCurrent').value) || 0;
    const gap = target - current;

    document.getElementById('sinkingGap').textContent = formatVND(gap);
    if (gap <= 0) {
        document.getElementById('sinkingGap').classList.remove('danger');
        document.getElementById('sinkingGap').classList.add('success');
    } else {
        document.getElementById('sinkingGap').classList.remove('success');
        document.getElementById('sinkingGap').classList.add('danger');
    }
}

// Update financial goals based on income
function updateFinancialGoals(monthlyIncome) {
    // Financial Security = 6 months of expenses
    const financialSecurity = monthlyIncome * 6;
    document.getElementById('financialSecurity').textContent = formatVND(financialSecurity);

    // Financial Independence = 25x annual expenses (4% rule)
    const annualExpenses = monthlyIncome * 12;
    const financialIndependence = annualExpenses * 25;
    document.getElementById('financialIndependence').textContent = formatVND(financialIndependence);
}

// Update portfolio analysis
function updatePortfolio() {
    const crypto = parseFloat(document.getElementById('cryptoAllocation').value) || 0;
    const housing = parseFloat(document.getElementById('housingAllocation').value) || 0;
    const stocks = parseFloat(document.getElementById('stockAllocation').value) || 0;

    const total = crypto + housing + stocks;
    document.getElementById('totalPortfolio').textContent = formatVND(total);

    // Provide rebalancing recommendations
    if (total === 0) {
        document.getElementById('rebalanceStatus').textContent = 'Enter your portfolio values above';
        document.getElementById('rebalanceStatus').className = 'info-text';
        return;
    }

    const cryptoPercent = (crypto / total) * 100;
    const housingPercent = (housing / total) * 100;
    const stocksPercent = (stocks / total) * 100;

    let recommendation = '';
    let statusClass = 'info-text';

    // Recommended allocation: 60% stocks, 30% housing, 10% crypto (adjust based on risk tolerance)
    if (cryptoPercent > 20) {
        recommendation = '⚠️ Crypto allocation high (' + cryptoPercent.toFixed(1) + '%). Consider rebalancing to reduce risk.';
        statusClass = 'danger';
    } else if (stocksPercent < 40) {
        recommendation = '💡 Stock allocation low (' + stocksPercent.toFixed(1) + '%). Consider increasing for long-term growth.';
        statusClass = 'info-text';
    } else if (housingPercent < 20) {
        recommendation = '🏠 Real estate allocation low (' + housingPercent.toFixed(1) + '%). Consider adding for stability.';
        statusClass = 'info-text';
    } else {
        recommendation = '✅ Portfolio well balanced! Crypto: ' + cryptoPercent.toFixed(1) + '%, Housing: ' + housingPercent.toFixed(1) + '%, Stocks: ' + stocksPercent.toFixed(1) + '%';
        statusClass = 'success';
    }

    const statusEl = document.getElementById('rebalanceStatus');
    statusEl.textContent = recommendation;
    statusEl.className = statusClass;
}

// Initialize event listeners
function initSavingsCalculator() {
    // Income inputs
    document.getElementById('monthlyIncome').addEventListener('input', updateSavingsCalculations);
    document.getElementById('otherIncome').addEventListener('input', updateSavingsCalculations);

    // Allocation sliders
    document.getElementById('monthlySpending').addEventListener('input', updateSavingsCalculations);
    document.getElementById('emergencyFund').addEventListener('input', updateSavingsCalculations);
    document.getElementById('otherExpenses').addEventListener('input', updateSavingsCalculations);

    // Emergency fund inputs
    document.getElementById('emergencyTarget').addEventListener('input', updateSavingsCalculations);
    document.getElementById('emergencyCurrent').addEventListener('input', updateSavingsCalculations);

    // Sinking fund inputs
    document.getElementById('sinkingTarget').addEventListener('input', updateSinkingFund);
    document.getElementById('sinkingCurrent').addEventListener('input', updateSinkingFund);

    // Portfolio inputs
    document.getElementById('cryptoAllocation').addEventListener('input', updatePortfolio);
    document.getElementById('housingAllocation').addEventListener('input', updatePortfolio);
    document.getElementById('stockAllocation').addEventListener('input', updatePortfolio);

    // Initial calculation
    updateSavingsCalculations();
    updateSinkingFund();
}

// Auto-save to localStorage
function saveSavingsData() {
    const savingsData = {
        monthlyIncome: document.getElementById('monthlyIncome').value,
        otherIncome: document.getElementById('otherIncome').value,
        monthlySpending: document.getElementById('monthlySpending').value,
        emergencyFund: document.getElementById('emergencyFund').value,
        otherExpenses: document.getElementById('otherExpenses').value,
        emergencyTarget: document.getElementById('emergencyTarget').value,
        emergencyCurrent: document.getElementById('emergencyCurrent').value,
        sinkingTarget: document.getElementById('sinkingTarget').value,
        sinkingCurrent: document.getElementById('sinkingCurrent').value,
        cryptoAllocation: document.getElementById('cryptoAllocation').value,
        housingAllocation: document.getElementById('housingAllocation').value,
        stockAllocation: document.getElementById('stockAllocation').value
    };

    localStorage.setItem('savingsMethodologyData', JSON.stringify(savingsData));
}

// Load saved data from localStorage
function loadSavingsData() {
    const savedData = localStorage.getItem('savingsMethodologyData');
    if (!savedData) return;

    try {
        const data = JSON.parse(savedData);

        if (data.monthlyIncome) document.getElementById('monthlyIncome').value = data.monthlyIncome;
        if (data.otherIncome) document.getElementById('otherIncome').value = data.otherIncome;
        if (data.monthlySpending) document.getElementById('monthlySpending').value = data.monthlySpending;
        if (data.emergencyFund) document.getElementById('emergencyFund').value = data.emergencyFund;
        if (data.otherExpenses) document.getElementById('otherExpenses').value = data.otherExpenses;
        if (data.emergencyTarget) document.getElementById('emergencyTarget').value = data.emergencyTarget;
        if (data.emergencyCurrent) document.getElementById('emergencyCurrent').value = data.emergencyCurrent;
        if (data.sinkingTarget) document.getElementById('sinkingTarget').value = data.sinkingTarget;
        if (data.sinkingCurrent) document.getElementById('sinkingCurrent').value = data.sinkingCurrent;
        if (data.cryptoAllocation) document.getElementById('cryptoAllocation').value = data.cryptoAllocation;
        if (data.housingAllocation) document.getElementById('housingAllocation').value = data.housingAllocation;
        if (data.stockAllocation) document.getElementById('stockAllocation').value = data.stockAllocation;
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

// Auto-save every 2 seconds when values change
let saveTimeout;
function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveSavingsData, 2000);
}

// Add auto-save to all inputs
function initAutoSave() {
    const inputs = document.querySelectorAll('#savings-tab input');
    inputs.forEach(input => {
        input.addEventListener('input', autoSave);
    });
}

// Initialize when savings tab becomes visible
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    setTimeout(() => {
        loadSavingsData();
        initSavingsCalculator();
        initAutoSave();
    }, 500);
});
