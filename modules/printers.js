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
                                <span
