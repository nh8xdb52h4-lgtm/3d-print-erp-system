// =================================
// МОДУЛЬ УПРАВЛЕНИЯ ПРИНТЕРАМИ
// =================================

class PrinterManager {
    constructor() {
        this.printers = JSON.parse(localStorage.getItem('erp_printers')) || [];
        this.init();
    }

    init() {
        this.loadPrinters();
        
        // Добавляем демо-данные если принтеров нет
        if (this.printers.length === 0) {
            this.addSamplePrinters();
        }
    }

    loadPrinters() {
        if (window.erpSystem && window.erpSystem.data.printers) {
            this.printers = window.erpSystem.data.printers;
        }
    }

    addSamplePrinters() {
        const samplePrinters = [
            {
                id: 1,
                name: "ANYCUBIC CHIRON",
                model: "CHIRON",
                status: "active",
                type: "FDM",
                power: 0.3,
                materials: ["ABS", "PLA", "PETG"],
                lastMaintenance: "2024-10-15",
                totalHours: 750,
                efficiency: 87,
                currentJob: "RMK-TOYOTA-FUNCARGO-PLA-BLK-M"
            },
            {
                id: 2,
                name: "Creality Ender 3",
                model: "Ender 3",
                status: "maintenance",
                type: "FDM", 
                power: 0.25,
                materials: ["PLA", "PETG"],
                lastMaintenance: "2024-11-01",
                totalHours: 420,
                efficiency: 92,
                currentJob: null,
                maintenanceReason: "Замена сопла"
            },
            {
                id: 3,
                name: "Prusa MK3S+",
                model: "MK3S+",
                status: "active",
                type: "FDM",
                power: 0.28,
                materials: ["ABS", "PLA", "PETG", "TPU"],
                lastMaintenance: "2024-10-20", 
                totalHours: 320,
                efficiency: 95,
                currentJob: "DET-MIRROR-BRACKET-PLA-WHT-S"
            }
        ];

        this.printers = samplePrinters;
        this.saveToStorage();
    }

    getPrinter(printerId) {
        return this.printers.find(p => p.id === printerId);
    }

    getPrintersByStatus(status) {
        return this.printers.filter(p => p.status === status);
    }

    getActivePrinters() {
        return this.getPrintersByStatus('active');
    }

    updatePrinterStatus(printerId, status, reason = '') {
        const printer = this.getPrinter(printerId);
        if (printer) {
            printer.status = status;
            if (reason) {
                printer.maintenanceReason = reason;
            }
            if (status === 'maintenance') {
                printer.maintenanceStart = new Date().toISOString();
            }
            this.saveToStorage();
            return printer;
        }
        return null;
    }

    assignJob(printerId, jobId) {
        const printer = this.getPrinter(printerId);
        if (printer && printer.status === 'active') {
            printer.currentJob = jobId;
            printer.lastJobStart = new Date().toISOString();
            this.saveToStorage();
            return true;
        }
        return false;
    }

