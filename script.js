// =================================
// 3D PRINT ERP SYSTEM - MAIN SCRIPT
// =================================

// Глобальные переменные системы
let erpSystem = {
    currentTab: 'dashboard',
    data: {
        finances: {
            balance: 7891,
            monthlyGoal: 200000,
            criticalGoals: [
                { name: "Аренда", amount: 33000, deadline: "2024-12-01" },
                { name: "Выкуп принтера", amount: 7891, deadline: "2024-11-30" }
            ]
        },
        printers: [
            { id: 1, name: "ANYCUBIC CHIRON", status: "active", materials: ["ABS", "PLA", "PETG"] },
            { id: 2, name: "Creality Ender 3", status: "maintenance", materials: ["PLA", "PETG"] },
            { id: 3, name: "Prusa MK3S+", status: "active", materials: ["ABS", "PLA", "PETG", "TPU"] }
        ],
        orders: [
            { id: 1, client: "Юреев Д.Н.", product: "RMK-TOYOTA-FUNCARGO", status: "completed", price: 12864, date: "2024-11-15" },
            { id: 2, client: "Иванов А.В.", product: "DET-MIRROR-BRACKET", status: "printing", price: 3560, date: "2024-11-15" }
        ],
        clients: [
            { id: 1, name: "Юреев Дмитрий Николаевич", phone: "89370780708", totalOrders: 3, totalSpent: 38592, status: "regular" },
            { id: 2, name: "Иванов Алексей Владимирович", phone: "89215554321", totalOrders: 1, totalSpent: 3560, status: "new" }
        ],
        products: [
            { id: "RMK-TOYOTA-FUNCARGO", name: "Ремкомплект Toyota Funcargo", price: 12864, cost: 4288, stock: 15, minStock: 5 },
            { id: "DET-MIRROR-BRACKET", name: "Кронштейн зеркала", price: 3560, cost: 1187, stock: 8, minStock: 3 }
        ]
    }
};

// Инициализация системы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Инициализация ERP системы...');
    initializeSystem();
});

// Основные функции системы
function initializeSystem() {
    setupNavigation();
    loadDashboard();
    setupEventListeners();
    console.log('✅ Система инициализирована');
}

function setupNavigation() {
    console.log('🔄 Настройка навигации...');
    
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Найдено пунктов меню:', navItems.length);
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            console.log('Клик по меню:', tabName);
            switchTab(tabName);
        });
    });
    
    // Активируем первую вкладку
    switchTab('dashboard');
}

function switchTab(tabName) {
    console.log('🔄 Переключение на вкладку:', tabName);
    
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активный класс у всех пунктов меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Показать выбранную вкладку
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
        console.log('✅ Вкладка активирована:', tabName);
    } else {
        console.error('❌ Вкладка не найдена:', tabName);
    }

    // Активировать пункт меню
    const targetNavItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetNavItem) {
        targetNavItem.classList.add('active');
    }

    // Загрузить данные для вкладки
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'calculator':
            loadCalculator();
            break;
        case 'products':
            loadProducts();
            break;
        case 'crm':
            loadClients();
            break;
        case 'finance':
            loadFinance();
            break;
        case 'printers':
            loadPrinters();
            break;
    }
}

// Загрузка дашборда с графиками
function loadDashboard() {
    console.log('📊 Загрузка дашборда...');
    
    const activePrinters = erpSystem.data.printers.filter(p => p.status === 'active').length;
    const todayOrders = erpSystem.data.orders.filter(o => {
        const orderDate = new Date(o.date);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
    }).length;

    // Обновление статистики
    updateElement('current-balance', formatCurrency(erpSystem.data.finances.balance));
    updateElement('active-printers', `${activePrinters}/${erpSystem.data.printers.length}`);
    updateElement('today-orders', todayOrders);
    updateElement('month-revenue', formatCurrency(156842));

    // Создаем графики
    createCharts();
}

function createCharts() {
    console.log('📈 Создание графиков...');
    
    // График продаж за месяц
    createSalesChart();
    
    // График загрузки принтеров
    createPrintersChart();
    
    // График популярности товаров
    createProductsChart();
}

function createSalesChart() {
    const container = document.getElementById('sales-chart');
    if (!container) return;
    
    const salesData = {
        'Неделя 1': 45000,
        'Неделя 2': 52000,
        'Неделя 3': 48000,
        'Неделя 4': 61000
    };
    
    let html = `
        <div class="chart-container">
            <h4>📈 Продажи по неделям</h4>
            <div class="chart-bars">
    `;
    
    Object.entries(salesData).forEach(([week, amount]) => {
        const height = (amount / 70000) * 100;
        html += `
            <div class="chart-bar-container">
                <div class="chart-bar" style="height: ${height}%">
                    <div class="chart-bar-value">${formatCurrency(amount)}</div>
                </div>
                <div class="chart-bar-label">${week}</div>
            </div>
        `;
    });
    
    html += `</div></div>`;
    container.innerHTML = html;
}

