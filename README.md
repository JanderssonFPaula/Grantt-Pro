# Gerenciador de Projetos

Um sistema web moderno e completo para gerenciamento de projetos, desenvolvido com HTML, CSS e JavaScript puro. O sistema oferece funcionalidades avançadas de planejamento, visualização e análise de projetos.

## 🚀 Funcionalidades

### 📋 Gerenciamento de Projetos
- **Cadastro completo**: Crie projetos com nome, datas de início e término
- **Etapas detalhadas**: Adicione múltiplas etapas com responsáveis e prazos
- **Edição e exclusão**: Modifique ou remova projetos e etapas facilmente
- **Validação inteligente**: Sistema de validação para datas e dados obrigatórios

### 📊 Gráfico de Gantt
- **Visualização interativa**: Gráfico de Gantt dinâmico e responsivo
- **Filtros avançados**: Filtre por projeto e responsável
- **Detalhes das tarefas**: Clique nas barras para ver informações detalhadas
- **Atualização em tempo real**: Modificações refletem instantaneamente no gráfico

### 📅 Distribuição Semanal
- **Drag & Drop intuitivo**: Arraste etapas para alocar nos dias da semana
- **Visualização clara**: Layout em tabela com colunas por dia
- **Gestão de alocações**: Adicione ou remova etapas dos dias facilmente
- **Sincronização automática**: Alterações refletem no cadastro de etapas

### 📈 Relatórios Analíticos
- **Dashboard completo**: Visão geral com estatísticas em tempo real
- **Gráficos interativos**: Gráficos de pizza e barras com Chart.js
- **Métricas detalhadas**: 
  - Total de projetos e etapas
  - Etapas concluídas, em andamento e atrasadas
  - Distribuição por responsável
- **Recomendações inteligentes**: Sugestões baseadas nos dados

### 📁 Importação/Exportação Excel
- **Importação flexível**: Suporte para arquivos .xlsx, .xls e CSV
- **Exportação completa**: Gera planilhas com todos os dados
- **Múltiplas planilhas**: Projetos, distribuição semanal e relatórios
- **Mapeamento inteligente**: Detecta automaticamente colunas relevantes

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e moderna
- **CSS3**: Estilos responsivos com Grid e Flexbox
- **JavaScript ES6+**: Código modular e orientado a objetos

### Bibliotecas
- **SheetJS (xlsx)**: Manipulação de arquivos Excel
- **Frappe Gantt**: Gráfico de Gantt interativo
- **Chart.js**: Gráficos e visualizações
- **Font Awesome**: Ícones modernos
- **Google Fonts (Inter)**: Tipografia legível

## 📁 Estrutura do Projeto

```
Gerenciador de Projetos/
├── index.html              # Página principal
├── css/                    # Estilos CSS
│   ├── style.css          # Estilos principais
│   ├── modal.css          # Estilos dos modais
│   ├── gantt.css          # Estilos do gráfico Gantt
│   ├── weekly.css         # Estilos da distribuição semanal
│   └── analytics.css      # Estilos dos relatórios
├── js/                     # Scripts JavaScript
│   ├── utils.js           # Utilitários e funções auxiliares
│   ├── projects.js        # Gerenciamento de projetos
│   ├── gantt.js           # Gráfico de Gantt
│   ├── weekly.js          # Distribuição semanal
│   ├── analytics.js       # Relatórios analíticos
│   ├── excel.js           # Importação/exportação Excel
│   └── app.js             # Aplicação principal
├── lib/                    # Bibliotecas externas
│   ├── xlsx.full.min.js   # SheetJS para Excel
│   ├── frappe-gantt.min.js # Gráfico Gantt
│   └── chart.min.js       # Gráficos Chart.js
└── README.md              # Documentação
```

## 🚀 Como Usar

### 1. Instalação
1. Clone ou baixe o projeto
2. Abra o arquivo `index.html` em um navegador moderno
3. Não é necessário servidor - funciona completamente no frontend

### 2. Primeiro Uso
- O sistema mostrará uma tela de boas-vindas
- Você pode criar dados de exemplo ou começar do zero
- Use o botão "Novo Projeto" para criar seu primeiro projeto

### 3. Funcionalidades Principais

#### Criando um Projeto
1. Clique em "Novo Projeto"
2. Preencha o nome e datas do projeto
3. Adicione etapas com responsáveis e prazos
4. Clique em "Salvar Projeto"

#### Visualizando o Gantt
1. Vá para a aba "Projetos"
2. O gráfico de Gantt será exibido automaticamente
3. Use os filtros para focar em projetos específicos
4. Clique nas barras para ver detalhes das etapas

#### Distribuição Semanal
1. Vá para a aba "Distribuição Semanal"
2. Arraste etapas da lista para os dias da semana
3. Clique no "X" para remover etapas dos dias
4. As alterações são salvas automaticamente

#### Relatórios
1. Vá para a aba "Analítico"
2. Visualize estatísticas em tempo real
3. Interaja com os gráficos para mais detalhes
4. Use os dados para tomar decisões informadas

