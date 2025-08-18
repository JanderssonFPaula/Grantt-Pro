/**
 * Gerenciamento do Gráfico de Gantt
 */

class GanttManager {
    constructor() {
        this.ganttChart = null;
        this.currentData = [];
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
        document.getElementById('projectFilter').addEventListener('change', (e) => {
            this.filters.project = e.target.value;
            this.updateGantt();
        });

        document.getElementById('responsibleFilter').addEventListener('change', (e) => {
            this.filters.responsible = e.target.value;
            this.updateGantt();
        });
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
        const ganttData = this.prepareGanttData(projects);
        
        if (ganttData.length === 0) {
            ganttContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-filter" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nenhuma tarefa encontrada com os filtros aplicados</p>
                    <p>Tente ajustar os filtros</p>
                </div>
            `;
            return;
        }

        this.renderGantt(ganttData);
    }

    /**
     * Atualiza os filtros disponíveis
     */
    updateFilters(projects) {
        const projectFilter = document.getElementById('projectFilter');
        const responsibleFilter = document.getElementById('responsibleFilter');

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
     * Prepara dados para o gráfico de Gantt
     */
    prepareGanttData(projects) {
        const ganttData = [];
        let taskId = 1;

        console.log('Preparando dados do Gantt. Projetos recebidos:', projects);

        projects.forEach(project => {
            // Verificar se o projeto tem todas as propriedades necessárias
            if (!project || !project.id || !project.name || !project.startDate || !project.endDate) {
                console.warn('Projeto inválido encontrado:', project);
                return;
            }

            // Aplicar filtro de projeto
            if (this.filters.project && project.name !== this.filters.project) {
                return;
            }

            if (!project.tasks || project.tasks.length === 0) {
                console.log('Projeto sem tarefas:', project.name);
                return;
            }

            // Adicionar projeto como grupo
            // Garantir que as datas estão no formato correto (YYYY-MM-DD)
            let projectStartDate, projectEndDate;
            
            try {
                const projectStartDateObj = new Date(project.startDate);
                const projectEndDateObj = new Date(project.endDate);
                
                if (isNaN(projectStartDateObj.getTime()) || isNaN(projectEndDateObj.getTime())) {
                    console.warn('Data inválida encontrada no projeto:', { start: project.startDate, end: project.endDate });
                    return;
                }
                
                projectStartDate = projectStartDateObj.toISOString().split('T')[0];
                projectEndDate = projectEndDateObj.toISOString().split('T')[0];
            } catch (error) {
                console.warn('Erro ao processar datas do projeto:', error);
                return;
            }

            ganttData.push({
                id: `project-${project.id}`,
                name: project.name,
                start: projectStartDate,
                end: projectEndDate,
                progress: 0,
                dependencies: [],
                custom_class: 'project-group'
            });

            // Adicionar tarefas do projeto
            project.tasks.forEach(task => {
                // Verificar se a tarefa tem todas as propriedades necessárias
                if (!task || !task.id || !task.name || !task.startDate || !task.endDate || !task.responsible) {
                    console.warn('Tarefa inválida encontrada:', task);
                    return;
                }

                // Aplicar filtro de responsável
                if (this.filters.responsible && task.responsible !== this.filters.responsible) {
                    return;
                }

                const status = Utils.calculateTaskStatus(task.startDate, task.endDate);
                const progress = Utils.calculateProgress(task.startDate, task.endDate);

                // Garantir que as datas estão no formato correto (YYYY-MM-DD)
                let startDate, endDate;
                
                try {
                    const startDateObj = new Date(task.startDate);
                    const endDateObj = new Date(task.endDate);
                    
                    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
                        console.warn('Data inválida encontrada:', { start: task.startDate, end: task.endDate });
                        return;
                    }
                    
                    startDate = startDateObj.toISOString().split('T')[0];
                    endDate = endDateObj.toISOString().split('T')[0];
                } catch (error) {
                    console.warn('Erro ao processar datas:', error);
                    return;
                }

                ganttData.push({
                    id: `task-${task.id}`,
                    name: `${task.name} (${task.responsible})`,
                    start: startDate,
                    end: endDate,
                    progress: progress,
                    dependencies: [`project-${project.id}`],
                    custom_class: `task-${status}`,
                    project: project.name,
                    responsible: task.responsible,
                    status: status
                });

                taskId++;
            });
        });

        console.log('Dados do Gantt preparados:', ganttData);
        return ganttData;
    }

    /**
     * Renderiza o gráfico de Gantt
     */
    renderGantt(data) {
        const ganttContainer = document.getElementById('ganttChart');
        
        // Limpar container
        ganttContainer.innerHTML = '';

        try {
            console.log('Iniciando renderização do Gantt. Dados:', data);
            console.log('Container:', ganttContainer);
            console.log('Gantt disponível:', typeof Gantt);

            // Verificar se a biblioteca frappe-gantt está disponível
            if (typeof Gantt === 'undefined') {
                console.error('Biblioteca Gantt não está disponível');
                ganttContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>Biblioteca de gráfico não carregada</p>
                        <p>Verifique se o arquivo frappe-gantt.min.js está disponível</p>
                    </div>
                `;
                return;
            }

            // Verificar se o construtor Gantt está funcionando
            if (typeof Gantt !== 'function') {
                console.error('Gantt não é uma função construtora');
                ganttContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>Erro na biblioteca de gráfico</p>
                        <p>Gantt não é uma função construtora válida</p>
                    </div>
                `;
                return;
            }

            // Verificar se os dados são válidos
            if (!Array.isArray(data) || data.length === 0) {
                console.warn('Dados inválidos ou vazios para o Gantt:', data);
                ganttContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>Nenhum dado disponível para o gráfico</p>
                    </div>
                `;
                return;
            }

            // Configurações do gráfico
            const options = {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                view_mode: 'Week',
                date_format: 'YYYY-MM-DD',
                show_weekend: true,
                on_click: (task) => {
                    this.showTaskDetails(task);
                },
                on_date_change: (task, start, end) => {
                    this.updateTaskDates(task, start, end);
                },
                on_progress_change: (task, progress) => {
                    this.updateTaskProgress(task, progress);
                }
            };

            console.log('Criando gráfico com opções:', options);

            // Criar gráfico
            this.ganttChart = new Gantt(ganttContainer, data, options);

            console.log('Gráfico criado com sucesso!');

            // Adicionar estilos customizados
            this.applyCustomStyles();

        } catch (error) {
            console.error('Erro ao renderizar gráfico de Gantt:', error);
            console.error('Stack trace:', error.stack);
            ganttContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Erro ao carregar gráfico de Gantt</p>
                    <p>${error.message}</p>
                    <details style="margin-top: 1rem; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto;">
                        <summary>Detalhes do erro</summary>
                        <pre style="background: #f5f5f5; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; overflow-x: auto;">${error.stack}</pre>
                    </details>
                </div>
            `;
        }
    }

    /**
     * Aplica estilos customizados ao gráfico
     */
    applyCustomStyles() {
        if (!this.ganttChart) return;

        // Estilos para grupos de projeto
        const projectGroups = document.querySelectorAll('.project-group');
        projectGroups.forEach(group => {
            group.style.fontWeight = 'bold';
            group.style.backgroundColor = 'var(--background-color)';
        });

        // Estilos para tarefas por status
        const taskElements = document.querySelectorAll('.bar');
        taskElements.forEach(element => {
            const taskId = element.getAttribute('data-id');
            if (taskId && taskId.startsWith('task-')) {
                const task = this.findTaskById(taskId);
                if (task) {
                    element.classList.add(`task-${task.status}`);
                }
            }
        });
    }

    /**
     * Encontra uma tarefa por ID
     */
    findTaskById(taskId) {
        const projects = window.projectManager.getAllProjects();
        for (const project of projects) {
            if (project.tasks) {
                const task = project.tasks.find(t => `task-${t.id}` === taskId);
                if (task) {
                    return { ...task, projectName: project.name };
                }
            }
        }
        return null;
    }

    /**
     * Mostra detalhes de uma tarefa
     */
    showTaskDetails(task) {
        if (!task || task.id.startsWith('project-')) return;

        const taskData = this.findTaskById(task.id);
        if (!taskData) return;

        const status = Utils.calculateTaskStatus(taskData.startDate, taskData.endDate);
        const statusText = {
            'completed': 'Concluída',
            'in-progress': 'Em Andamento',
            'overdue': 'Atrasada',
            'pending': 'Pendente'
        }[status];

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
                        <strong>Nome:</strong> ${Utils.sanitizeText(taskData.name)}
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>Projeto:</strong> ${Utils.sanitizeText(taskData.projectName)}
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>Responsável:</strong> ${Utils.sanitizeText(taskData.responsible)}
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>Período:</strong> ${Utils.formatDate(taskData.startDate)} - ${Utils.formatDate(taskData.endDate)}
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>Status:</strong> 
                        <span class="task-status ${status}">${statusText}</span>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>Progresso:</strong> ${task.progress || 0}%
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>Duração:</strong> ${Utils.daysBetween(taskData.startDate, taskData.endDate)} dias
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fechar</button>
                    <button class="btn btn-primary" onclick="ganttManager.editTask('${taskData.id}')">Editar</button>
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
     * Atualiza datas de uma tarefa
     */
    updateTaskDates(task, start, end) {
        if (!task || task.id.startsWith('project-')) return;

        const taskId = task.id.replace('task-', '');
        const projects = window.projectManager.getAllProjects();
        
        for (const project of projects) {
            if (project.tasks) {
                const taskIndex = project.tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    project.tasks[taskIndex].startDate = start;
                    project.tasks[taskIndex].endDate = end;
                    
                    // Salvar alterações
                    window.projectManager.saveProjects();
                    window.projectManager.renderProjects();
                    
                    Utils.showToast('Datas da etapa atualizadas!', 'success');
                    break;
                }
            }
        }
    }

    /**
     * Atualiza progresso de uma tarefa
     */
    updateTaskProgress(task, progress) {
        if (!task || task.id.startsWith('project-')) return;

        // Por enquanto, apenas mostra uma notificação
        // Em uma implementação mais avançada, você poderia salvar o progresso
        Utils.showToast(`Progresso da etapa atualizado para ${progress}%`, 'info');
    }

    /**
     * Exporta dados do Gantt
     */
    exportGanttData() {
        const projects = window.projectManager.getAllProjects();
        const ganttData = this.prepareGanttData(projects);
        
        return {
            projects: projects,
            ganttData: ganttData,
            filters: this.filters,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Importa dados do Gantt
     */
    importGanttData(data) {
        if (data.projects) {
            window.projectManager.projects = data.projects;
            window.projectManager.saveProjects();
            window.projectManager.renderProjects();
        }
        
        if (data.filters) {
            this.filters = data.filters;
        }
        
        this.updateGantt();
    }

    /**
     * Redimensiona o gráfico
     */
    resize() {
        if (this.ganttChart && typeof this.ganttChart.refresh === 'function') {
            this.ganttChart.refresh();
        }
    }
}

// Instancia o gerenciador de Gantt
const ganttManager = new GanttManager();
window.ganttManager = ganttManager;

// Redimensionar gráfico quando a janela for redimensionada
window.addEventListener('resize', Utils.debounce(() => {
    if (window.ganttManager) {
        window.ganttManager.resize();
    }
}, 250));