function createPrintersChart() {
    const container = document.getElementById('printers-chart');
    if (!container) return;
    
    const statusCount = {
        'active': erpSystem.data.printers.filter(p => p.status === 'active').length,
        'maintenance': erpSystem.data.printers.filter(p => p.status === 'maintenance').length,
        'idle': erpSystem.data.printers.filter(p => p.status === 'idle').length
    };
    
    let html = `
        <div class="chart-container">
            <h4>🖨️ Статус принтеров</h4>
            <div class="status-chart">
    `;
    
    Object.entries(statusCount).forEach(([status, count]) => {
        const percentage = (count / erpSystem.data.printers.length) * 100;
        const statusClass = getPrinterStatusClass(status);
        const statusText = getPrinterStatusText(status);
        
        html += `
            <div class="status-item">
                <div class="status-indicator ${statusClass}"></div>
                <span class="status-label">${statusText}</span>
                <span class="status-count">${count} (${percentage.toFixed(0)}%)</span>
            </div>
        `;
    });
    
    html += `</div></div>`;
    container.innerHTML = html;
}

function createProductsChart() {
    const container = document.getElementById('products-chart');
    if (!container) return;
    
    let html = `
        <div class="chart-container">
            <h4>📦 Топ товаров</h4>
            <div class="products-list">
    `;
    
    erpSystem.data.products.forEach(product => {
        const profitability = ((product.price - product.cost) / product.cost * 100).toFixed(1);
        const status = product.stock <= product.minStock ? 'low-stock' : 'in-stock';
        
        html += `
            <div class="product-chart-item ${status}">
                <div class="product-name">${product.name}</div>
                <div class="product-stats">
                    <span class="price">${formatCurrency(product.price)}</span>
                    <span class="profitability">${profitability}%</span>
                    <span class="stock">${product.stock} шт</span>
                </div>
            </div>
        `;
    });
    
    html += `</div></div>`;
    container.innerHTML = html;
}

// Загрузка других вкладок
function loadCalculator() {
    console.log('🧮 Загрузка калькулятора...');
    // Калькулятор загрузится автоматически
}

function loadProducts() {
    console.log('📦 Загрузка товаров...');
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="section-header">
            <h3>Управление товарами</h3>
            <p>Здесь будет список всех товаров и управление остатками</p>
        </div>
        <div class="coming-soon">
            <div class="coming-soon-icon">📦</div>
            <h4>Модуль в разработке</h4>
            <p>Скоро здесь появится полное управление товарами</p>
        </div>
    `;
}

function loadClients() {
    console.log('👥 Загрузка клиентов...');
    const container = document.getElementById('clients-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="section-header">
            <h3>База клиентов</h3>
            <p>Управление клиентами и история заказов</p>
        </div>
        <div class="coming-soon">
            <div class="coming-soon-icon">👥</div>
            <h4>Модуль в разработке</h4>
            <p>Скоро здесь появится полноценная CRM система</p>
        </div>
    `;
}

function loadFinance() {
    console.log('💰 Загрузка финансов...');
    const container = document.querySelector('#finance .finance-stats');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>📈 Доходы месяца</h3>
                <div class="amount">156,842 ₽</div>
                <div class="trend positive">+12%</div>
            </div>
            <div class="stat-card">
                <h3>📉 Расходы месяца</h3>
                <div class="amount">89,451 ₽</div>
                <div class="trend negative">-8%</div>
            </div>
            <div class="stat-card">
                <h3>🎯 Чистая прибыль</h3>
                <div class="amount">67,391 ₽</div>
                <div class="trend positive">+25%</div>
            </div>
            <div class="stat-card">
                <h3>📊 Рентабельность</h3>
                <div class="amount">43%</div>
                <div class="trend positive">+5%</div>
            </div>
        </div>
    `;
}

function loadPrinters() {
    console.log('🖨️ Загрузка принтеров...');
    const container = document.getElementById('printers-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="section-header">
            <h3>Управление принтерами</h3>
            <p>Мониторинг статусов и планирование работ</p>
        </div>
        <div class="coming-soon">
            <div class="coming-soon-icon">🖨️</div>
            <h4>Модуль в разработке</h4>
            <p>Скоро здесь появится управление принтерами</p>
        </div>
    `;
}

// Вспомогательные функции
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
}

function getPrinterStatusClass(status) {
    const classes = {
        'active': 'status-active',
        'maintenance': 'status-maintenance',
        'broken': 'status-broken',
        'idle': 'status-idle'
    };
    return classes[status] || 'status-idle';
}

function getPrinterStatusText(status) {
    const texts = {
        'active': 'Работает',
        'maintenance': 'Обслуживание',
        'broken': 'Сломан',
        'idle': 'Простой'
    };
    return texts[status] || 'Неизвестно';
}

function setupEventListeners() {
    // Автосохранение при изменении данных
    setInterval(() => {весь
        localStorage.setItem('erpSystem', JSON.stringify(erpSystem));
    }, 30000);
}

// Глобальные функции для HTML
function showAddProductModal() {
    alert('Функция добавления товара будет доступна в следующей версии');
}

function showAddClientModal() {
    alert('Функция добавления клиента будет доступна в следующей версии');
}