    completeJob(printerId) {
        const printer = this.getPrinter(printerId);
        if (printer && printer.currentJob) {
            // Логируем завершение работы
            this.logJobCompletion(printerId, printer.currentJob);
            
            printer.currentJob = null;
            printer.lastJobEnd = new Date().toISOString();
            printer.totalHours += this.calculateJobHours(printer);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    calculateJobHours(printer) {
        // Упрощенный расчет времени работы
        // В реальной системе здесь будет сложная логика
        return 4; // 4 часа для демо
    }

    logJobCompletion(printerId, jobId) {
        const logs = JSON.parse(localStorage.getItem('printer_job_logs')) || [];
        logs.push({
            printerId,
            jobId,
            completedAt: new Date().toISOString(),
            duration: this.calculateJobHours(this.getPrinter(printerId))
        });
        localStorage.setItem('printer_job_logs', JSON.stringify(logs));
    }

    getPrinterEfficiency(printerId) {
        const printer = this.getPrinter(printerId);
        if (!printer) return 0;

        // Упрощенный расчет эффективности
        // В реальной системе здесь будет сложная логика
        return printer.efficiency || 85;
    }

    needsMaintenance(printerId) {
        const printer = this.getPrinter(printerId);
        if (!printer) return false;

        const lastMaintenance = new Date(printer.lastMaintenance);
        const daysSinceMaintenance = (new Date() - lastMaintenance) / (1000 * 60 * 60 * 24);
        
        return daysSinceMaintenance > 30 || printer.totalHours > 500;
    }

    getStatusClass(status) {
        const classes = {
            'active': 'status-active',
            'maintenance': 'status-maintenance', 
            'broken': 'status-broken',
            'idle': 'status-idle'
        };
        return classes[status] || 'status-idle';
    }

    getStatusText(status) {
        const texts = {
            'active': '🟢 Работает',
            'maintenance': '🟡 Обслуживание',
            'broken': '🔴 Сломан',
            'idle': '⚪ Простой'
        };
        return texts[status] || 'Неизвестно';
    }

    saveToStorage() {
        localStorage.setItem('erp_printers', JSON.stringify(this.printers));
        
        if (window.erpSystem) {
            window.erpSystem.data.printers = this.printers;
        }
    }

    renderPrinters(printersArray = this.printers) {
        const container = document.getElementById('printers-container');
        if (!container) return;

        const activeCount = this.getActivePrinters().length;
        const maintenanceCount = this.getPrintersByStatus('maintenance').length;

        let html = `
            <div class="printers-header">
                <div class="printers-stats">
                    <div class="stat-small">
                        <span>Всего принтеров:</span>
                        <strong>${this.printers.length}</strong>
                    </div>
                    <div class="stat-small success">
                        <span>Активных:</span>
                        <strong>${activeCount}</strong>
                    </div>
                    <div class="stat-small warning">
                        <span>На обслуживании:</span>
                        <strong>${maintenanceCount}</strong>
                    </div>
                </div>
            </div>
            <div class="printers-grid">
        `;

        printersArray.forEach(printer => {
            const statusClass = this.getStatusClass(printer.status);
            const needsMaintenance = this.needsMaintenance(printer.id);
            const efficiency = this.getPrinterEfficiency(printer.id);
            
            html += `
                <div class="printer-card ${statusClass}">
                    <div class="printer-header">
                        <h4>${printer.name}</h4>
                        <div class="printer-status">
                            <span class="status-indicator">${this.getStatusText(printer.status)}</span>
                            ${needsMaintenance ? '<span class="maintenance-alert">⚠️ Нужно ТО</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="printer-details">
                        <div class="printer-specs">
                            <div class="spec-item">
                                <span class="spec-label">Модель:</span>
                                <span class="spec-value">${printer.model}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Тип:</span>
                                <span class="spec-value">${printer.type}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Мощность:</span>
                                <span class="spec-value">${printer.power} кВт</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Наработка:</span>
                                <span class="spec-value">${printer.totalHours} ч</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Эффективность:</span>
                                <span class="spec-value">${efficiency}%</span>
                            </div>
                        </div>
                        
                        <div class="printer-materials">
                            <strong>Материалы:</strong>
                            <div class="materials-list">${printer.materials.join(', ')}</div>
                        </div>
                        
                        ${printer.currentJob ? `
                        <div class="current-job">
                            <strong>Текущая работа:</strong>
                            <div class="job-id">${printer.currentJob}</div>
                        </div>
                        ` : ''}
                        
                        ${printer.maintenanceReason ? `
                        <div class="maintenance-info">
                            <strong>Причина обслуживания:</strong>
                            <div>${printer.maintenanceReason}</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="printer-actions">
                        ${printer.status === 'active' ? `
                            <button class="btn-small" onclick="printerManager.pausePrinter(${printer.id})">⏸️ Пауза</button>
                            ${printer.currentJob ? `
                                <button class="btn-small" onclick="printerManager.completeJob(${printer.id})">✅ Завершить</button>
                            ` : `
                                <button class="btn-small" onclick="printerManager.assignJobModal(${printer.id})">🎯 Назначить</button>
                            `}
                        ` : ''}
                        
                        ${printer.status === 'maintenance' ? `
                            <button class="btn-small" onclick="printerManager.completeMaintenance(${printer.id})">🔧 Завершить ТО</button>
                        ` : `
                            <button class="btn-small" onclick="printerManager.startMaintenance(${printer.id})">🔧 Обслужить</button>
                        `}
                        
                        <button class="btn-small" onclick="printerManager.viewDetails(${printer.id})">📊 Детали</button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    // Методы для UI взаимодействия
    pausePrinter(printerId) {
        if (confirm('Приостановить работу принтера?')) {
            this.updatePrinterStatus(printerId, 'idle', 'Приостановлено вручную');
            this.renderPrinters();
            alert('Принтер приостановлен');
        }
    }

    completeJob(printerId) {
        if (this.completeJob(printerId)) {
            this.renderPrinters();
            alert('Работа завершена');
        } else {
            alert('Ошибка завершения работы');
        }
    }

    assignJobModal(printerId) {
        // Здесь будет модальное окно назначения работы
        alert(`Назначение работы принтеру ${printerId}\n(здесь будет форма выбора работы)`);
    }

    startMaintenance(printerId) {
        const reason = prompt('Укажите причину обслуживания:');
        if (reason) {
            this.updatePrinterStatus(printerId, 'maintenance', reason);
            this.renderPrinters();
            alert('Принтер переведен на обслуживание');
        }
    }

    completeMaintenance(printerId) {
        const printer = this.getPrinter(printerId);
        if (printer) {
            printer.status = 'active';
            printer.lastMaintenance = new Date().toISOString();
            printer.maintenanceReason = '';
            printer.maintenanceStart = '';
            this.saveToStorage();
            this.renderPrinters();
            alert('Обслуживание завершено');
        }
    }

    viewDetails(printerId) {
        const printer = this.getPrinter(printerId);
        if (printer) {
            this.showPrinterDetailsModal(printer);
        }
    }

    showPrinterDetailsModal(printer) {
        const efficiency = this.getPrinterEfficiency(printer.id);
        const needsMaintenance = this.needsMaintenance(printer.id);
        
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal large">
                    <div class="modal-header">
                        <h3>🖨️ ${printer.name}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="printer-details-grid">
                            <div class="detail-section">
                                <h4>Основная информация</h4>
                                <div class="details-list">
                                    <div class="detail-item">
                                        <span>Модель:</span>
                                        <span>${printer.model}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span>Тип:</span>
                                        <span>${printer.type}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span>Статус:</span>
                                        <span class="status-${printer.status}">${this.getStatusText(printer.status)}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span>Мощность:</span>
                                        <span>${printer.power} кВт</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Статистика</h4>
                                <div class="details-list">
                                    <div class="detail-item">
                                        <span>Общая наработка:</span>
                                        <span>${printer.totalHours} часов</span>
                                    </div>
                                    <div class="detail-item">
                                        <span>Эффективность:</span>
                                        <span>${efficiency}%</span>
                                    </div>
                                    <div class="detail-item">
                                        <span>Последнее ТО:</span>
                                        <span>${new Date(printer.lastMaintenance).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span>Требуется ТО:</span>
                                        <span class="${needsMaintenance ? 'warning' : 'success'}">
                                            ${needsMaintenance ? '⚠️ Да' : '✅ Нет'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detail-section full-width">
                                <h4>Поддерживаемые материалы</h4>
                                <div class="materials-chips">
                                    ${printer.materials.map(material => 
                                        `<span class="material-chip">${material}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            
                            ${printer.currentJob ? `
                            <div class="detail-section full-width">
                                <h4>Текущая работа</h4>
                                <div class="current-job-info">
                                    <strong>Заказ:</strong> ${printer.currentJob}
                                    ${printer.lastJobStart ? `
                                    <br><strong>Начало:</strong> ${new Date(printer.lastJobStart).toLocaleString()}
                                    ` : ''}
                                </div>
                            </div>
                            ` : ''}
                            
                            ${printer.maintenanceReason ? `
                            <div class="detail-section full-width warning">
                                <h4>Обслуживание</h4>
                                <div class="maintenance-info">
                                    <strong>Причина:</strong> ${printer.maintenanceReason}
                                    ${printer.maintenanceStart ? `
                                    <br><strong>Начато:</strong> ${new Date(printer.maintenanceStart).toLocaleString()}
                                    ` : ''}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

// Инициализация менеджера принтеров
let printerManager;

document.addEventListener('DOMContentLoaded', function() {
    printerManager = new PrinterManager();
});
