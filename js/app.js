/**
 * Aplicação Principal - Gerenciador de Projetos
 */

class App {
    constructor() {
        this.currentTab = 'projects';
        this.managers = {};
        
        this.init();
    }

    init() {
        this.initializeManagers();
        this.bindEvents();
        this.setupNavigation();
        this.loadInitialData();
        this.setupKeyboardShortcuts();
    }

    /**
     * Inicializa todos os gerenciadores
     */
    initializeManagers() {
        // Aguardar carregamento das bibliotecas
        this.waitForLibraries().then(() => {
            // Os gerenciadores já foram instanciados pelos arquivos individuais
            this.managers = {
                project: window.projectManager,
                gantt: window.simpleGanttManager,
                weekly: window.weeklyManager,
                analytics: window.analyticsManager,
                excel: window.excelManager
            };

            // Verificar se todos os gerenciadores foram carregados
            this.validateManagers();
        });
    }

    /**
     * Aguarda carregamento das bibliotecas externas
     */
    waitForLibraries() {
        return new Promise((resolve) => {
            const checkLibraries = () => {
                if (typeof XLSX !== 'undefined' && 
                    typeof Chart !== 'undefined' && 
                    typeof Utils !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkLibraries, 100);
                }
            };
            checkLibraries();
        });
    }

    /**
     * Valida se todos os gerenciadores foram carregados
     */
    validateManagers() {
        const requiredManagers = ['project', 'gantt', 'weekly', 'analytics', 'excel'];
        const missingManagers = requiredManagers.filter(name => !this.managers[name]);

        if (missingManagers.length > 0) {
            console.error('Gerenciadores não carregados:', missingManagers);
            Utils.showToast('Erro ao carregar alguns componentes da aplicação', 'error');
        }
    }

    /**
     * Vincula eventos globais
     */
    bindEvents() {
        // Navegação por abas
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Salvar dados antes de sair
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });

        // Redimensionamento da janela
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
    }

    /**
     * Configura navegação
     */
    setupNavigation() {
        // Mostrar primeira aba por padrão
        this.switchTab('projects');
    }

    /**
     * Carrega dados iniciais
     */
    loadInitialData() {
        // Dados são carregados automaticamente pelos gerenciadores
        // Apenas verificar se há dados de exemplo para mostrar
        setTimeout(() => {
            this.checkForSampleData();
        }, 1000);
    }

    /**
     * Verifica se há dados de exemplo para mostrar
     */
    checkForSampleData() {
        if (this.managers.project && this.managers.project.getAllProjects().length === 0) {
            this.showWelcomeMessage();
        }
    }

    /**
     * Mostra mensagem de boas-vindas
     */
    showWelcomeMessage() {
        const welcomeModal = document.createElement('div');
        welcomeModal.className = 'modal active';
        welcomeModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Bem-vindo ao Gerenciador de Projetos!</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <i class="fas fa-rocket" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                        <h3>Comece a gerenciar seus projetos!</h3>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div style="text-align: center; padding: 1rem; background: var(--background-color); border-radius: var(--border-radius);">
                            <i class="fas fa-plus" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                            <h4>Criar Projeto</h4>
                            <p style="font-size: 0.875rem; color: var(--text-secondary);">Adicione seu primeiro projeto e suas etapas</p>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--background-color); border-radius: var(--border-radius);">
                            <i class="fas fa-file-import" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                            <h4>Importar Excel</h4>
                            <p style="font-size: 0.875rem; color: var(--text-secondary);">Importe dados de planilhas existentes</p>
                        </div>
                    </div>
                    
                    <div style="background: var(--background-color); padding: 1rem; border-radius: var(--border-radius);">
                        <h4 style="margin-bottom: 0.5rem;">Funcionalidades principais:</h4>
                        <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                            <li>Cadastro e gerenciamento de projetos</li>
                            <li>Gráfico de Gantt interativo</li>
                            <li>Distribuição semanal com drag & drop</li>
                            <li>Relatórios analíticos</li>
                            <li>Importação e exportação Excel</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fechar</button>
                    <button class="btn btn-primary" onclick="app.createSampleData()">Criar Dados de Exemplo</button>
                </div>
            </div>
        `;

        document.body.appendChild(welcomeModal);

        // Fechar modal ao clicar fora
        welcomeModal.addEventListener('click', (e) => {
            if (e.target === welcomeModal) {
                welcomeModal.remove();
            }
        });
    }

    /**
     * Cria dados de exemplo
     */
    createSampleData() {
        const sampleProjects = [
            {
                id: Utils.generateId(),
                name: 'Desenvolvimento de Website',
                startDate: '2024-01-01',
                endDate: '2024-03-31',
                tasks: [
                    {
                        id: Utils.generateId(),
                        name: 'Planejamento e Design',
                        responsible: 'João Silva',
                        startDate: '2024-01-01',
                        endDate: '2024-01-15'
                    },
                    {
                        id: Utils.generateId(),
                        name: 'Desenvolvimento Frontend',
                        responsible: 'Maria Santos',
                        startDate: '2024-01-16',
                        endDate: '2024-02-15'
                    },
                    {
                        id: Utils.generateId(),
                        name: 'Desenvolvimento Backend',
                        responsible: 'Pedro Costa',
                        startDate: '2024-01-16',
                        endDate: '2024-02-28'
                    },
                    {
                        id: Utils.generateId(),
                        name: 'Testes e Deploy',
                        responsible: 'Ana Oliveira',
                        startDate: '2024-03-01',
                        endDate: '2024-03-31'
                    }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: Utils.generateId(),
                name: 'Campanha de Marketing',
                startDate: '2024-02-01',
                endDate: '2024-04-30',
                tasks: [
                    {
                        id: Utils.generateId(),
                        name: 'Definição de Estratégia',
                        responsible: 'Carlos Lima',
                        startDate: '2024-02-01',
                        endDate: '2024-02-14'
                    },
                    {
                        id: Utils.generateId(),
                        name: 'Criação de Conteúdo',
                        responsible: 'Fernanda Rocha',
                        startDate: '2024-02-15',
                        endDate: '2024-03-31'
                    },
                    {
                        id: Utils.generateId(),
                        name: 'Execução da Campanha',
                        responsible: 'Roberto Alves',
                        startDate: '2024-04-01',
                        endDate: '2024-04-30'
                    }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        if (this.managers.project) {
            this.managers.project.projects = sampleProjects;
            this.managers.project.saveProjects();
            this.managers.project.renderProjects();
        }

        // Atualizar outras abas
        if (this.managers.weekly) {
            this.managers.weekly.renderWeeklyView();
        }
        if (this.managers.analytics) {
            this.managers.analytics.updateAnalytics();
        }
        if (this.managers.gantt) {
            this.managers.gantt.updateGantt();
        }

        // Fechar modal de boas-vindas
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }

        Utils.showToast('Dados de exemplo criados com sucesso!', 'success');
    }

    /**
     * Alterna entre abas
     */
    switchTab(tabName) {
        // Remover classe active de todas as abas
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Adicionar classe active na aba selecionada
        const activeLink = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);

        if (activeLink && activeContent) {
            activeLink.classList.add('active');
            activeContent.classList.add('active');
            this.currentTab = tabName;

            // Atualizar conteúdo específico da aba
            this.updateTabContent(tabName);
        }
    }

    /**
     * Atualiza conteúdo específico da aba
     */
    updateTabContent(tabName) {
        switch (tabName) {
            case 'projects':
                if (this.managers.project) {
                    this.managers.project.renderProjects();
                }
                if (this.managers.gantt) {
                    this.managers.gantt.updateGantt();
                }
                break;
            case 'weekly':
                if (this.managers.weekly) {
                    this.managers.weekly.renderWeeklyView();
                }
                break;
            case 'analytics':
                if (this.managers.analytics) {
                    this.managers.analytics.updateAnalytics();
                }
                break;
        }
    }

    /**
     * Configura atalhos de teclado
     */
    setupKeyboardShortcuts() {
        // Atalhos serão tratados no handleKeyboardShortcuts
    }

    /**
     * Manipula atalhos de teclado
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: Novo projeto
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (this.managers.project) {
                this.managers.project.openProjectModal();
            }
        }

        // Ctrl/Cmd + E: Exportar Excel
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            if (this.managers.excel) {
                this.managers.excel.exportToExcel();
            }
        }

        // Ctrl/Cmd + I: Importar Excel
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            if (this.managers.excel) {
                this.managers.excel.triggerImport();
            }
        }

        // Números 1-3: Alternar abas
        if (e.key >= '1' && e.key <= '3') {
            e.preventDefault();
            const tabs = ['projects', 'weekly', 'analytics'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) {
                this.switchTab(tabs[tabIndex]);
            }
        }

        // Escape: Fechar modais
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => {
                modal.remove();
            });
        }
    }

    /**
     * Manipula redimensionamento da janela
     */
    handleResize() {
        // Redimensionar gráficos
        if (this.managers.analytics) {
            this.managers.analytics.resizeCharts();
        }
        if (this.managers.gantt) {
            this.managers.gantt.resize();
        }
    }

    /**
     * Salva todos os dados
     */
    saveAllData() {
        if (this.managers.project) {
            this.managers.project.saveProjects();
        }
        if (this.managers.weekly) {
            this.managers.weekly.saveWeeklyData();
        }
    }

    /**
     * Obtém informações do sistema
     */
    getSystemInfo() {
        return {
            version: '1.0.0',
            currentTab: this.currentTab,
            managers: Object.keys(this.managers),
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Limpa todos os dados
     */
    async clearAllData() {
        const confirmed = await Utils.confirm(
            'Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.',
            'Limpar Todos os Dados'
        );

        if (!confirmed) return;

        // Limpar dados de projetos
        if (this.managers.project) {
            this.managers.project.projects = [];
            this.managers.project.saveProjects();
            this.managers.project.renderProjects();
        }

        // Limpar dados semanais
        if (this.managers.weekly) {
            this.managers.weekly.weeklyData = {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: []
            };
            this.managers.weekly.saveWeeklyData();
            this.managers.weekly.renderWeeklyView();
        }

        // Atualizar outras abas
        if (this.managers.analytics) {
            this.managers.analytics.updateAnalytics();
        }
        if (this.managers.gantt) {
            this.managers.gantt.updateGantt();
        }

        Utils.showToast('Todos os dados foram limpos!', 'success');
    }

    /**
     * Exporta backup completo
     */
    exportBackup() {
        const backup = {
            projects: this.managers.project ? this.managers.project.getAllProjects() : [],
            weeklyData: this.managers.weekly ? this.managers.weekly.weeklyData : {},
            analytics: this.managers.analytics ? this.managers.analytics.exportAnalyticsData() : {},
            systemInfo: this.getSystemInfo(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_gerenciador_projetos_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Utils.showToast('Backup exportado com sucesso!', 'success');
    }

    /**
     * Importa backup
     */
    importBackup(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                
                // Restaurar projetos
                if (backup.projects && this.managers.project) {
                    this.managers.project.projects = backup.projects;
                    this.managers.project.saveProjects();
                    this.managers.project.renderProjects();
                }

                // Restaurar dados semanais
                if (backup.weeklyData && this.managers.weekly) {
                    this.managers.weekly.weeklyData = backup.weeklyData;
                    this.managers.weekly.saveWeeklyData();
                    this.managers.weekly.renderWeeklyView();
                }

                // Atualizar outras abas
                if (this.managers.analytics) {
                    this.managers.analytics.updateAnalytics();
                }
                if (this.managers.gantt) {
                    this.managers.gantt.updateGantt();
                }

                Utils.showToast('Backup importado com sucesso!', 'success');

            } catch (error) {
                console.error('Erro ao importar backup:', error);
                Utils.showToast('Erro ao importar backup. Verifique se o arquivo está correto.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Expor funções globais para uso no console
window.App = App;
