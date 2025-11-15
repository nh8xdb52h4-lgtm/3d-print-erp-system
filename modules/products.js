// =================================
// МОДУЛЬ УПРАВЛЕНИЯ ТОВАРАМИ
// =================================

class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('erp_products')) || [];
        this.categories = ['RMK', 'DET', 'KOM', 'SER'];
        this.materials = ['PLA', 'ABS', 'PETG', 'TPU'];
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        
        // Если товаров нет, добавляем демо-данные
        if (this.products.length === 0) {
            this.addSampleProducts();
        }
    }

    loadProducts() {
        if (window.erpSystem && window.erpSystem.data.products) {
            this.products = window.erpSystem.data.products;
        }
    }

    addSampleProducts() {
        const sampleProducts = [
            {
                id: 'RMK-TOYOTA-FUNCARGO-PLA-BLK-M',
                name: 'Ремкомплект Toyota Funcargo',
                category: 'RMK',
                weight: 2000,
                printTime: 60,
                material: 'PLA',
                color: 'BLK',
                size: 'M',
                price: 12864,
                cost: 4288,
                stock: 15,
                minStock: 5,
                description: 'Полный ремкомплект для Toyota Funcargo'
            },
            {
                id: 'DET-MIRROR-BRACKET-PLA-WHT-S',
                name: 'Кронштейн зеркала',
                category: 'DET',
                weight: 350,
                printTime: 8,
                material: 'PLA',
                color: 'WHT',
                size: 'S',
                price: 3560,
                cost: 1187,
                stock: 8,
                minStock: 3,
                description: 'Кронштейн для крепления зеркала'
            }
        ];

        sampleProducts.forEach(product => {
            this.products.push(product);
        });

        this.saveToStorage();
    }

    addProduct(productData) {
        // Генерация ID если не предоставлен
        if (!productData.id) {
            productData.id = this.generateProductId(productData);
        }

        const newProduct = {
            ...productData,
            createdAt: new Date().toISOString(),
            stock: productData.stock || 0,
            minStock: productData.minStock || 0,
            status: 'active'
        };

        this.products.push(newProduct);
        this.saveToStorage();
        
        return newProduct;
    }

    generateProductId(productData) {
        const { category, material, color, size } = productData;
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${category}-${material}-${color}-${size}-${randomNum}`;
    }

    updateProduct(productId, updates) {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            this.products[productIndex] = { ...this.products[productIndex], ...updates };
            this.saveToStorage();
            return this.products[productIndex];
        }
        return null;
    }

    updateStock(productId, quantity) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.stock += quantity;
            this.saveToStorage();
            return product;
        }
        return null;
    }

    getProduct(productId) {
        return this.products.find(p => p.id === productId);
    }

    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    getLowStockProducts() {
        return this.products.filter(p => p.stock <= p.minStock);
    }

    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.id.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm)
        );
    }

    calculateProfitability(productId) {
        const product = this.getProduct(productId);
        if (!product) return 0;

        return ((product.price - product.cost) / product.cost) * 100;
    }

    getProductStatus(product) {
        if (product.stock === 0) return 'out-of-stock';
        if (product.stock <= product.minStock) return 'low-stock';
        return 'in-stock';
    }

    getStatusText(status) {
        const statuses = {
            'in-stock': '✅ В наличии',
            'low-stock': '⚠️ Нужно допечатать',
            'out-of-stock': '🔴 Нет в наличии'
        };
        return statuses[status] || 'В наличии';
    }

    saveToStorage() {
        localStorage.setItem('erp_products', JSON.stringify(this.products));
        
        if (window.erpSystem) {
            window.erpSystem.data.products = this.products;
        }
    }

    setupEventListeners() {
        // Поиск товаров
        document.addEventListener('input', (e) => {
            if (e.target.id === 'product-search') {
                this.handleProductSearch(e.target.value);
            }
        });

        // Фильтр по категориям
        document.addEventListener('change', (e) => {
            if (e.target.id === 'product-category') {
                this.handleCategoryFilter(e.target.value);
            }
        });
    }

    handleProductSearch(query) {
        if (!query.trim()) {
            this.renderProducts(this.products);
            return;
        }

        const results = this.searchProducts(query);
        this.renderProducts(results);
    }

    handleCategoryFilter(category) {
        if (!category) {
            this.renderProducts(this.products);
            return;
        }

        const filtered = this.getProductsByCategory(category);
        this.renderProducts(filtered);
    }

    renderProducts(productsArray = this.products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        const lowStockCount = this.getLowStockProducts().length;

        let html = `
            <div class="products-header">
                <div class="products-stats">
                    <div class="stat-small">
                        <span>Всего товаров:</span>
                        <strong>${this.products.length}</strong>
                    </div>
                    <div class="stat-small warning">
                        <span>Низкий запас:</span>
                        <strong>${lowStockCount}</strong>
                    </div>
                    <div class="stat-small">
                        <span>Категорий:</span>
                        <strong>${this.categories.length}</strong>
                    </div>
                </div>
                <div class="products-controls">
                    <div class="search-bar">
                        <input type="text" id="product-search" placeholder="🔍 Поиск товаров...">
                        <select id="product-category">
                            <option value="">Все категории</option>
                            ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            <div class="products-grid">
        `;

        if (productsArray.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>Товары не найдены</h3>
                    <p>Попробуйте изменить параметры поиска или добавьте новый товар</p>
                </div>
            `;
        } else {
            productsArray.forEach(product => {
                const status = this.getProductStatus(product);
                const profitability = this.calculateProfitability(product.id);
                
                html += `
                    <div class="product-card ${status}">
                        <div class="product-header">
                            <h4>${product.name}</h4>
                            <span class="product-id">${product.id}</span>
                        </div>
                        
                        <div class="product-details">
                            <div class="product-specs">
                                <div class="spec-item">
                                    <span class="spec-label">Вес:</span>
                                    <span class="spec-value">${product.weight}g</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Время:</span>
                                    <span class="spec-value">${product.printTime}ч</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Материал:</span>
                                    <span class="spec-value">${product.material}</span>
                                </div>
                            </div>
                            
                            <div class="product-finance">
                                <div class="price">${formatCurrency(product.price)}</div>
                                <div class="cost">Себестоимость: ${formatCurrency(product.cost)}</div>
                                <div class="profitability">Рентабельность: ${profitability.toFixed(1)}%</div>
                            </div>
                            
                            <div class="product-stock">
                                <div class="stock-info">
                                    <span>Остаток: ${product.stock} шт</span>
                                    <span class="min-stock">Мин: ${product.minStock} шт</span>
                                </div>
                                <div class="stock-status">${this.getStatusText(status)}</div>
                            </div>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-small" onclick="productManager.editProduct('${product.id}')" title="Редактировать">
                                ✏️
                            </button>
                            <button class="btn-small" onclick="productManager.updateStock('${product.id}', 1)" title="Добавить 1 шт">
                                ➕
                            </button>
                            <button class="btn-small" onclick="productManager.viewStats('${product.id}')" title="Статистика">
                                📊
                            </button>
                            <button class="btn-small danger" onclick="productManager.deleteProduct('${product.id}')" title="Удалить">
                                🗑️
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    // Методы для UI взаимодействия
    editProduct(productId) {
        const product = this.getProduct(productId);
        if (product) {
            this.showEditProductModal(product);
        }
    }

    updateStock(productId, quantity) {
        const product = this.updateStock(productId, quantity);
        if (product) {
            this.renderProducts();
            alert(`Запас товара обновлен: ${product.stock} шт`);
        }
    }

    viewStats(productId) {
        const product = this.getProduct(productId);
        if (product) {
            this.showProductStatsModal(product);
        }
    }

    deleteProduct(productId) {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveToStorage();
            this.renderProducts();
            alert('Товар удален');
        }
    }

    showEditProductModal(product) {
        // Реализация модального окна редактирования товара
        alert(`Редактирование товара: ${product.name}\n(здесь будет форма редактирования)`);
    }

    showProductStatsModal(product) {
        const profitability = this.calculateProfitability(product.id);
        
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h3>📊 Статистика: ${product.name}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <h4>💰 Цена</h4>
                                <div class="amount">${formatCurrency(product.price)}</div>
                            </div>
                            <div class="stat-card">
                                <h4>🏷️ Себестоимость</h4>
                                <div class="amount">${formatCurrency(product.cost)}</div>
                            </div>
                            <div class="stat-card">
                                <h4>📈 Прибыль</h4>
                                <div class="amount">${formatCurrency(product.price - product.cost)}</div>
                            </div>
                            <div class="stat-card">
                                <h4>🎯 Рентабельность</h4>
                                <div class="amount">${profitability.toFixed(1)}%</div>
                            </div>
                        </div>
                        
                        <div class="product-details">
                            <h4>Детали производства</h4>
                            <div class="details-grid">
                                <div class="detail-item">
                                    <span>Вес:</span>
                                    <span>${product.weight}g</span>
                                </div>
                                <div class="detail-item">
                                    <span>Время печати:</span>
                                    <span>${product.printTime}ч</span>
                                </div>
                                <div class="detail-item">
                                    <span>Материал:</span>
                                    <span>${product.material}</span>
                                </div>
                                <div class="detail-item">
                                    <span>Текущий запас:</span>
                                    <span>${product.stock} шт</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

// Инициализация менеджера товаров
let productManager;

document.addEventListener('DOMContentLoaded', function() {
    productManager = new ProductManager();
});

// Глобальные функции для HTML
function showAddProductModal() {
    alert('Форма добавления товара будет реализована в следующей версии');
}
