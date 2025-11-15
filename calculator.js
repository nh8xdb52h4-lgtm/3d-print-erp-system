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
        this.materials = [];
        this.loadMaterials();
    }

    async loadMaterials() {
        try {
            // Пытаемся загрузить материалы из JSON
            const response = await fetch('data/materials.json');
            if (response.ok) {
                const data = await response.json();
                this.materials = data.materials;
                this.updateMaterialSelect();
            } else {
                // Если файла нет, используем стандартные материалы
                this.loadDefaultMaterials();
            }
        } catch (error) {
            console.log('Не удалось загрузить материалы, используем стандартные');
            this.loadDefaultMaterials();
        }
    }

    loadDefaultMaterials() {
        this.materials = [
            {
                id: "abs",
                name: "ABS",
                price: 450,
                density: 1.04,
                temperatures: { nozzle: 240, bed: 100 }
            },
            {
                id: "pla", 
                name: "PLA",
                price: 400,
                density: 1.24,
                temperatures: { nozzle: 210, bed: 60 }
            },
            {
                id: "petg",
                name: "PETG", 
                price: 500,
                density: 1.27,
                temperatures: { nozzle: 230, bed: 80 }
            },
            {
                id: "tpu",
                name: "TPU",
                price: 600, 
                density: 1.21,
                temperatures: { nozzle: 220, bed: 40 }
            }
        ];
        this.updateMaterialSelect();
    }

    updateMaterialSelect() {
        const materialSelect = document.getElementById('calc-material');
        if (materialSelect) {
            materialSelect.innerHTML = '';
            
            this.materials.forEach(material => {
                const option = document.createElement('option');
                option.value = material.price;
                option.textContent = `${material.name} (${material.price}₽/кг)`;
                option.setAttribute('data-material', material.id);
                materialSelect.appendChild(option);
            });
        }
    }

    getMaterialById(materialId) {
        return this.materials.find(m => m.id === materialId);
    }

    calculatePrice(weight, time, materialPrice, markupPercent = 200) {
        // Расчет стоимости материалов
        const materialCost = (weight / 1000) * materialPrice;
        
        // Расчет электроэнергии
        const electricityCost = time * 0.3 * this.settings.electricityPrice;
        
        // Амортизация оборудования
        const amortizationCost = time * this.settings.amortizationRate;
        
        // Трудозатраты
        const laborCost = time * 50;
        
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

    calculatePrintTime(weight, materialId, quality = 'standard') {
        const material = this.getMaterialById(materialId);
        if (!material) return this.calculateDefaultPrintTime(weight, quality);

        // Базовое время с учетом материала
        let baseTimePerGram = 0.03; // 3 минуты на грамм
        
        // Корректировка по материалу
        if (material.id === 'tpu') baseTimePerGram = 0.05; // TPU печатается медленнее
        if (material.id === 'pla') baseTimePerGram = 0.025; // PLA печатается быстрее
        
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
            hours: totalMinutes / 60,
            material: material.name
        };
    }

    calculateDefaultPrintTime(weight, quality = 'standard') {
        const baseTimePerGram = 0.03;
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
        const scores = this.materials.map(material => {
            let score = 0;
            const props = material.properties || {};
            
            if (requirements.strength && props.strength >= requirements.strength) score += 2;
            if (requirements.flexibility && props.flexibility >= requirements.flexibility) score += 2;
            if (requirements.heatResistance && props.heat_resistance >= requirements.heatResistance) score += 2;
            if (requirements.budget && material.price <= requirements.budget) score += 1;
            if (requirements.durability && props.durability >= requirements.durability) score += 1;

            return {
                material: material.name,
                materialId: material.id,
                score: score,
                properties: props,
                price: material.price
            };
        });

        const bestMatch = scores.reduce((best, current) => 
            current.score > best.score ? current : best
        );

        return bestMatch;
    }

    getMaterialTemperatures(materialId) {
        const material = this.getMaterialById(materialId);
        return material ? material.temperatures : { nozzle: 210, bed: 60 };
    }

    getMaterialProperties(materialId) {
        const material = this.getMaterialById(materialId);
        return material ? material.properties : null;
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

    // Получаем ID материала
    const materialSelect = document.getElementById('calc-material');
    const selectedOption = materialSelect.options[materialSelect.selectedIndex];
    const materialId = selectedOption.getAttribute('data-material');

    // Проверяем валидность данных
    if (weight <= 0 || time <= 0) {
        alert('Пожалуйста, введите корректные значения веса и времени');
        return;
    }

    // Выполняем расчет
    const results = calculator.calculatePrice(weight, time, materialPrice, markup);

    // Получаем информацию о материале
    const material = calculator.getMaterialById(materialId);
    const printTime = calculator.calculatePrintTime(weight, materialId);

    // Обновляем интерфейс
    updateCalculationResults(results, material, printTime);
}

function updateCalculationResults(results, material, printTime) {
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

    // Дополнительная информация о материале
    if (material) {
        showMaterialInfo(material, printTime);
    }
}

function showMaterialInfo(material, printTime) {
    const resultsSection = document.querySelector('.results-section');
    
    let materialInfo = `
        <div class="material-info">
            <h4>🌡️ Информация о материале</h4>
            <div class="material-details">
                <div class="material-item">
                    <span>Материал:</span>
                    <span><strong>${material.name}</strong></span>
                </div>
    `;

    if (material.temperatures) {
        materialInfo += `
                <div class="material-item">
                    <span>Температуры:</span>
                    <span>Сопло: ${material.temperatures.nozzle}°C | Стол: ${material.temperatures.bed}°C</span>
                </div>
        `;
    }

    if (printTime) {
        materialInfo += `
                <div class="material-item">
                    <span>Расчетное время:</span>
                    <span>${printTime.formatted}</span>
                </div>
        `;
    }

    if (material.characteristics && material.characteristics.length > 0) {
        materialInfo += `
                <div class="material-item">
                    <span>Характеристики:</span>
                    <span>${material.characteristics.slice(0, 2).join(', ')}</span>
                </div>
        `;
    }

    materialInfo += `
            </div>
        </div>
    `;

    // Добавляем информацию о материале в результаты
    const existingMaterialInfo = resultsSection.querySelector('.material-info');
    if (existingMaterialInfo) {
        existingMaterialInfo.remove();
    }
    
    resultsSection.insertAdjacentHTML('beforeend', materialInfo);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

// Инициализация калькулятора при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const calculator = new Calculator();
    
    // Авторасчет при изменении веса
    const weightInput = document.getElementById('calc-weight');
    if (weightInput) {
        weightInput.addEventListener('input', function() {
            const weight = parseFloat(this.value) || 0;
            if (weight > 0) {
                const materialSelect = document.getElementById('calc-material');
                const selectedOption = materialSelect.options[materialSelect.selectedIndex];
                const materialId = selectedOption.getAttribute('data-material');
                
                const printTime = calculator.calculatePrintTime(weight, materialId);
                // Можно обновить поле времени печати
                const timeInput = document.getElementById('calc-time');
                if (timeInput && printTime.hours > 0) {
                    timeInput.value = printTime.hours.toFixed(1);
                }
            }
        });
    }
});
