/**
 * Gerenciamento do Gráfico de Gantt - Versão Simplificada
 */

class SimpleGanttManager {
    constructor() {
        this.filters = {
            project: '',
            responsible: ''
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateGantt();
    }

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Filtros
        const projectFilter = document.getElementById('projectFilter');
        const responsibleFilter = document.getElementById('responsibleFilter');
        
        if (projectFilter) {
            projectFilter.addEventListener('change', (e) => {
                this.filters.project = e.target.value;
                this.updateGantt();
            });
        }

        if (responsibleFilter) {
            responsibleFilter.addEventListener('change', (e) => {
                this.filters.responsible = e.target.value;
                this.updateGantt();
            });
        }
    }

    /**
     * Atualiza o gráfico de Gantt
     */
    updateGantt() {
        const ganttContainer = document.getElementById('ganttChart');
        
        if (!window.projectManager) {
            ganttContainer.innerHTML = '<div class="gantt-loading">Carregando...</div>';
            return;
        }

        const projects = window.projectManager.getAllProjects();
        
        if (projects.length === 0) {
            ganttContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nenhum projeto disponível</p>
                    <p>Crie projetos para visualizar o gráfico de Gantt</p>
                </div>
            `;
            return;
        }

        this.updateFilters(projects);
        this.renderSimpleGantt(projects);
    }

    /**
     * Atualiza os filtros disponíveis
     */
    updateFilters(projects) {
        const projectFilter = document.getElementById('projectFilter');
        const responsibleFilter = document.getElementById('responsibleFilter');

        if (!projectFilter || !responsibleFilter) return;

        // Projetos
        const projectOptions = ['<option value="">Todos os Projetos</option>'];
        const uniqueProjects = [...new Set(projects.map(p => p.name))];
        uniqueProjects.forEach(projectName => {
            projectOptions.push(`<option value="${projectName}">${projectName}</option>`);
        });
        projectFilter.innerHTML = projectOptions.join('');

        // Responsáveis
        const responsibleOptions = ['<option value="">Todos os Responsáveis</option>'];
        const allTasks = projects.flatMap(p => p.tasks || []);
        const uniqueResponsibles = [...new Set(allTasks.map(t => t.responsible))];
        uniqueResponsibles.forEach(responsible => {
            responsibleOptions.push(`<option value="${responsible}">${responsible}</option>`);
        });
        responsibleFilter.innerHTML = responsibleOptions.join('');

        // Restaurar valores dos filtros
        if (this.filters.project) {
            projectFilter.value = this.filters.project;
        }
        if (this.filters.responsible) {
            responsibleFilter.value = this.filters.responsible;
        }
    }

    /**
     * Renderiza um gráfico de Gantt simplificado
     */
    renderSimpleGantt(projects) {
        const ganttContainer = document.getElementById('ganttChart');
        
        // Filtrar projetos
        const filteredProjects = projects.filter(project => {
            if (this.filters.project && project.name !== this.filters.project) {
                return false;
            }
            return true;
        });

        if (filteredProjects.length === 0) {
            ganttContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-filter" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nenhum projeto encontrado com os filtros aplicados</p>
                    <p>Tente ajustar os filtros</p>
                </div>
            `;
            return;
        }

        // Calcular período total
        const allDates = [];
        filteredProjects.forEach(project => {
            // Incluir datas do projeto mesmo se não tiver tarefas
            allDates.push(new Date(project.startDate));
            allDates.push(new Date(project.endDate));
            
            if (project.tasks) {
                project.tasks.forEach(task => {
                    if (this.filters.responsible && task.responsible !== this.filters.responsible) {
                        return;
                    }
                    allDates.push(new Date(task.startDate));
                    allDates.push(new Date(task.endDate));
                });
            }
        });

        if (allDates.length === 0) {
            ganttContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nenhuma data encontrada</p>
                </div>
            `;
            return;
        }

        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));
        const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

        // Criar HTML do gráfico
        let html = `
            <div class="simple-gantt">
                <div class="gantt-header">
                    <div class="gantt-timeline">
                        <div class="timeline-header">Projeto / Tarefa</div>
                        <div class="timeline-dates">
        `;

        // Adicionar cabeçalho com datas
        for (let i = 0; i < totalDays; i++) {
            const currentDate = new Date(minDate);
            currentDate.setDate(minDate.getDate() + i);
            const dayOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][currentDate.getDay()];
            const dayOfMonth = currentDate.getDate();
            
            html += `
                <div class="timeline-day ${currentDate.getDay() === 0 || currentDate.getDay() === 6 ? 'weekend' : ''}">
                    <div class="day-name">${dayOfWeek}</div>
                    <div class="day-number">${dayOfMonth}</div>
                </div>
            `;
        }

        html += `
                        </div>
                    </div>
                </div>
                <div class="gantt-body">
        `;

        // Adicionar projetos e tarefas
        filteredProjects.forEach(project => {
            // Projeto (sempre mostrar)
            html += `
                <div class="gantt-project">
                    <div class="project-header">
                        <i class="fas fa-folder"></i>
                        <span>${Utils.sanitizeText(project.name)}</span>
                    </div>
                    <div class="project-timeline">
            `;

            // Adicionar barras para cada dia
            for (let i = 0; i < totalDays; i++) {
                const currentDate = new Date(minDate);
                currentDate.setDate(minDate.getDate() + i);
                
                const projectStart = new Date(project.startDate);
                const projectEnd = new Date(project.endDate);
                const isInProjectPeriod = currentDate >= projectStart && currentDate <= projectEnd;
                
                html += `
                    <div class="timeline-cell ${isInProjectPeriod ? 'project-period' : ''} ${currentDate.getDay() === 0 || currentDate.getDay() === 6 ? 'weekend' : ''}">
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;

            // Tarefas do projeto (se existirem)
            if (project.tasks && project.tasks.length > 0) {
                project.tasks.forEach(task => {
                    if (this.filters.responsible && task.responsible !== this.filters.responsible) {
                        return;
                    }

                    const status = task.status || Utils.calculateTaskStatus(task.startDate, task.endDate);
                    const progress = Utils.calculateProgress(task.startDate, task.endDate);

                    html += `
                        <div class="gantt-task" data-task-id="${task.id}">
                            <div class="task-header">
                                <i class="fas fa-tasks"></i>
                                <span>${Utils.sanitizeText(task.name)} (${Utils.sanitizeText(task.responsible)})</span>
                                <span class="task-status ${status}">${this.getStatusText(status)}</span>
                            </div>
                            <div class="task-timeline">
                    `;

                    // Adicionar barras para cada dia
                    for (let i = 0; i < totalDays; i++) {
                        const currentDate = new Date(minDate);
                        currentDate.setDate(minDate.getDate() + i);
                        
                        const taskStart = new Date(task.startDate);
                        const taskEnd = new Date(task.endDate);
                        const isInTaskPeriod = currentDate >= taskStart && currentDate <= taskEnd;
                        
                        let cellClass = `timeline-cell ${currentDate.getDay() === 0 || currentDate.getDay() === 6 ? 'weekend' : ''}`;
                        if (isInTaskPeriod) {
                            cellClass += ` task-period task-${status}`;
                        }
                        
                        html += `<div class="${cellClass}"></div>`;
                    }

                    html += `
                            </div>
                        </div>
                    `;
                });
            }
        });

