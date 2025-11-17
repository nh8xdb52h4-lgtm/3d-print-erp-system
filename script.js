<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Print ERP System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            display: flex;
            min-height: 100vh;
        }

        /* Сайдбар */
        .sidebar {
            width: 250px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px 0;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }

        .logo {
            text-align: center;
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
            color: #4a5568;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 20px;
        }

        .nav-item {
            display: flex;
            align-items: center;
            padding: 15px 25px;
            color: #4a5568;
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
        }

        .nav-item:hover {
            background: #f7fafc;
            color: #2d3748;
            border-left-color: #667eea;
        }

        .nav-item.active {
            background: #edf2f7;
            color: #2d3748;
            border-left-color: #667eea;
            font-weight: 600;
        }

        .nav-icon {
            margin-right: 12px;
            font-size: 18px;
        }

        /* Основной контент */
        .main-content {
            flex: 1;
            padding: 30px;
            overflow-y: auto;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .header h1 {
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 28px;
        }

        .header p {
            color: #718096;
            font-size: 16px;
        }

        /* Вкладки */
        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Карточки */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-card h3 {
            color: #4a5568;
            margin-bottom: 15px;
            font-size: 14px;
            font-weight: 600;
        }

        .amount {
            font-size: 28px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
        }

        .trend {
            font-size: 14px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
        }

        .trend.positive {
            background: #c6f6d5;
            color: #22543d;
        }

        .trend.negative {
            background: #fed7d7;
            color: #742a2a;
        }

        /* Графики */
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .chart-container h4 {
            margin-bottom: 20px;
            color: #2d3748;
        }

        .chart-bars {
            display: flex;
            align-items: end;
            justify-content: space-around;
            height: 200px;
            padding: 20px 0;
        }

        .chart-bar-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
        }

        .chart-bar {
            background: linear-gradient(180deg, #667eea, #764ba2);
            width: 40px;
            border-radius: 8px 8px 0 0;
            position: relative;
            transition: height 0.3s ease;
        }

        .chart-bar-value {
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            font-weight: 600;
            color: #4a5568;
        }

        .chart-bar-label {
            margin-top: 10px;
            font-size: 12px;
            color: #718096;
            font-weight: 600;
        }

        /* Статусы */
        .status-chart {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .status-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            background: #f7fafc;
            border-radius: 8px;
        }

        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
        }

        .status-active { background: #48bb78; }
        .status-maintenance { background: #ed8936; }
        .status-broken { background: #f56565; }
        .status-idle { background: #a0aec0; }

        .status-label {
            flex: 1;
            font-weight: 500;
        }

        .status-count {
            font-weight: 600;
            color: #4a5568;
        }

        /* Товары */
        .products-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .product-chart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f7fafc;
            border-radius: 8px;
            border-left: 4px solid #48bb78;
        }

        .product-chart-item.low-stock {
            border-left-color: #f56565;
            background: #fed7d7;
        }

        .product-name {
            font-weight: 500;
            flex: 1;
        }

        .product-stats {
            display: flex;
            gap: 15px;
            font-size: 14px;
        }

        .product-stats .price {
            font-weight: 600;
            color: #2d3748;
        }

        .product-stats .profitability {
            color: #48bb78;
            font-weight: 600;
        }

        .product-stats .stock {
            color: #718096;
        }

        /* Калькулятор */
        .calculator {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            max-width: 500px;
        }

        .calc-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .form-group label {
            font-weight: 600;
            color: #4a5568;
        }

        .form-group select,
        .form-group input {
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        .form-group select:focus,
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }

        button {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        button:hover {
            transform: translateY(-2px);
        }

        .calc-result {
            margin-top: 20px;
            padding: 20px;
            background: #f7fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .cost-breakdown h4 {
            margin-bottom: 10px;
            color: #2d3748;
        }

        .cost-breakdown p {
            margin-bottom: 8px;
            color: #4a5568;
        }

        /* Заказы */
        .orders-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        .order-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .order-id {
            font-weight: 600;
            color: #4a5568;
        }

        .order-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-pending { background: #fed7d7; color: #742a2a; }
        .status-printing { background: #feebc8; color: #744210; }
        .status-completed { background: #c6f6d5; color: #22543d; }

        .order-client {
            font-weight: 600;
            margin-bottom: 5px;
            color: #2d3748;
        }

        .order-product {
            color: #4a5568;
            margin-bottom: 10px;
        }

        .order-price {
            font-size: 18px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 5px;
        }

        .order-date {
            color: #718096;
            font-size: 14px;
            margin-bottom: 15px;
        }

        .order-actions {
            display: flex;
            gap: 10px;
        }

        .order-actions button {
            padding: 8px 12px;
            font-size: 14px;
        }

        /* Сообщения */
        .error-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
        }

        .coming-soon {
            text-align: center;
            padding: 60px 20px;
            color: #718096;
        }

        .coming-soon-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }

        .section-header {
            margin-bottom: 30px;
        }

        .section-header h3 {
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 24px;
        }

        .section-header p {
            color: #718096;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Сайдбар -->
        <div class="sidebar">
            <div class="logo">3D Print ERP</div>
            <nav>
                <a href="#" class="nav-item active" data-tab="dashboard">
                    <span class="nav-icon">📊</span>
                    Дашборд
                </a>
                <a href="#" class="nav-item" data-tab="calculator">
                    <span class="nav-icon">🧮</span>
                    Калькулятор
                </a>
                <a href="#" class="nav-item" data-tab="orders">
                    <span class="nav-icon">📋</span>
                    Заказы
                </a>
                <a href="#" class="nav-item" data-tab="products">
                    <span class="nav-icon">📦</span>
                    Товары
                </a>
                <a href="#" class="nav-item" data-tab="crm">
                    <span class="nav-icon">👥</span>
                    Клиенты
                </a>
                <a href="#" class="nav-item" data-tab="finance">
                    <span class="nav-icon">💰</span>
                    Финансы
                </a>
                <a href="#" class="nav-item" data-tab="printers">
                    <span class="nav-icon">🖨️</span>
                    Принтеры
                </a>
            </nav>
        </div>

        <!-- Основной контент -->
        <div class="main-content">
            <!-- Дашборд -->
            <div id="dashboard" class="tab-content active">
                <div class="header">
                    <h1>📊 Дашборд управления</h1>
                    <p>Обзор производительности и ключевых показателей</p>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>💰 Текущий баланс</h3>
                        <div class="amount" id="current-balance">0 ₽</div>
                        <div class="trend positive">+5%</div>
                    </div>
                    <div class="stat-card">
                        <h3>🖨️ Активные принтеры</h3>
                        <div class="amount" id="active-printers">0/0</div>
                        <div class="trend positive">+2</div>
                    </div>
                    <div class="stat-card">
                        <h3>📋 Заказы сегодня</h3>
                        <div class="amount" id="today-orders">0</div>
                        <div class="trend negative">-1</div>
                    </div>
                    <div class="stat-card">
                        <h3>📈 Выручка месяца</h3>
                        <div class="amount" id="month-revenue">0 ₽</div>
                        <div class="trend positive">+12%</div>
                    </div>
                </div>

                <div class="charts-grid">
                    <div id="sales-chart" class="chart-container"></div>
                    <div id="printers-chart" class="chart-container"></div>
                    <div id="products-chart" class="chart-container"></div>
                </div>
            </div>

            <!-- Калькулятор -->
            <div id="calculator" class="tab-content">
                <div class="header">
                    <h1>🧮 Калькулятор стоимости</h1>
                    <p>Расчет стоимости 3D печати</p>
                </div>
                <div id="calculator-container"></div>
            </div>

            <!-- Заказы -->
            <div id="orders" class="tab-content">
                <div class="header">
                    <h1>📋 Управление заказами</h1>
                    <p>Мониторинг и управление заказами</p>
                </div>
                <div id="orders-container"></div>
            </div>

            <!-- Товары -->
            <div id="products" class="tab-content">
                <div class="header">
                    <h1>📦 Управление товарами</h1>
                    <p>Складские остатки и управление продуктами</p>
                </div>
                <div id="products-container"></div>
            </div>

            <!-- Клиенты -->
            <div id="crm" class="tab-content">
                <div class="header">
                    <h1>👥 База клиентов</h1>
                    <p>Управление клиентами и история заказов</p>
                </div>
                <div id="clients-container"></div>
            </div>

            <!-- Финансы -->
            <div id="finance" class="tab-content">
                <div class="header">
                    <h1>💰 Финансовый анализ</h1>
                    <p>Анализ доходов, расходов и прибыли</p>
                </div>
                <div class="finance-stats"></div>
            </div>

            <!-- Принтеры -->
            <div id="printers" class="tab-content">
                <div class="header">
                    <h1>🖨️ Управление принтерами</h1>
                    <p>Мониторинг статусов и планирование работ</p>
                </div>
                <div id="printers-container"></div>
            </div>
        </div>
    </div>

    <script>
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
                    { id: 2, client: "Иванов А.В.", product: "DET-MIRROR-BRACKET", status: "printing", price: 3560, date: "2024-11-15" },
                    { id: 3, client: "Петров С.И.", product: "CASE-RASPBERRY", status: "pending", price: 2450, date: "2024-11-16" }
                ],
                clients: [
                    { id: 1, name: "Юреев Дмитрий Николаевич", phone: "89370780708", totalOrders: 3, totalSpent: 38592, status: "regular" },
                    { id: 2, name: "Иванов Алексей Владимирович", phone: "89215554321", totalOrders: 1, totalSpent: 3560, status: "new" }
                ],
                products: [
                    { id: "RMK-TOYOTA-FUNCARGO", name: "Ремкомплект Toyota Funcargo", price: 12864, cost: 4288, stock: 15, minStock: 5 },
                    { id: "DET-MIRROR-BRACKET", name: "Кронштейн зеркала", price: 3560, cost: 1187, stock: 8, minStock: 3 },
                    { id: "CASE-RASPBERRY", name: "Корпус Raspberry Pi", price: 2450, cost: 817, stock: 2, minStock: 5 }
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
            loadFromLocalStorage();
            setupNavigation();
            loadDashboard();
            setupEventListeners();
            console.log('✅ Система инициализирована');
        }

        function loadFromLocalStorage() {
            const saved = localStorage.getItem('erpSystem');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Объединяем сохраненные данные с дефолтными
                    erpSystem.data = { ...erpSystem.data, ...parsed.data };
                    console.log('📂 Данные восстановлены из localStorage');
                } catch (e) {
                    console.error('❌ Ошибка загрузки данных:', e);
                }
            }
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
            try {
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
                    case 'orders':
                        loadOrders();
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
                    default:
                        console.warn('⚠️ Неизвестная вкладка:', tabName);
                }
            } catch (error) {
                console.error('❌ Ошибка при переключении вкладки:', error);
                showError('Произошла ошибка при загрузке вкладки');
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

        // Загрузка калькулятора
        function loadCalculator() {
            console.log('🧮 Загрузка калькулятора...');
            const container = document.getElementById('calculator-container');
            if (!container) return;
            
            container.innerHTML = `
                <div class="calculator">
                    <h3>Калькулятор стоимости печати</h3>
                    <div class="calc-form">
                        <div class="form-group">
                            <label>Материал:</label>
                            <select id="material-select">
                                <option value="PLA">PLA (80 руб/г)</option>
                                <option value="ABS">ABS (95 руб/г)</option>
                                <option value="PETG">PETG (90 руб/г)</option>
                                <option value="TPU">TPU (120 руб/г)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Вес модели (грамм):</label>
                            <input type="number" id="model-weight" min="1" value="50">
                        </div>
                        <div class="form-group">
                            <label>Время печати (часы):</label>
                            <input type="number" id="print-time" min="0.5" step="0.5" value="4">
                        </div>
                        <div class="form-group">
                            <label>Сложность:</label>
                            <select id="complexity">
                                <option value="1">Простая</option>
                                <option value="1.2">Средняя</option>
                                <option value="1.5">Сложная</option>
                            </select>
                        </div>
                        <button onclick="calculateCost()">Рассчитать стоимость</button>
                        <div id="calculation-result" class="calc-result"></div>
                    </div>
                </div>
            `;
        }

        function calculateCost() {
            const materialPrice = {
                'PLA': 80, 'ABS': 95, 'PETG': 90, 'TPU': 120
            };
            
            const material = document.getElementById('material-select').value;
            const weight = parseFloat(document.getElementById('model-weight').value);
            const time = parseFloat(document.getElementById('print-time').value);
            const complexity = parseFloat(document.getElementById('complexity').value);
            
            const materialCost = weight * materialPrice[material];
            const timeCost = time * 50; // 50 руб/час
            const totalCost = (materialCost + timeCost) * complexity;
            const profit = totalCost * 0.3; // 30% прибыль
            const finalPrice = totalCost + profit;
            
            const result = document.getElementById('calculation-result');
            result.innerHTML = `
                <div class="cost-breakdown">
                    <h4>Результат расчета:</h4>
                    <p>Себестоимость: ${formatCurrency(totalCost)}</p>
                    <p>Прибыль: ${formatCurrency(profit)}</p>
                    <p><strong>Итоговая цена: ${formatCurrency(finalPrice)}</strong></p>
                </div>
            `;
        }

        // Загрузка заказов
        function loadOrders() {
            console.log('📋 Загрузка заказов...');
            const container = document.getElementById('orders-container');
            if (!container) return;
            
            let html = `
                <div class="section-header">
                    <h3>Управление заказами</h3>
                    <button class="btn-primary" onclick="showAddOrderModal()">+ Новый заказ</button>
                </div>
                <div class="orders-grid">
            `;
            
            erpSystem.data.orders.forEach(order => {
                const statusClass = getOrderStatusClass(order.status);
                html += `
                    <div class="order-card">
                        <div class="order-header">
                            <span class="order-id">#${order.id}</span>
                            <span class="order-status ${statusClass}">${getOrderStatusText(order.status)}</span>
                        </div>
                        <div class="order-client">${order.client}</div>
                        <div class="order-product">${order.product}</div>
                        <div class="order-price">${formatCurrency(order.price)}</div>
                        <div class="order-date">${order.date}</div>
                        <div class="order-actions">
                            <button onclick="updateOrderStatus(${order.id}, 'completed')">✅</button>
                            <button onclick="updateOrderStatus(${order.id}, 'printing')">🖨️</button>
                            <button onclick="updateOrderStatus(${order.id}, 'pending')">⏳</button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.innerHTML = html;
        }

        function getOrderStatusClass(status) {
            const classes = {
                'pending': 'status-pending',
                'printing': 'status-printing', 
                'completed': 'status-completed'
            };
            return classes[status] || 'status-pending';
        }

        function getOrderStatusText(status) {
            const texts = {
                'pending': 'В ожидании',
                'printing': 'Печатается',
                'completed': 'Завершен'
            };
            return texts[status] || 'В ожидании';
        }

        function updateOrderStatus(orderId, newStatus) {
            const order = erpSystem.data.orders.find(o => o.id === orderId);
            if (order) {
                order.status = newStatus;
                loadOrders(); // Перезагружаем список
                console.log(`✅ Статус заказа #${orderId} изменен на: ${newStatus}`);
            }
        }

        // Загрузка других вкладок
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
            setInterval(() => {
                localStorage.setItem('erpSystem', JSON.stringify(erpSystem));
                console.log('💾 Данные сохранены');
            }, 30000);
        }

        function showError(message) {
            // Можно добавить красивый toast или уведомление
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }

        // Глобальные функции для HTML
        function showAddProductModal() {
            alert('Функция добавления товара будет доступна в следующей версии');
        }

        function showAddClientModal() {
            alert('Функция добавления клиента будет доступна в следующей версии');
        }

        function showAddOrderModal() {
            alert('Функция добавления заказа будет доступна в следующей версии');
        }
    </script>
</body>
</html>