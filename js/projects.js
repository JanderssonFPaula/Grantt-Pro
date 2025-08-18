/**
 * Gerenciamento de Projetos
 */

class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentProject = null;
        this.isEditing = false;
        
        this.init();
    }

    init() {
        this.loadProjects();
        this.bindEvents();
        this.renderProjects();
    }

    /**
     * Carrega projetos do localStorage
     */
    loadProjects() {
        this.projects = Utils.loadFromStorage('projects', []);
    }

    /**
     * Salva projetos no localStorage
     */
    saveProjects() {
        Utils.saveToStorage('projects', this.projects);
    }

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Botão novo projeto
        document.getElementById('newProjectBtn').addEventListener('click', () => {
            this.openProjectModal();
        });

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeProjectModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeProjectModal();
        });

        // Form submit
        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject();
        });

        // Botão adicionar tarefa
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.addTaskForm();
        });

        // Fechar modal ao clicar fora
        document.getElementById('projectModal').addEventListener('click', (e) => {
            if (e.target.id === 'projectModal') {
                this.closeProjectModal();
            }
        });
    }

    /**
     * Abre o modal de projeto
     */
    openProjectModal(project = null) {
        this.currentProject = project;
        this.isEditing = !!project;
        
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('projectForm');
        
        title.textContent = this.isEditing ? 'Editar Projeto' : 'Novo Projeto';
        
        if (this.isEditing) {
            this.populateForm(project);
        } else {
            this.clearForm();
        }
        
        modal.classList.add('active');
        
        // Focar no primeiro campo
        setTimeout(() => {
            document.getElementById('projectName').focus();
        }, 100);
    }

    /**
     * Fecha o modal de projeto
     */
    closeProjectModal() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('active');
        this.currentProject = null;
        this.isEditing = false;
    }

    /**
     * Preenche o formulário com dados do projeto
     */
    populateForm(project) {
        document.getElementById('projectName').value = project.name;
        document.getElementById('startDate').value = Utils.formatDateForInput(project.startDate);
        document.getElementById('endDate').value = Utils.formatDateForInput(project.endDate);
        
        this.renderTasksList(project.tasks || []);
    }

    /**
     * Limpa o formulário
     */
    clearForm() {
        document.getElementById('projectForm').reset();
        this.renderTasksList([]);
    }

    /**
     * Adiciona um formulário de tarefa
     */
    addTaskForm(task = null) {
        const tasksList = document.getElementById('tasksList');
        const taskId = task ? task.id : Utils.generateId();
        
        const taskForm = document.createElement('div');
        taskForm.className = 'task-form';
        taskForm.dataset.taskId = taskId;
        
        taskForm.innerHTML = `
            <div class="task-form-header">
                <span class="task-form-title">Etapa ${tasksList.children.length + 1}</span>
                <button type="button" class="remove-task-btn" onclick="projectManager.removeTaskForm('${taskId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="task-form-grid">
                <div class="form-group">
                    <label for="taskName_${taskId}">Nome da Etapa</label>
                    <input type="text" id="taskName_${taskId}" required value="${task ? task.name : ''}">
                </div>
                <div class="form-group">
                    <label for="taskResponsible_${taskId}">Responsável</label>
                    <input type="text" id="taskResponsible_${taskId}" required value="${task ? task.responsible : ''}">
                </div>
                <div class="form-group">
                    <label for="taskStartDate_${taskId}">Data Início</label>
                    <input type="date" id="taskStartDate_${taskId}" required value="${task ? Utils.formatDateForInput(task.startDate) : ''}">
                </div>
                <div class="form-group">
                    <label for="taskEndDate_${taskId}">Data Fim</label>
                    <input type="date" id="taskEndDate_${taskId}" required value="${task ? Utils.formatDateForInput(task.endDate) : ''}">
                </div>
            </div>
        `;
        
        tasksList.appendChild(taskForm);
    }

    /**
     * Remove um formulário de tarefa
     */
    removeTaskForm(taskId) {
        const taskForm = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskForm) {
            taskForm.remove();
            this.updateTaskNumbers();
        }
    }

    /**
     * Atualiza os números das tarefas
     */
    updateTaskNumbers() {
        const taskForms = document.querySelectorAll('.task-form');
        taskForms.forEach((form, index) => {
            const title = form.querySelector('.task-form-title');
            title.textContent = `Etapa ${index + 1}`;
        });
    }

    /**
     * Renderiza a lista de tarefas no modal
     */
    renderTasksList(tasks) {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
        
        if (tasks.length === 0) {
            this.addTaskForm();
        } else {
            tasks.forEach(task => {
                this.addTaskForm(task);
            });
        }
    }

    /**
     * Coleta dados do formulário
     */
    collectFormData() {
        const projectData = {
            name: document.getElementById('projectName').value.trim(),
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value
        };

        // Coletar tarefas
        const tasks = [];
        const taskForms = document.querySelectorAll('.task-form');
        
        taskForms.forEach(form => {
            const taskId = form.dataset.taskId;
            const task = {
                id: taskId,
                name: document.getElementById(`taskName_${taskId}`).value.trim(),
                responsible: document.getElementById(`taskResponsible_${taskId}`).value.trim(),
                startDate: document.getElementById(`taskStartDate_${taskId}`).value,
                endDate: document.getElementById(`taskEndDate_${taskId}`).value
            };
            
            if (task.name && task.responsible && task.startDate && task.endDate) {
                tasks.push(task);
            }
        });

        return { ...projectData, tasks };
    }

    /**
     * Valida dados do formulário
     */
    validateForm(data) {
        if (!data.name) {
            Utils.showToast('Nome do projeto é obrigatório', 'error');
            return false;
        }

        if (!data.startDate || !data.endDate) {
            Utils.showToast('Datas de início e fim são obrigatórias', 'error');
            return false;
        }

        if (!Utils.isValidDateRange(data.startDate, data.endDate)) {
            Utils.showToast('Data de fim deve ser posterior à data de início', 'error');
            return false;
        }

        if (data.tasks.length === 0) {
            Utils.showToast('Adicione pelo menos uma etapa ao projeto', 'error');
            return false;
        }

        // Validar tarefas
        for (let i = 0; i < data.tasks.length; i++) {
            const task = data.tasks[i];
            
            if (!task.name) {
                Utils.showToast(`Nome da etapa ${i + 1} é obrigatório`, 'error');
                return false;
            }

            if (!task.responsible) {
                Utils.showToast(`Responsável da etapa ${i + 1} é obrigatório`, 'error');
                return false;
            }

            if (!Utils.isValidDateRange(task.startDate, task.endDate)) {
                Utils.showToast(`Datas da etapa ${i + 1} são inválidas`, 'error');
                return false;
            }

            // Verificar se a tarefa está dentro do período do projeto
            if (new Date(task.startDate) < new Date(data.startDate) || 
                new Date(task.endDate) > new Date(data.endDate)) {
                Utils.showToast(`Etapa ${i + 1} deve estar dentro do período do projeto`, 'error');
                return false;
            }
        }

        return true;
    }

    /**
     * Salva o projeto
     */
    saveProject() {
        const formData = this.collectFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        // Preservar status de tarefas existentes ao editar
        if (this.isEditing && this.currentProject && Array.isArray(this.currentProject.tasks)) {
            const statusById = new Map(this.currentProject.tasks.map(t => [t.id, t.status]));
            formData.tasks = formData.tasks.map(t => ({ ...t, status: statusById.get(t.id) || t.status }));
        }

        if (this.isEditing) {
            // Atualizar projeto existente
            const index = this.projects.findIndex(p => p.id === this.currentProject.id);
            if (index !== -1) {
                this.projects[index] = {
                    ...this.currentProject,
                    ...formData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Criar novo projeto
            const newProject = {
                id: Utils.generateId(),
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.projects.push(newProject);
        }

        this.saveProjects();
        this.renderProjects();
        this.closeProjectModal();
        
        const message = this.isEditing ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!';
        Utils.showToast(message, 'success');
        
        // Atualizar outras abas
        if (window.weeklyManager) window.weeklyManager.updateAvailableTasks();
        if (window.analyticsManager) window.analyticsManager.updateAnalytics();
        if (window.ganttManager) window.ganttManager.updateGantt();
    }

    /**
     * Renderiza a lista de projetos
     */
    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        
        if (this.projects.length === 0) {
            projectsGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nenhum projeto cadastrado</p>
                    <p>Clique em "Novo Projeto" para começar</p>
                </div>
            `;
            return;
        }

        projectsGrid.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');
    }

    /**
     * Cria o card de um projeto
     */
    createProjectCard(project) {
        const totalTasks = project.tasks ? project.tasks.length : 0;
        const completedTasks = project.tasks ? project.tasks.filter(task => 
            (task.status || Utils.calculateTaskStatus(task.startDate, task.endDate)) === 'completed'
        ).length : 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const projectStatus = project.status || this.getProjectStatus(project);
        const statusOptions = [
            { value: 'pending', label: 'Pendente' },
            { value: 'in-progress', label: 'Em Andamento' },
            { value: 'completed', label: 'Concluído' },
            { value: 'overdue', label: 'Atrasado' }
        ];
        
        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-header">
                    <div>
                        <h3 class="project-title">${Utils.sanitizeText(project.name)}</h3>
                        <div class="project-dates">
                            <i class="fas fa-calendar"></i>
                            ${Utils.formatDate(project.startDate)} - ${Utils.formatDate(project.endDate)}
                        </div>
                        <div style="margin-top: 0.5rem; display: flex; align-items: center; gap: .5rem;">
                            <span style="font-size: .875rem; color: var(--text-secondary);">Status do projeto:</span>
                            <select style="padding: .25rem .5rem; border: 1px solid var(--border-color); border-radius: 6px;" onchange="projectManager.updateProjectStatus('${project.id}', this.value)">
                                ${statusOptions.map(o => `<option value="${o.value}" ${projectStatus === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
                            </select>
                        </div>
                        <div style="margin-top: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">
                                    Progresso: ${progress}%
                                </span>
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">
                                    ${completedTasks}/${totalTasks} etapas
                                </span>
                            </div>
                            <div style="width: 100%; height: 4px; background: var(--border-color); border-radius: 2px; overflow: hidden;">
                                <div style="width: ${progress}%; height: 100%; background: var(--primary-color); transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-sm btn-secondary" onclick="projectManager.editProject('${project.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="projectManager.deleteProject('${project.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="tasks-list">
                    ${this.renderProjectTasks(project)}
                </div>
            </div>
        `;
    }

    /**
     * Renderiza as tarefas de um projeto
     */
    renderProjectTasks(project) {
        if (!project.tasks || project.tasks.length === 0) {
            return '<p style="color: var(--text-secondary); font-style: italic; text-align: center; padding: 1rem;">Nenhuma etapa cadastrada</p>';
        }

        return project.tasks.map(task => {
            const effectiveStatus = task.status || Utils.calculateTaskStatus(task.startDate, task.endDate);
            const statusOptions = [
                { value: 'pending', label: 'Pendente' },
                { value: 'in-progress', label: 'Em Andamento' },
                { value: 'completed', label: 'Concluída' },
                { value: 'overdue', label: 'Atrasada' }
            ];

            return `
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-name">${Utils.sanitizeText(task.name)}</div>
                        <div class="task-details">
                            <strong>Responsável:</strong> ${Utils.sanitizeText(task.responsible)} | 
                            <strong>Período:</strong> ${Utils.formatDate(task.startDate)} - ${Utils.formatDate(task.endDate)}
                        </div>
                    </div>
                    <div>
                        <select style="padding: .25rem .5rem; border: 1px solid var(--border-color); border-radius: 6px;" onchange="projectManager.updateTaskStatus('${project.id}', '${task.id}', this.value)">
                            ${statusOptions.map(o => `<option value="${o.value}" ${effectiveStatus === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Edita um projeto
     */
    editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.openProjectModal(project);
        }
    }

    /**
     * Exclui um projeto
     */
    async deleteProject(projectId) {
        const confirmed = await Utils.confirm(
            'Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.',
            'Excluir Projeto'
        );

        if (!confirmed) return;

        this.projects = this.projects.filter(p => p.id !== projectId);
        this.saveProjects();
        this.renderProjects();
        
        Utils.showToast('Projeto excluído com sucesso!', 'success');
        
        // Atualizar outras abas
        if (window.weeklyManager) window.weeklyManager.updateAvailableTasks();
        if (window.analyticsManager) window.analyticsManager.updateAnalytics();
        if (window.ganttManager) window.ganttManager.updateGantt();
    }

    /**
     * Obtém um projeto por ID
     */
    getProject(projectId) {
        return this.projects.find(p => p.id === projectId);
    }

    /**
     * Obtém todos os projetos
     */
    getAllProjects() {
        return this.projects;
    }

    /**
     * Obtém todas as tarefas de todos os projetos
     */
    getAllTasks() {
        return this.projects.flatMap(project => 
            (project.tasks || []).map(task => ({
                ...task,
                projectId: project.id,
                projectName: project.name
            }))
        );
    }

    /**
     * Atualiza um projeto
     */
    updateProject(projectId, updates) {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...updates };
            this.saveProjects();
            this.renderProjects();
            return true;
        }
        return false;
    }

    /**
     * Filtra projetos por critérios
     */
    filterProjects(criteria = {}) {
        return this.projects.filter(project => {
            if (criteria.name && !project.name.toLowerCase().includes(criteria.name.toLowerCase())) {
                return false;
            }
            if (criteria.responsible) {
                const hasResponsible = project.tasks && project.tasks.some(task => 
                    task.responsible.toLowerCase().includes(criteria.responsible.toLowerCase())
                );
                if (!hasResponsible) return false;
            }
            if (criteria.status) {
                const projectStatus = this.getProjectStatus(project);
                if (projectStatus !== criteria.status) return false;
            }
            return true;
        });
    }

    /**
     * Obtém o status geral de um projeto
     */
    getProjectStatus(project) {
        if (project.status) return project.status;
        if (!project.tasks || project.tasks.length === 0) return 'pending';
        
        const taskStatuses = project.tasks.map(task => 
            (task.status || Utils.calculateTaskStatus(task.startDate, task.endDate))
        );
        
        if (taskStatuses.every(status => status === 'completed')) return 'completed';
        if (taskStatuses.some(status => status === 'overdue')) return 'overdue';
        if (taskStatuses.some(status => status === 'in-progress')) return 'in-progress';
        return 'pending';
    }

    /**
     * Atualiza status manual de uma etapa
     */
    updateTaskStatus(projectId, taskId, status) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        if (!project.tasks) return;
        const taskIndex = project.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        project.tasks[taskIndex] = { ...project.tasks[taskIndex], status };
        project.updatedAt = new Date().toISOString();
        this.saveProjects();
        this.renderProjects();
        if (window.ganttManager) window.ganttManager.updateGantt();
        if (window.analyticsManager) window.analyticsManager.updateAnalytics();
    }

    /**
     * Atualiza status manual do projeto
     */
    updateProjectStatus(projectId, status) {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index === -1) return;
        this.projects[index] = { ...this.projects[index], status, updatedAt: new Date().toISOString() };
        this.saveProjects();
        this.renderProjects();
        if (window.ganttManager) window.ganttManager.updateGantt();
        if (window.analyticsManager) window.analyticsManager.updateAnalytics();
    }
}

// Instancia o gerenciador de projetos
const projectManager = new ProjectManager();
window.projectManager = projectManager;
