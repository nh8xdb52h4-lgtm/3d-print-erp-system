// =================================
// МОДУЛЬ КАЛЬКУЛЯТОРА 3D-ПЕЧАТИ
// =================================

class Calculator {
    constructor() {
        this.settings = {
            electricityPrice: 7, // ₽ за кВт·ч
            operatorRate: 500,   // ₽ в час
            amortizationRate: 5, // ₽ в час
            failureRate: 0.10    // 10% на сбои
        };
    }

    calculatePrice(weight, time, materialPrice, markupPercent = 200) {
        // Расчет стоимости материалов
        const materialCost = (weight / 1000) * materialPrice;
        
        // Расчет электроэнергии
        const electricityCost = time * 0.3 * this.settings.electricityPrice;
        
        // Амортизация оборудования
        const amortizationCost = time * this.settings.amortizationRate;
        
        // Трудозатраты
        const laborCost = time * 50; // Упрощенный расчет
        
        // Итоговая себестоимость
        const totalCost = materialCost + electricityCost + amortizationCost + laborCost;
        
        // Учет возможных сбоев
        const costWithFailures = totalCost * (1 + this.settings.failureRate);
        
        // Цена продажи
        const markup = markupPercent / 100;
        const finalPrice = costWithFailures * (1 + markup);
        const profit = finalPrice - costWithFailures;

        return {
            materialCost: Math.round(materialCost),
            electricityCost: Math.round(electricityCost),
            amortizationCost: Math.round(amortizationCost),
            laborCost: Math.round(laborCost),
            totalCost: Math.round(costWithFailures),
            finalPrice: Math.round(finalPrice),
            profit: Math.round(profit),
            markupAmount: Math.round(costWithFailures * markup)
        };
    }

    calculatePrintTime(weight, material, quality = 'standard') {
        // Эмпирическая формула расчета времени печати
        const baseTimePerGram = 0.03; // 3 минуты на грамм
        const qualityMultipliers = {
            'draft': 0.7,
            'standard': 1.0,
            'high': 1.5,
            'ultra': 2.0
        };
        
        const multiplier = qualityMultipliers[quality] || 1.0;
        const totalMinutes = weight * baseTimePerGram * multiplier;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        
        return {
            totalMinutes: Math.round(totalMinutes),
            formatted: `${hours}ч ${minutes}м`,
            hours: totalMinutes / 60
        };
    }

    recommendMaterial(requirements) {
        const materials = {
            'ABS': { strength: 8, flexibility: 5, heatResistance: 8, price: 450 },
            'PLA': { strength: 6, flexibility: 2, heatResistance: 4, price: 400 },
            'PETG': { strength: 7, flexibility: 7, heatResistance: 6, price: 500 },
            'TPU': { strength: 4, flexibility: 10, heatResistance: 5, price: 600 }
        };

        let bestMatch = null;
        let bestScore = 0;

        for (const [material, props] of Object.entries(materials)) {
            let score = 0;
            
            if (requirements.strength && props.strength >= requirements.strength) score += 2;
            if (requirements.flexibility && props.flexibility >= requirements.flexibility) score += 2;
            if (requirements.heatResistance && props.heatResistance >= requirements.heatResistance) score += 2;
            if (requirements.budget && props.price <= requirements.budget) score += 1;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = material;
            }
        }

        return {
            material: bestMatch,
            score: bestScore,
            properties: materials[bestMatch]
        };
    }
}

// Глобальная функция для использования в HTML
function calculatePrice() {
    const calculator = new Calculator();
    
    // Получаем значения из формы
    const weight = parseFloat(document.getElementById('calc-weight').value) || 0;
    const time = parseFloat(document.getElementById('calc-time').value) || 0;
    const materialPrice = parseFloat(document.getElementById('calc-material').value) || 0;
    const markup = parseFloat(document.getElementById('calc-markup').value) || 200;

    // Проверяем валидность данных
    if (weight <= 0 || time <= 0) {
        alert('Пожалуйста, введите корректные значения веса и времени');
        return;
    }

    // Выполняем расчет
    const results = calculator.calculatePrice(weight, time, materialPrice, markup);

    // Обновляем интерфейс
    updateCalculationResults(results);
}

function updateCalculationResults(results) {
    // Основные результаты
    document.getElementById('result-cost').textContent = formatCurrency(results.totalCost);
    document.getElementById('result-markup').textContent = formatCurrency(results.markupAmount);
    document.getElementById('result-price').textContent = formatCurrency(results.finalPrice);
    document.getElementById('result-profit').textContent = formatCurrency(results.profit);

    // Детализация
    document.getElementById('detail-material').textContent = formatCurrency(results.materialCost);
    document.getElementById('detail-electricity').textContent = formatCurrency(results.electricityCost);
    document.getElementById('detail-amortization').textContent = formatCurrency(results.amortizationCost);
    document.getElementById('detail-labor').textContent = formatCurrency(results.laborCost);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

// Функция для расчета времени печати
function estimatePrintTime() {
    const calculator = new Calculator();
    const weight = parseFloat(document.getElementById('calc-weight').value) || 0;
    
    if (weight > 0) {
        const timeEstimate = calculator.calculatePrintTime(weight);
        // Можно добавить отображение времени где-то в интерфейсе
        console.log('Estimated print time:', timeEstimate);
    }
}

// Авторасчет при изменении веса
document.addEventListener('DOMContentLoaded', function() {
    const weightInput = document.getElementById('calc-weight');
    if (weightInput) {
        weightInput.addEventListener('input', estimatePrintTime);
    }
});
