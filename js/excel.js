/**
 * Gerenciamento de Importação/Exportação Excel
 */

class ExcelManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Botão importar
        document.getElementById('importBtn').addEventListener('click', () => {
            this.triggerImport();
        });

        // Botão exportar
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToExcel();
        });

        // Input de arquivo
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
    }

    /**
     * Dispara a seleção de arquivo
     */
    triggerImport() {
        document.getElementById('fileInput').click();
    }

    /**
     * Manipula seleção de arquivo
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        if (!validTypes.includes(file.type)) {
            Utils.showToast('Por favor, selecione um arquivo Excel válido (.xlsx, .xls) ou CSV', 'error');
            return;
        }

        this.importFromFile(file);
    }

    /**
     * Importa dados de um arquivo
     */
    importFromFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                this.processImportedData(workbook);
                
                Utils.showToast('Dados importados com sucesso!', 'success');
                
                // Limpar input
                event.target.value = '';
                
            } catch (error) {
                console.error('Erro ao importar arquivo:', error);
                Utils.showToast('Erro ao processar arquivo. Verifique se o formato está correto.', 'error');
            }
        };

        reader.onerror = () => {
            Utils.showToast('Erro ao ler arquivo.', 'error');
        };

        reader.readAsArrayBuffer(file);
    }

    /**
     * Processa dados importados
     */
    processImportedData(workbook) {
        const sheetNames = workbook.SheetNames;
        
        // Procurar por planilhas específicas
        let projectsSheet = null;
        let tasksSheet = null;
        let weeklySheet = null;

        sheetNames.forEach(sheetName => {
            const lowerName = sheetName.toLowerCase();
            if (lowerName.includes('projeto') || lowerName.includes('project')) {
                projectsSheet = workbook.Sheets[sheetName];
            } else if (lowerName.includes('etapa') || lowerName.includes('task')) {
                tasksSheet = workbook.Sheets[sheetName];
            } else if (lowerName.includes('semana') || lowerName.includes('week')) {
                weeklySheet = workbook.Sheets[sheetName];
            }
        });

        // Se não encontrou planilhas específicas, usar a primeira
        if (!projectsSheet && sheetNames.length > 0) {
            projectsSheet = workbook.Sheets[sheetNames[0]];
        }

        // Processar dados de projetos
        if (projectsSheet) {
            this.importProjects(projectsSheet);
        }

        // Processar dados semanais
        if (weeklySheet) {
            this.importWeeklyData(weeklySheet);
        }

        // Atualizar interface
        if (window.projectManager) {
            window.projectManager.renderProjects();
        }
        if (window.weeklyManager) {
            window.weeklyManager.renderWeeklyView();
        }
        if (window.analyticsManager) {
            window.analyticsManager.updateAnalytics();
        }
        if (window.ganttManager) {
            window.ganttManager.updateGantt();
        }
    }

    /**
     * Importa projetos de uma planilha
     */
    importProjects(sheet) {
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length < 2) {
            Utils.showToast('Planilha de projetos vazia ou sem dados válidos.', 'warning');
            return;
        }

        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);

        // Mapear colunas
        const columnMap = this.mapColumns(headers);

        const projects = [];
        const projectMap = new Map(); // Para agrupar tarefas por projeto

        dataRows.forEach((row, index) => {
            if (row.length === 0 || !row[0]) return; // Linha vazia

            const projectName = row[columnMap.projectName] || `Projeto ${index + 1}`;
            const taskName = row[columnMap.taskName] || `Etapa ${index + 1}`;
            const responsible = row[columnMap.responsible] || 'Não definido';
            const startDate = this.parseDate(row[columnMap.startDate]);
            const endDate = this.parseDate(row[columnMap.endDate]);

            if (!startDate || !endDate) {
                console.warn(`Linha ${index + 2}: Datas inválidas`);
                return;
            }

            // Criar ou obter projeto
            if (!projectMap.has(projectName)) {
                const project = {
                    id: Utils.generateId(),
                    name: projectName,
                    startDate: startDate,
                    endDate: endDate,
                    tasks: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                projectMap.set(projectName, project);
                projects.push(project);
            }

            const project = projectMap.get(projectName);

            // Adicionar tarefa
            const task = {
                id: Utils.generateId(),
                name: taskName,
                responsible: responsible,
                startDate: startDate,
                endDate: endDate
            };

            project.tasks.push(task);

            // Atualizar datas do projeto se necessário
            const taskStart = new Date(startDate);
            const taskEnd = new Date(endDate);
            const projectStart = new Date(project.startDate);
            const projectEnd = new Date(project.endDate);

            if (taskStart < projectStart) {
                project.startDate = startDate;
            }
            if (taskEnd > projectEnd) {
                project.endDate = endDate;
            }
        });

        // Salvar projetos
        if (window.projectManager && projects.length > 0) {
            window.projectManager.projects = projects;
            window.projectManager.saveProjects();
        }
    }

    /**
     * Importa dados semanais
     */
    importWeeklyData(sheet) {
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length < 2) return;

        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);

        const weeklyData = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        };

        const dayMap = {
            'segunda': 'monday',
            'terça': 'tuesday',
            'quarta': 'wednesday',
            'quinta': 'thursday',
            'sexta': 'friday',
            'sábado': 'saturday',
            'domingo': 'sunday'
        };

        dataRows.forEach(row => {
            if (row.length < 3) return;

            const day = row[0]?.toString().toLowerCase();
            const taskName = row[1];
            const projectName = row[2];

            if (!day || !taskName || !projectName) return;

            const dayKey = dayMap[day];
            if (!dayKey) return;

            // Encontrar tarefa correspondente
            if (window.projectManager) {
                const allTasks = window.projectManager.getAllTasks();
                const task = allTasks.find(t => 
                    t.name.toLowerCase().includes(taskName.toLowerCase()) &&
                    t.projectName.toLowerCase().includes(projectName.toLowerCase())
                );

                if (task) {
                    weeklyData[dayKey].push(task);
                }
            }
        });

        // Salvar dados semanais
        if (window.weeklyManager) {
            window.weeklyManager.weeklyData = weeklyData;
            window.weeklyManager.saveWeeklyData();
        }
    }

    /**
     * Mapeia colunas da planilha
     */
    mapColumns(headers) {
        const map = {
            projectName: 0,
            taskName: 1,
            responsible: 2,
            startDate: 3,
            endDate: 4
        };

        headers.forEach((header, index) => {
            if (!header) return;
            
            const lowerHeader = header.toString().toLowerCase();
            
            if (lowerHeader.includes('projeto') || lowerHeader.includes('project')) {
                map.projectName = index;
            } else if (lowerHeader.includes('etapa') || lowerHeader.includes('task') || lowerHeader.includes('tarefa')) {
                map.taskName = index;
            } else if (lowerHeader.includes('responsável') || lowerHeader.includes('responsible')) {
                map.responsible = index;
            } else if (lowerHeader.includes('início') || lowerHeader.includes('start') || lowerHeader.includes('data início')) {
                map.startDate = index;
            } else if (lowerHeader.includes('fim') || lowerHeader.includes('end') || lowerHeader.includes('data fim')) {
                map.endDate = index;
            }
        });

        return map;
    }

    /**
     * Converte string de data para formato ISO
     */
    parseDate(dateValue) {
        if (!dateValue) return null;

        let date;
        
        if (typeof dateValue === 'number') {
            // Número do Excel (dias desde 1900-01-01)
            date = new Date((dateValue - 25569) * 86400 * 1000);
        } else if (typeof dateValue === 'string') {
            // String de data
            date = new Date(dateValue);
        } else if (dateValue instanceof Date) {
            date = dateValue;
        } else {
            return null;
        }

        if (isNaN(date.getTime())) {
            return null;
        }

        return date.toISOString().split('T')[0];
    }

    /**
     * Exporta dados para Excel
     */
    exportToExcel() {
        try {
            const workbook = XLSX.utils.book_new();

            // Exportar projetos
            this.exportProjectsSheet(workbook);
            
            // Exportar dados semanais
            this.exportWeeklySheet(workbook);
            
            // Exportar relatório analítico
            this.exportAnalyticsSheet(workbook);

            // Gerar arquivo
            const fileName = `gerenciador_projetos_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            Utils.showToast('Dados exportados com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao exportar:', error);
            Utils.showToast('Erro ao exportar dados.', 'error');
        }
    }

    /**
     * Exporta planilha de projetos
     */
    exportProjectsSheet(workbook) {
        if (!window.projectManager) return;

        const projects = window.projectManager.getAllProjects();
        const data = [];

        // Cabeçalho
        data.push([
            'Projeto',
            'Etapa',
            'Responsável',
            'Data Início',
            'Data Fim',
            'Status',
            'Duração (dias)'
        ]);

        // Dados
        projects.forEach(project => {
            if (project.tasks && project.tasks.length > 0) {
                project.tasks.forEach(task => {
                    const status = Utils.calculateTaskStatus(task.startDate, task.endDate);
                    const statusText = {
                        'completed': 'Concluída',
                        'in-progress': 'Em Andamento',
                        'overdue': 'Atrasada',
                        'pending': 'Pendente'
                    }[status];

                    const duration = Utils.daysBetween(task.startDate, task.endDate);

                    data.push([
                        project.name,
                        task.name,
                        task.responsible,
                        task.startDate,
                        task.endDate,
                        statusText,
                        duration
                    ]);
                });
            } else {
                // Projeto sem tarefas
                data.push([
                    project.name,
                    '',
                    '',
                    project.startDate,
                    project.endDate,
                    'Sem etapas',
                    0
                ]);
            }
        });

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Projetos');
    }

    /**
     * Exporta planilha semanal
     */
    exportWeeklySheet(workbook) {
        if (!window.weeklyManager) return;

        const weeklyData = window.weeklyManager.weeklyData;
        const data = [];

        // Cabeçalho
        data.push(['Dia da Semana', 'Etapa', 'Projeto', 'Responsável', 'Período']);

        // Dados
        const dayNames = {
            'monday': 'Segunda-feira',
            'tuesday': 'Terça-feira',
            'wednesday': 'Quarta-feira',
            'thursday': 'Quinta-feira',
            'friday': 'Sexta-feira',
            'saturday': 'Sábado',
            'sunday': 'Domingo'
        };

        Object.entries(weeklyData).forEach(([day, tasks]) => {
            if (tasks.length > 0) {
                tasks.forEach(task => {
                    data.push([
                        dayNames[day],
                        task.name,
                        task.projectName,
                        task.responsible,
                        `${Utils.formatDate(task.startDate)} - ${Utils.formatDate(task.endDate)}`
                    ]);
                });
            } else {
                data.push([dayNames[day], '', '', '', '']);
            }
        });

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Distribuição Semanal');
    }

    /**
     * Exporta planilha analítica
     */
    exportAnalyticsSheet(workbook) {
        if (!window.analyticsManager) return;

        const stats = window.analyticsManager.stats;
        const data = [];

        // Resumo
        data.push(['RELATÓRIO ANALÍTICO']);
        data.push(['']);
        data.push(['Resumo Geral']);
        data.push(['Total de Projetos', stats.totalProjects]);
        data.push(['Total de Etapas', stats.totalTasks]);
        data.push(['Etapas Concluídas', stats.completedTasks]);
        data.push(['Etapas em Andamento', stats.inProgressTasks]);
        data.push(['Etapas Atrasadas', stats.overdueTasks]);
        data.push(['Etapas Pendentes', stats.pendingTasks]);
        data.push(['']);

        // Status das etapas
        data.push(['Status das Etapas']);
        Object.entries(stats.tasksByStatus).forEach(([status, count]) => {
            const statusText = {
                'completed': 'Concluídas',
                'in-progress': 'Em Andamento',
                'overdue': 'Atrasadas',
                'pending': 'Pendentes'
            }[status] || status;
            data.push([statusText, count]);
        });
        data.push(['']);

        // Top responsáveis
        data.push(['Top Responsáveis']);
        Object.entries(stats.tasksByResponsible)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([responsible, count]) => {
                data.push([responsible, count]);
            });
        data.push(['']);

        // Top projetos
        data.push(['Top Projetos']);
        Object.entries(stats.tasksByProject)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([project, count]) => {
                data.push([project, count]);
            });

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Analítico');
    }

    /**
     * Gera template de importação
     */
    generateImportTemplate() {
        const workbook = XLSX.utils.book_new();

        // Template de projetos
        const projectTemplate = [
            ['Projeto', 'Etapa', 'Responsável', 'Data Início', 'Data Fim'],
            ['Projeto A', 'Etapa 1', 'João Silva', '2024-01-01', '2024-01-15'],
            ['Projeto A', 'Etapa 2', 'Maria Santos', '2024-01-16', '2024-01-31'],
            ['Projeto B', 'Etapa 1', 'Pedro Costa', '2024-02-01', '2024-02-28']
        ];

        const projectSheet = XLSX.utils.aoa_to_sheet(projectTemplate);
        XLSX.utils.book_append_sheet(workbook, projectSheet, 'Template Projetos');

        // Template semanal
        const weeklyTemplate = [
            ['Dia da Semana', 'Etapa', 'Projeto'],
            ['Segunda-feira', 'Etapa 1', 'Projeto A'],
            ['Terça-feira', 'Etapa 2', 'Projeto A'],
            ['Quarta-feira', 'Etapa 1', 'Projeto B']
        ];

        const weeklySheet = XLSX.utils.aoa_to_sheet(weeklyTemplate);
        XLSX.utils.book_append_sheet(workbook, weeklySheet, 'Template Semanal');

        // Gerar arquivo
        XLSX.writeFile(workbook, 'template_importacao.xlsx');
        
        Utils.showToast('Template de importação gerado!', 'success');
    }

    /**
     * Valida dados antes da importação
     */
    validateImportData(data) {
        const errors = [];

        if (!data || data.length === 0) {
            errors.push('Nenhum dado encontrado no arquivo');
            return errors;
        }

        data.forEach((row, index) => {
            if (!row.projectName) {
                errors.push(`Linha ${index + 2}: Nome do projeto é obrigatório`);
            }
            if (!row.taskName) {
                errors.push(`Linha ${index + 2}: Nome da etapa é obrigatório`);
            }
            if (!row.startDate || !row.endDate) {
                errors.push(`Linha ${index + 2}: Datas de início e fim são obrigatórias`);
            }
            if (row.startDate && row.endDate && new Date(row.startDate) > new Date(row.endDate)) {
                errors.push(`Linha ${index + 2}: Data de início deve ser anterior à data de fim`);
            }
        });

        return errors;
    }
}

// Instancia o gerenciador Excel
const excelManager = new ExcelManager();
window.excelManager = excelManager;
