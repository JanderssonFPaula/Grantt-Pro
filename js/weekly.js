/**
 * Gerenciamento da Distribuição Semanal
 */

class WeeklyManager {
    constructor() {
        this.weeklyData = {};
        this.draggedElement = null;
        this.dragOverElement = null;
        
        this.init();
    }

    init() {
        this.loadWeeklyData();
        this.bindEvents();
        this.renderWeeklyView();
    }

    /**
     * Carrega dados da distribuição semanal
     */
    loadWeeklyData() {
        this.weeklyData = Utils.loadFromStorage('weeklyData', {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        });
    }

    /**
     * Salva dados da distribuição semanal
     */
    saveWeeklyData() {
        Utils.saveToStorage('weeklyData', this.weeklyData);
    }

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Drag and drop events
        document.addEventListener('dragstart', (e) => {
            this.handleDragStart(e);
        });

        document.addEventListener('dragend', (e) => {
            this.handleDragEnd(e);
        });

        document.addEventListener('dragover', (e) => {
            this.handleDragOver(e);
        });

        document.addEventListener('drop', (e) => {
            this.handleDrop(e);
        });

        document.addEventListener('dragenter', (e) => {
            this.handleDragEnter(e);
        });

        document.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e);
        });
    }

    /**
     * Renderiza a visualização semanal
     */
    renderWeeklyView() {
        this.renderAvailableTasks();
        this.renderWeekGrid();
    }

    /**
     * Renderiza as tarefas disponíveis
     */
    renderAvailableTasks() {
        const availableTasksContainer = document.getElementById('availableTasks');
        
        if (!window.projectManager) {
            availableTasksContainer.innerHTML = '<p>Carregando...</p>';
            return;
        }

        const allTasks = window.projectManager.getAllTasks();
        const allocatedTaskIds = this.getAllAllocatedTaskIds();
        const availableTasks = allTasks.filter(task => !allocatedTaskIds.includes(task.id));

        if (availableTasks.length === 0) {
            availableTasksContainer.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: var(--text-secondary);">
                    <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p>Todas as etapas foram alocadas!</p>
                </div>
            `;
            return;
        }

        availableTasksContainer.innerHTML = availableTasks.map(task => 
            this.createAvailableTaskElement(task)
        ).join('');
    }

    /**
     * Cria elemento de tarefa disponível
     */
    createAvailableTaskElement(task) {
        const status = task.status || Utils.calculateTaskStatus(task.startDate, task.endDate);
        const statusText = {
            'completed': 'Concluída',
            'in-progress': 'Em Andamento',
            'overdue': 'Atrasada',
            'pending': 'Pendente'
        }[status];

        return `
            <div class="available-task" 
                 draggable="true" 
                 data-task-id="${task.id}"
                 data-project-id="${task.projectId}">
                <div class="available-task-header">
                    <span class="available-task-name">${Utils.sanitizeText(task.name)}</span>
                    <span class="available-task-project">${Utils.sanitizeText(task.projectName)}</span>
                </div>
                <div class="available-task-details">
                    <span class="available-task-responsible">${Utils.sanitizeText(task.responsible)}</span>
                    <span class="available-task-dates">${Utils.formatDate(task.startDate)} - ${Utils.formatDate(task.endDate)}</span>
                </div>
                <div style="margin-top: 0.5rem;">
                    <span class="task-status ${status}">${statusText}</span>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza a grade semanal
     */
    renderWeekGrid() {
        const weekGrid = document.getElementById('weekGrid');
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

        weekGrid.innerHTML = days.map((day, index) => {
            const dayTasks = this.weeklyData[day] || [];
            return this.createDayElement(day, dayNames[index], dayTasks);
        }).join('');
    }

    /**
     * Cria elemento de dia da semana
     */
    createDayElement(dayKey, dayName, tasks) {
        const tasksHtml = tasks.length > 0 
            ? tasks.map(task => this.createDayTaskElement(task, dayKey)).join('')
            : `<div class="week-day-empty">Arraste etapas aqui</div>`;

        return `
            <div class="week-day" data-day="${dayKey}">
                <div class="week-day-header">${dayName}</div>
                <div class="week-day-tasks">
                    ${tasksHtml}
                </div>
            </div>
        `;
    }

    /**
     * Cria elemento de tarefa no dia
     */
    createDayTaskElement(task, dayKey) {
        const status = task.status || Utils.calculateTaskStatus(task.startDate, task.endDate);
        const statusText = {
            'completed': 'Concluída',
            'in-progress': 'Em Andamento',
            'overdue': 'Atrasada',
            'pending': 'Pendente'
        }[status];

        return `
            <div class="week-day-task" 
                 draggable="true" 
                 data-task-id="${task.id}"
                 data-day="${dayKey}">
                <div class="week-day-task-header">
                    <span class="week-day-task-name">${Utils.sanitizeText(task.name)}</span>
                    <button class="week-day-task-remove" onclick="weeklyManager.removeTaskFromDay('${task.id}', '${dayKey}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="week-day-task-details">
                    <div class="week-day-task-project">${Utils.sanitizeText(task.projectName)}</div>
                    <div class="week-day-task-responsible">${Utils.sanitizeText(task.responsible)}</div>
                    <div class="week-day-task-time">${Utils.formatDate(task.startDate)} - ${Utils.formatDate(task.endDate)}</div>
                </div>
                <div style="margin-top: 0.5rem;">
                    <span class="task-status ${status}">${statusText}</span>
                </div>
            </div>
        `;
    }

    /**
     * Obtém todos os IDs de tarefas alocadas
     */
    getAllAllocatedTaskIds() {
        return Object.values(this.weeklyData).flat().map(task => task.id);
    }

    /**
     * Atualiza tarefas disponíveis
     */
    updateAvailableTasks() {
        this.renderAvailableTasks();
    }

    /**
     * Remove tarefa de um dia
     */
    removeTaskFromDay(taskId, dayKey) {
        this.weeklyData[dayKey] = this.weeklyData[dayKey].filter(task => task.id !== taskId);
        this.saveWeeklyData();
        this.renderWeeklyView();
        
        Utils.showToast('Etapa removida do dia!', 'success');
    }

    /**
     * Adiciona tarefa a um dia
     */
    addTaskToDay(task, dayKey) {
        if (!this.weeklyData[dayKey]) {
            this.weeklyData[dayKey] = [];
        }
        
        // Verificar se a tarefa já não está alocada em outro dia
        const isAlreadyAllocated = Object.values(this.weeklyData).some(dayTasks => 
            dayTasks.some(t => t.id === task.id)
        );
        
        if (isAlreadyAllocated) {
            Utils.showToast('Esta etapa já está alocada em outro dia!', 'warning');
            return false;
        }
        
        this.weeklyData[dayKey].push(task);
        this.saveWeeklyData();
        this.renderWeeklyView();
        
        Utils.showToast(`Etapa alocada para ${this.getDayName(dayKey)}!`, 'success');
        return true;
    }

    /**
     * Obtém nome do dia
     */
    getDayName(dayKey) {
        const dayNames = {
            'monday': 'Segunda',
            'tuesday': 'Terça',
            'wednesday': 'Quarta',
            'thursday': 'Quinta',
            'friday': 'Sexta',
            'saturday': 'Sábado',
            'sunday': 'Domingo'
        };
        return dayNames[dayKey] || dayKey;
    }

    /**
     * Manipula início do drag
     */
    handleDragStart(e) {
        if (e.target.classList.contains('available-task') || e.target.classList.contains('week-day-task')) {
            this.draggedElement = e.target;
            e.target.classList.add('dragging');
            
            const taskId = e.target.dataset.taskId;
            const task = this.findTaskById(taskId);
            
            if (task) {
                e.dataTransfer.setData('text/plain', JSON.stringify(task));
                e.dataTransfer.effectAllowed = 'move';
            }
        }
    }

    /**
     * Manipula fim do drag
     */
    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement = null;
        }
        
        // Remover classes de drag over
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    }

    /**
     * Manipula drag over
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * Manipula drag enter
     */
    handleDragEnter(e) {
        e.preventDefault();
        
        if (e.target.classList.contains('week-day')) {
            e.target.classList.add('drag-over');
        }
    }

    /**
     * Manipula drag leave
     */
    handleDragLeave(e) {
        if (e.target.classList.contains('week-day')) {
            e.target.classList.remove('drag-over');
        }
    }

    /**
     * Manipula drop
     */
    handleDrop(e) {
        e.preventDefault();
        
        if (e.target.classList.contains('week-day')) {
            e.target.classList.remove('drag-over');
            
            const dayKey = e.target.dataset.day;
            const taskData = e.dataTransfer.getData('text/plain');
            
            if (taskData) {
                try {
                    const task = JSON.parse(taskData);
                    this.addTaskToDay(task, dayKey);
                } catch (error) {
                    console.error('Erro ao processar dados da tarefa:', error);
                }
            }
        }
    }

    /**
     * Encontra tarefa por ID
     */
    findTaskById(taskId) {
        if (!window.projectManager) return null;
        
        const allTasks = window.projectManager.getAllTasks();
        return allTasks.find(task => task.id === taskId);
    }

    /**
     * Limpa toda a distribuição semanal
     */
    async clearWeeklyDistribution() {
        const confirmed = await Utils.confirm(
            'Tem certeza que deseja limpar toda a distribuição semanal? Esta ação não pode ser desfeita.',
            'Limpar Distribuição'
        );

        if (!confirmed) return;

        this.weeklyData = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        };
        
        this.saveWeeklyData();
        this.renderWeeklyView();
        
        Utils.showToast('Distribuição semanal limpa!', 'success');
    }

    /**
     * Obtém estatísticas da distribuição semanal
     */
    getWeeklyStats() {
        const stats = {
            totalAllocated: 0,
            totalAvailable: 0,
            byDay: {},
            byProject: {},
            byResponsible: {}
        };

        // Contar tarefas alocadas
        Object.entries(this.weeklyData).forEach(([day, tasks]) => {
            stats.byDay[day] = tasks.length;
            stats.totalAllocated += tasks.length;
            
            tasks.forEach(task => {
                // Por projeto
                if (!stats.byProject[task.projectName]) {
                    stats.byProject[task.projectName] = 0;
                }
                stats.byProject[task.projectName]++;
                
                // Por responsável
                if (!stats.byResponsible[task.responsible]) {
                    stats.byResponsible[task.responsible] = 0;
                }
                stats.byResponsible[task.responsible]++;
            });
        });

        // Contar tarefas disponíveis
        if (window.projectManager) {
            const allTasks = window.projectManager.getAllTasks();
            const allocatedTaskIds = this.getAllAllocatedTaskIds();
            stats.totalAvailable = allTasks.filter(task => !allocatedTaskIds.includes(task.id)).length;
        }

        return stats;
    }

    /**
     * Exporta dados da distribuição semanal
     */
    exportWeeklyData() {
        return {
            weeklyData: this.weeklyData,
            stats: this.getWeeklyStats(),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Importa dados da distribuição semanal
     */
    importWeeklyData(data) {
        if (data.weeklyData) {
            this.weeklyData = data.weeklyData;
            this.saveWeeklyData();
            this.renderWeeklyView();
        }
    }

    /**
     * Gera relatório da distribuição semanal
     */
    generateWeeklyReport() {
        const stats = this.getWeeklyStats();
        const dayNames = {
            'monday': 'Segunda-feira',
            'tuesday': 'Terça-feira',
            'wednesday': 'Quarta-feira',
            'thursday': 'Quinta-feira',
            'friday': 'Sexta-feira',
            'saturday': 'Sábado',
            'sunday': 'Domingo'
        };

        let report = 'RELATÓRIO DA DISTRIBUIÇÃO SEMANAL\n';
        report += '=====================================\n\n';
        
        report += `Total de etapas alocadas: ${stats.totalAllocated}\n`;
        report += `Total de etapas disponíveis: ${stats.totalAvailable}\n\n`;
        
        report += 'Distribuição por dia:\n';
        Object.entries(stats.byDay).forEach(([day, count]) => {
            report += `- ${dayNames[day]}: ${count} etapa(s)\n`;
        });
        
        report += '\nDistribuição por projeto:\n';
        Object.entries(stats.byProject).forEach(([project, count]) => {
            report += `- ${project}: ${count} etapa(s)\n`;
        });
        
        report += '\nDistribuição por responsável:\n';
        Object.entries(stats.byResponsible).forEach(([responsible, count]) => {
            report += `- ${responsible}: ${count} etapa(s)\n`;
        });

        return report;
    }
}

// Instancia o gerenciador semanal
const weeklyManager = new WeeklyManager();
window.weeklyManager = weeklyManager;
