// =================================
// МОДУЛЬ CRM - УПРАВЛЕНИЕ КЛИЕНТАМИ
// =================================

class CRM {
    constructor() {
        this.clients = JSON.parse(localStorage.getItem('erp_clients')) || [];
        this.init();
    }

    init() {
        this.loadClients();
        this.setupEventListeners();
    }

    loadClients() {
        // Если есть данные в основной системе, используем их
        if (window.erpSystem && window.erpSystem.data.clients) {
            this.clients = window.erpSystem.data.clients;
        }
    }

    addClient(clientData) {
        const newClient = {
            id: this.generateId(),
            ...clientData,
            createdAt: new Date().toISOString(),
            totalOrders: 0,
            totalSpent: 0,
            status: 'new'
        };

        this.clients.push(newClient);
        this.saveToStorage();
        this.updateClientStats(newClient.id);
        
        return newClient;
    }

    updateClient(clientId, updates) {
        const clientIndex = this.clients.findIndex(c => c.id === clientId);
        if (clientIndex !== -1) {
            this.clients[clientIndex] = { ...this.clients[clientIndex], ...updates };
            this.saveToStorage();
            return this.clients[clientIndex];
        }
        return null;
    }

    getClient(clientId) {
        return this.clients.find(c => c.id === clientId);
    }

    getClientsByStatus(status) {
        return this.clients.filter(c => c.status === status);
    }