### 4. Importação/Exportação

#### Importando Excel
1. Clique em "Importar Excel"
2. Selecione um arquivo .xlsx, .xls ou CSV
3. O sistema detectará automaticamente as colunas
4. Os dados serão importados e organizados

#### Exportando Excel
1. Clique em "Exportar Excel"
2. O sistema gerará um arquivo com múltiplas planilhas:
   - Projetos: Lista completa de projetos e etapas
   - Distribuição Semanal: Alocações por dia
   - Relatório Analítico: Estatísticas e métricas

## ⌨️ Atalhos de Teclado

- **Ctrl/Cmd + N**: Novo projeto
- **Ctrl/Cmd + E**: Exportar Excel
- **Ctrl/Cmd + I**: Importar Excel
- **1, 2, 3**: Alternar entre abas (Projetos, Semanal, Analítico)
- **Escape**: Fechar modais

## 💾 Armazenamento

- **localStorage**: Todos os dados são salvos localmente no navegador
- **Backup automático**: Dados são salvos automaticamente
- **Exportação**: Possibilidade de exportar backup completo em JSON

## 🎨 Design e UX

### Características do Design
- **Interface moderna**: Design clean e profissional
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Acessibilidade**: Cores contrastantes e navegação por teclado
- **Feedback visual**: Notificações toast e animações suaves

### Paleta de Cores
- **Primária**: Azul (#2563eb)
- **Sucesso**: Verde (#10b981)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)
- **Neutro**: Cinza (#64748b)

## 🔧 Personalização

### Modificando Cores
Edite as variáveis CSS no arquivo `css/style.css`:

```css
:root {
    --primary-color: #2563eb;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    /* ... outras variáveis */
}
```

### Adicionando Funcionalidades
O código está organizado em classes modulares:
- `ProjectManager`: Gerencia projetos e etapas
- `GanttManager`: Controla o gráfico de Gantt
- `WeeklyManager`: Gerencia distribuição semanal
- `AnalyticsManager`: Processa relatórios
- `ExcelManager`: Importação/exportação

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Gráfico não carrega**
   - Verifique se o arquivo `frappe-gantt.min.js` está presente
   - Recarregue a página

2. **Importação Excel falha**
   - Verifique o formato do arquivo (.xlsx, .xls, CSV)
   - Certifique-se de que as colunas estão mapeadas corretamente

3. **Dados não salvam**
   - Verifique se o localStorage está habilitado
   - Tente exportar backup antes de limpar dados

### Suporte
- Verifique o console do navegador para erros
- Os dados são salvos automaticamente no localStorage
- Use a função de backup para preservar dados importantes

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Autenticação de usuários
- [ ] Compartilhamento de projetos
- [ ] Notificações de prazos
- [ ] Integração com calendário
- [ ] Temas personalizáveis
- [ ] API REST para backend
- [ ] Sincronização em nuvem

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

Copyright (c) 2025 Jandersson F de Paula - @ConsultyD

É concedida permissão, gratuitamente, a qualquer pessoa que obtenha uma cópia
deste software e dos arquivos de documentação associados (o "Software"), para
lidar no Software sem restrições, incluindo, sem limitação, os direitos de usar,
copiar, modificar, mesclar, publicar, distribuir, sublicenciar e/ou vender cópias
do Software, e permitir que pessoas a quem o Software é fornecido o façam,
sujeito às seguintes condições:

O aviso de copyright acima e este aviso de permissão devem ser incluídos em todas
as cópias ou partes substanciais do Software.

O SOFTWARE É FORNECIDO "NO ESTADO EM QUE SE ENCONTRA", SEM GARANTIA DE QUALQUER
TIPO, EXPRESSA OU IMPLÍCITA, INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS DE
COMERCIALIZAÇÃO, ADEQUAÇÃO A UM DETERMINADO FIM E NÃO VIOLAÇÃO. EM NENHUMA
HIPÓTESE OS AUTORES OU DETENTORES DOS DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR
QUALQUER RECLAMAÇÃO, DANOS OU OUTRAS RESPONSABILIDADES, SEJA EM AÇÃO DE CONTRATO,
ATO ILÍCITO OU OUTRO, DECORRENTE DE, OU EM CONEXÃO COM O SOFTWARE OU O USO OU
OUTRAS NEGOCIAÇÕES NO SOFTWARE.

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request


## 📝 Autor

Este código foi desenvolvido por:  
- 👤 **Jandersson F. de Paula**  
- 🔗 **GitHub:** [Clique Aqui](https://github.com/JanderssonFPaula)

---

## 💼 ConsultyD  

Para dúvidas, sugestões ou problemas:  
- Abra uma *issue* no repositório  
- Entre em contato através do email ou redes sociais  

- 📧 **Email:** contato@consultyd.com.br  
- 📸 **Instagram:** [Clique Aqui](https://www.instagram.com/consultyd/)  

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de projetos**