        html += `
                </div>
            </div>
        `;
        
        ganttContainer.innerHTML = html;

        // Adicionar eventos de clique
        this.addGanttEvents();
    }

    /**
     * Adiciona eventos ao gráfico
     */
    addGanttEvents() {
        const taskElements = document.querySelectorAll('.gantt-task');
        taskElements.forEach(taskElement => {
            taskElement.addEventListener('click', () => {
                const taskId = taskElement.dataset.taskId;
                this.showTaskDetails(taskId);
            });
        });
    }

    /**
     * Mostra detalhes de uma tarefa
     */
    showTaskDetails(taskId) {
        const projects = window.projectManager.getAllProjects();
        for (const project of projects) {
            if (project.tasks) {
                const task = project.tasks.find(t => t.id === taskId);
                if (task) {
                    const status = task.status || Utils.calculateTaskStatus(task.startDate, task.endDate);
                    const statusText = this.getStatusText(status);

                    const modal = document.createElement('div');
                    modal.className = 'modal active';
                    modal.innerHTML = `
                        <div class="modal-content" style="max-width: 500px;">
                            <div class="modal-header">
                                <h2>Detalhes da Etapa</h2>
                                <button class="modal-close" onclick="this.closest('.modal').remove()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div style="padding: 1.5rem;">
                                <div style="margin-bottom: 1rem;">
                                    <strong>Nome:</strong> ${Utils.sanitizeText(task.name)}
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <strong>Projeto:</strong> ${Utils.sanitizeText(project.name)}
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <strong>Responsável:</strong> ${Utils.sanitizeText(task.responsible)}
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <strong>Período:</strong> ${Utils.formatDate(task.startDate)} - ${Utils.formatDate(task.endDate)}
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <strong>Status:</strong> 
                                    <span class="task-status ${status}">${statusText}</span>
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <strong>Duração:</strong> ${Utils.daysBetween(task.startDate, task.endDate)} dias
                                </div>
                            </div>
                            <div class="modal-actions">
                                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fechar</button>
                                <button class="btn btn-primary" onclick="simpleGanttManager.editTask('${taskId}')">Editar</button>
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
                    break;
                }
            }
        }
    }

    /**
     * Edita uma tarefa
     */
    editTask(taskId) {
        const projects = window.projectManager.getAllProjects();
        for (const project of projects) {
            if (project.tasks) {
                const taskIndex = project.tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    // Abrir modal de edição do projeto
                    window.projectManager.openProjectModal(project);
                    
                    // Focar na tarefa específica
                    setTimeout(() => {
                        const taskForm = document.querySelector(`[data-task-id="${taskId}"]`);
                        if (taskForm) {
                            taskForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            taskForm.style.border = '2px solid var(--primary-color)';
                            setTimeout(() => {
                                taskForm.style.border = '';
                            }, 2000);
                        }
                    }, 300);
                    
                    break;
                }
            }
        }
    }

    /**
     * Retorna o texto do status
     */
    getStatusText(status) {
        const statusMap = {
            'completed': 'Concluída',
            'in-progress': 'Em Andamento',
            'overdue': 'Atrasada',
            'pending': 'Pendente'
        };
        return statusMap[status] || status;
    }

    /**
     * Redimensiona o gráfico
     */
    resize() {
        // Implementação simples - apenas recarrega
        this.updateGantt();
    }
}

// Instancia o gerenciador de Gantt simplificado
const simpleGanttManager = new SimpleGanttManager();
window.simpleGanttManager = simpleGanttManager;

// Redimensionar gráfico quando a janela for redimensionada
window.addEventListener('resize', Utils.debounce(() => {
    if (window.simpleGanttManager) {
        window.simpleGanttManager.resize();
    }
}, 250));