    searchClients(query) {
        const searchTerm = query.toLowerCase();
        return this.clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm) ||
            client.phone.includes(searchTerm) ||
            client.email?.toLowerCase().includes(searchTerm)
        );
    }

    updateClientStats(clientId) {
        // Здесь будет интеграция с модулем заказов
        // Пока заглушка
        console.log(`Updating stats for client ${clientId}`);
    }

    calculateLTV(clientId) {
        const client = this.getClient(clientId);
        if (!client) return 0;

        // Простой расчет LTV (можно усложнить)
        const avgOrderValue = client.totalOrders > 0 ? client.totalSpent / client.totalOrders : 0;
        const purchaseFrequency = this.calculatePurchaseFrequency(clientId);
        
        return avgOrderValue * purchaseFrequency;
    }

    calculatePurchaseFrequency(clientId) {
        const client = this.getClient(clientId);
        if (!client || client.totalOrders === 0) return 0;

        // Здесь будет сложная логика расчета частоты покупок
        // Пока возвращаем упрощенный показатель
        return Math.max(1, client.totalOrders / 3);
    }

    getClientStatus(clientId) {
        const client = this.getClient(clientId);
        if (!client) return 'new';

        if (client.totalSpent > 50000) return 'vip';
        if (client.totalSpent > 20000) return 'regular';
        return 'new';
    }

    generateId() {
        return 'CL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    saveToStorage() {
        localStorage.setItem('erp_clients', JSON.stringify(this.clients));
        
        // Обновляем основную систему если она существует
        if (window.erpSystem) {
            window.erpSystem.data.clients = this.clients;
        }
    }

    setupEventListeners() {
        // Поиск клиентов
        document.addEventListener('input', (e) => {
            if (e.target.id === 'client-search') {
                this.handleClientSearch(e.target.value);
            }
        });
    }

    handleClientSearch(query) {
        if (!query.trim()) {
            this.renderClients(this.clients);
            return;
        }

        const results = this.searchClients(query);
        this.renderClients(results);
    }

    renderClients(clientsArray = this.clients) {
        const container = document.getElementById('clients-container');
        if (!container) return;

        let html = `
            <div class="clients-stats">
                <div class="stat-small">
                    <span>Всего клиентов:</span>
                    <strong>${this.clients.length}</strong>
                </div>
                <div class="stat-small">
                    <span>VIP клиентов:</span>
                    <strong>${this.getClientsByStatus('vip').length}</strong>
                </div>
                <div class="stat-small">
                    <span>Новых:</span>
                    <strong>${this.getClientsByStatus('new').length}</strong>
                </div>
            </div>
            <div class="clients-table-container">
                <table class="clients-table">
                    <thead>
                        <tr>
                            <th>Клиент</th>
                            <th>Контакты</th>
                            <th>Заказы</th>
                            <th>Общая сумма</th>
                            <th>LTV</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        clientsArray.forEach(client => {
            const ltv = this.calculateLTV(client.id);
            const statusClass = this.getClientStatus(client.id);
            
            html += `
                <tr>
                    <td>
                        <div class="client-name">${client.name}</div>
                        <div class="client-date">с ${new Date(client.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                        <div class="client-phone">📞 ${client.phone}</div>
                        ${client.email ? `<div class="client-email">✉️ ${client.email}</div>` : ''}
                    </td>
                    <td class="text-center">${client.totalOrders}</td>
                    <td class="text-center">${formatCurrency(client.totalSpent)}</td>
                    <td class="text-center">${formatCurrency(ltv)}</td>
                    <td class="text-center">
                        <span class="status-badge status-${statusClass}">
                            ${this.getStatusText(statusClass)}
                        </span>
                    </td>
                    <td class="text-center">
                        <div class="action-buttons">
                            <button class="btn-icon" onclick="crmSystem.viewClientDetails(${client.id})" title="Детали">
                                👁️
                            </button>
                            <button class="btn-icon" onclick="crmSystem.contactClient(${client.id})" title="Контакт">
                                📞
                            </button>
                            <button class="btn-icon" onclick="crmSystem.editClient(${client.id})" title="Редактировать">
                                ✏️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    getStatusText(status) {
        const statuses = {
            'new': 'Новый',
            'regular': 'Постоянный',
            'vip': 'VIP'
        };
        return statuses[status] || 'Новый';
    }

    // Методы для взаимодействия с UI
    viewClientDetails(clientId) {
        const client = this.getClient(clientId);
        if (client) {
            this.showClientModal(client);
        }
    }

    contactClient(clientId) {
        const client = this.getClient(clientId);
        if (client) {
            // Здесь может быть интеграция с телефонией или email
            alert(`Контакт клиента: ${client.name}\nТелефон: ${client.phone}${client.email ? `\nEmail: ${client.email}` : ''}`);
        }
    }

    editClient(clientId) {
        const client = this.getClient(clientId);
        if (client) {
            this.showEditClientModal(client);
        }
    }

    showClientModal(client) {
        const modalHtml = `
            <div class="modal-overlay" id="client-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h3>👤 ${client.name}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="client-info-grid">
                            <div class="info-item">
                                <label>Телефон:</label>
                                <span>${client.phone}</span>
                            </div>
                            ${client.email ? `
                            <div class="info-item">
                                <label>Email:</label>
                                <span>${client.email}</span>
                            </div>
                            ` : ''}
                            <div class="info-item">
                                <label>Статус:</label>
                                <span class="status-badge status-${this.getClientStatus(client.id)}">
                                    ${this.getStatusText(this.getClientStatus(client.id))}
                                </span>
                            </div>
                            <div class="info-item">
                                <label>Заказов:</label>
                                <span>${client.totalOrders}</span>
                            </div>
                            <div class="info-item">
                                <label>Общая сумма:</label>
                                <span>${formatCurrency(client.totalSpent)}</span>
                            </div>
                            <div class="info-item">
                                <label>LTV:</label>
                                <span>${formatCurrency(this.calculateLTV(client.id))}</span>
                            </div>
                            <div class="info-item">
                                <label>Клиент с:</label>
                                <span>${new Date(client.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Закрыть</button>
                        <button class="btn-primary" onclick="crmSystem.contactClient(${client.id})">Связаться</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    showEditClientModal(client) {
        // Реализация модального окна редактирования
        alert(`Редактирование клиента: ${client.name}\n(здесь будет форма редактирования)`);
    }
}

// Вспомогательная функция для форматирования валюты
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

// Инициализация CRM системы
let crmSystem;

document.addEventListener('DOMContentLoaded', function() {
    crmSystem = new CRM();
    
    // Если перешли на вкладку CRM, рендерим клиентов
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'crm') {
        crmSystem.renderClients();
    }
});

// Глобальные функции для вызова из HTML
function showAddClientModal() {
    // Реализация модального окна добавления клиента
    const modalHtml = `
        <div class="modal-overlay" id="add-client-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3>➕ Добавить клиента</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="add-client-form">
                        <div class="form-group">
                            <label for="client-name">ФИО *</label>
                            <input type="text" id="client-name" required>
                        </div>
                        <div class="form-group">
                            <label for="client-phone">Телефон *</label>
                            <input type="tel" id="client-phone" required>
                        </div>
                        <div class="form-group">
                            <label for="client-email">Email</label>
                            <input type="email" id="client-email">
                        </div>
                        <div class="form-group">
                            <label for="client-notes">Заметки</label>
                            <textarea id="client-notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                    <button class="btn-primary" onclick="addNewClient()">Добавить</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function addNewClient() {
    const form = document.getElementById('add-client-form');
    const formData = new FormData(form);
    
    const clientData = {
        name: document.getElementById('client-name').value,
        phone: document.getElementById('client-phone').value,
        email: document.getElementById('client-email').value || '',
        notes: document.getElementById('client-notes').value || ''
    };

    if (!clientData.name || !clientData.phone) {
        alert('Пожалуйста, заполните обязательные поля (ФИО и телефон)');
        return;
    }

    crmSystem.addClient(clientData);
    document.getElementById('add-client-modal').remove();
    alert('Клиент успешно добавлен!');
}
