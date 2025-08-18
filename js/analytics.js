/**
 * Gerenciamento da Aba Analítica
 */

class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.stats = {};
        
        this.init();
    }

    init() {
        this.updateAnalytics();
    }

    /**
     * Atualiza as análises
     */
    updateAnalytics() {
        this.calculateStats();
        this.updateStatsCards();
        this.renderCharts();
    }

    /**
     * Calcula estatísticas
     */
    calculateStats() {
        if (!window.projectManager) {
            this.stats = {
                totalProjects: 0,
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                overdueTasks: 0,
                pendingTasks: 0,
                tasksByStatus: {},
                tasksByResponsible: {},
                tasksByProject: {},
                projectStatus: {}
            };
            return;
        }

        const projects = window.projectManager.getAllProjects();
        const allTasks = window.projectManager.getAllTasks();

        // Estatísticas básicas
        this.stats = {
            totalProjects: projects.length,
            totalTasks: allTasks.length,
            completedTasks: 0,
            inProgressTasks: 0,
            overdueTasks: 0,
            pendingTasks: 0,
            tasksByStatus: {},
            tasksByResponsible: {},
            tasksByProject: {},
            projectStatus: {}
        };

        // Analisar tarefas
        allTasks.forEach(task => {
            const status = task.status || Utils.calculateTaskStatus(task.startDate, task.endDate);
            
            // Contar por status
            switch (status) {
                case 'completed':
                    this.stats.completedTasks++;
                    break;
                case 'in-progress':
                    this.stats.inProgressTasks++;
                    break;
                case 'overdue':
                    this.stats.overdueTasks++;
                    break;
                case 'pending':
                    this.stats.pendingTasks++;
                    break;
            }

            // Agrupar por status
            if (!this.stats.tasksByStatus[status]) {
                this.stats.tasksByStatus[status] = 0;
            }
            this.stats.tasksByStatus[status]++;

            // Agrupar por responsável
            if (!this.stats.tasksByResponsible[task.responsible]) {
                this.stats.tasksByResponsible[task.responsible] = 0;
            }
            this.stats.tasksByResponsible[task.responsible]++;

            // Agrupar por projeto
            if (!this.stats.tasksByProject[task.projectName]) {
                this.stats.tasksByProject[task.projectName] = 0;
            }
            this.stats.tasksByProject[task.projectName]++;
        });

        // Analisar status dos projetos
        projects.forEach(project => {
            const projectStatus = window.projectManager.getProjectStatus(project);
            if (!this.stats.projectStatus[projectStatus]) {
                this.stats.projectStatus[projectStatus] = 0;
            }
            this.stats.projectStatus[projectStatus]++;
        });
    }

    /**
     * Atualiza os cards de estatísticas
     */
    updateStatsCards() {
        document.getElementById('totalProjects').textContent = this.stats.totalProjects;
        document.getElementById('completedTasks').textContent = this.stats.completedTasks;
        document.getElementById('inProgressTasks').textContent = this.stats.inProgressTasks;
        document.getElementById('overdueTasks').textContent = this.stats.overdueTasks;
    }

    /**
     * Renderiza os gráficos
     */
    renderCharts() {
        this.renderStatusChart();
        this.renderResponsibleChart();
    }

    /**
     * Renderiza gráfico de status das etapas
     */
    renderStatusChart() {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        // Destruir gráfico existente
        if (this.charts.statusChart) {
            this.charts.statusChart.destroy();
        }

        const statusLabels = {
            'completed': 'Concluídas',
            'in-progress': 'Em Andamento',
            'overdue': 'Atrasadas',
            'pending': 'Pendentes'
        };

        const data = {
            labels: Object.keys(this.stats.tasksByStatus).map(status => statusLabels[status] || status),
            datasets: [{
                data: Object.values(this.stats.tasksByStatus),
                backgroundColor: [
                    '#10b981', // Verde para concluídas
                    '#f59e0b', // Amarelo para em andamento
                    '#ef4444', // Vermelho para atrasadas
                    '#64748b'  // Cinza para pendentes
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };

        this.charts.statusChart = new Chart(ctx, config);
    }

    /**
     * Renderiza gráfico de responsáveis
     */
    renderResponsibleChart() {
        const ctx = document.getElementById('responsibleChart');
        if (!ctx) return;

        // Destruir gráfico existente
        if (this.charts.responsibleChart) {
            this.charts.responsibleChart.destroy();
        }

        const responsibleData = Object.entries(this.stats.tasksByResponsible)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10 responsáveis

        if (responsibleData.length === 0) {
            ctx.style.display = 'none';
            return;
        }

        ctx.style.display = 'block';

        const data = {
            labels: responsibleData.map(([responsible, count]) => responsible),
            datasets: [{
                label: 'Etapas',
                data: responsibleData.map(([responsible, count]) => count),
                backgroundColor: '#2563eb',
                borderColor: '#1d4ed8',
                borderWidth: 1,
                borderRadius: 4
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return `${context.parsed.y} etapa(s)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                }
            }
        };

        this.charts.responsibleChart = new Chart(ctx, config);
    }

    /**
     * Gera relatório analítico completo
     */
    generateAnalyticsReport() {
        const report = {
            title: 'RELATÓRIO ANALÍTICO - GERENCIADOR DE PROJETOS',
            generatedAt: new Date().toLocaleString('pt-BR'),
            summary: this.generateSummary(),
            details: this.generateDetails(),
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    /**
     * Gera resumo executivo
     */
    generateSummary() {
        const totalTasks = this.stats.totalTasks;
        const completionRate = totalTasks > 0 ? ((this.stats.completedTasks / totalTasks) * 100).toFixed(1) : 0;
        const overdueRate = totalTasks > 0 ? ((this.stats.overdueTasks / totalTasks) * 100).toFixed(1) : 0;

        return {
            totalProjects: this.stats.totalProjects,
            totalTasks: totalTasks,
            completionRate: `${completionRate}%`,
            overdueRate: `${overdueRate}%`,
            status: this.getOverallStatus()
        };
    }

    /**
     * Gera detalhes da análise
     */
    generateDetails() {
        return {
            projectsByStatus: this.stats.projectStatus,
            tasksByStatus: this.stats.tasksByStatus,
            topResponsibles: Object.entries(this.stats.tasksByResponsible)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            topProjects: Object.entries(this.stats.tasksByProject)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        };
    }

    /**
     * Gera recomendações baseadas nos dados
     */
    generateRecommendations() {
        const recommendations = [];

        // Análise de tarefas atrasadas
        if (this.stats.overdueTasks > 0) {
            recommendations.push({
                type: 'warning',
                title: 'Tarefas Atrasadas',
                description: `${this.stats.overdueTasks} tarefa(s) estão atrasadas. Revise os prazos e prioridades.`
            });
        }

        // Análise de distribuição de trabalho
        const responsibles = Object.entries(this.stats.tasksByResponsible);
        if (responsibles.length > 1) {
            const maxTasks = Math.max(...responsibles.map(([name, count]) => count));
            const minTasks = Math.min(...responsibles.map(([name, count]) => count));
            const difference = maxTasks - minTasks;

            if (difference > 3) {
                recommendations.push({
                    type: 'info',
                    title: 'Distribuição de Trabalho',
                    description: 'Há uma distribuição desigual de tarefas entre os responsáveis. Considere rebalancear.'
                });
            }
        }

        // Análise de projetos sem tarefas
        if (this.stats.totalProjects > 0 && this.stats.totalTasks === 0) {
            recommendations.push({
                type: 'info',
                title: 'Projetos sem Etapas',
                description: 'Todos os projetos estão sem etapas definidas. Adicione etapas para melhor acompanhamento.'
            });
        }

        // Análise de taxa de conclusão
        const completionRate = this.stats.totalTasks > 0 ? (this.stats.completedTasks / this.stats.totalTasks) * 100 : 0;
        if (completionRate < 50 && this.stats.totalTasks > 5) {
            recommendations.push({
                type: 'warning',
                title: 'Baixa Taxa de Conclusão',
                description: `Apenas ${completionRate.toFixed(1)}% das tarefas estão concluídas. Revise os processos.`
            });
        }

        return recommendations;
    }

    /**
     * Obtém status geral baseado nas estatísticas
     */
    getOverallStatus() {
        if (this.stats.totalTasks === 0) return 'Sem dados suficientes';
        
        const overdueRate = (this.stats.overdueTasks / this.stats.totalTasks) * 100;
        const completionRate = (this.stats.completedTasks / this.stats.totalTasks) * 100;

        if (overdueRate > 30) return 'Crítico';
        if (overdueRate > 15) return 'Atenção';
        if (completionRate > 80) return 'Excelente';
        if (completionRate > 60) return 'Bom';
        return 'Regular';
    }

    /**
     * Exporta dados analíticos
     */
    exportAnalyticsData() {
        return {
            stats: this.stats,
            report: this.generateAnalyticsReport(),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Atualiza gráficos quando a janela é redimensionada
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    /**
     * Limpa todos os gráficos
     */
    clearCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    /**
     * Mostra detalhes de um responsável
     */
    showResponsibleDetails(responsibleName) {
        if (!window.projectManager) return;

        const allTasks = window.projectManager.getAllTasks();
        const responsibleTasks = allTasks.filter(task => task.responsible === responsibleName);

        const statusCount = {
            completed: 0,
            'in-progress': 0,
            overdue: 0,
            pending: 0
        };

        responsibleTasks.forEach(task => {
            const status = Utils.calculateTaskStatus(task.startDate, task.endDate);
            statusCount[status]++;
        });

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Detalhes do Responsável: ${Utils.sanitizeText(responsibleName)}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <h3>Resumo</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                            <div style="text-align: center; padding: 1rem; background: var(--background-color); border-radius: var(--border-radius);">
                                <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${responsibleTasks.length}</div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary);">Total de Etapas</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: var(--background-color); border-radius: var(--border-radius);">
                                <div style="font-size: 2rem; font-weight: bold; color: var(--success-color);">${statusCount.completed}</div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary);">Concluídas</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h3>Status das Etapas</h3>
                        <div style="margin-top: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span>Concluídas</span>
                                <span class="task-status completed">${statusCount.completed}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span>Em Andamento</span>
                                <span class="task-status in-progress">${statusCount['in-progress']}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span>Atrasadas</span>
                                <span class="task-status overdue">${statusCount.overdue}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span>Pendentes</span>
                                <span class="task-status pending">${statusCount.pending}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3>Etapas</h3>
                        <div style="margin-top: 1rem; max-height: 300px; overflow-y: auto;">
                            ${responsibleTasks.map(task => `
                                <div style="padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); margin-bottom: 0.5rem;">
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${Utils.sanitizeText(task.name)}</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                        Projeto: ${Utils.sanitizeText(task.projectName)} | 
                                        Período: ${Utils.formatDate(task.startDate)} - ${Utils.formatDate(task.endDate)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fechar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Instancia o gerenciador analítico
const analyticsManager = new AnalyticsManager();
window.analyticsManager = analyticsManager;

// Redimensionar gráficos quando a janela for redimensionada
window.addEventListener('resize', Utils.debounce(() => {
    if (window.analyticsManager) {
        window.analyticsManager.resizeCharts();
    }
}, 250));
