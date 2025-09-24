# Gerenciador de Projetos — HTML/CSS/JS + Excel

App simples e **100% front‑end** para gerenciar projetos com:
- **Tema claro/escuro**;
- **Projetos + Etapas** com status e datas;
- **Gráfico de Gantt** responsivo;
- **Planejamento semanal** no estilo **Matriz de Eisenhower** com _drag & drop_;
- **Analytics** (KPIs + gráficos);
- **Importar/Exportar Excel**;
- Persistência em **LocalStorage** (sem backend).

> **Copyright © 2025 ConsultyD. Todos os direitos reservados.**

---

## ✅ Principais recursos

- **Projetos**
  - Cadastro/edição via **modal** (responsivo).
  - Etapas dinâmicas (adicionar/remover).
  - **Datas de sistema** registradas automaticamente:
    - Quando muda para **“Em andamento”** → `dataregistro_inicio_sistema`.
    - Quando muda para **“Concluído”** → `dataregistro_fim_sistema`.

- **Gantt**
  - Escala automática entre a **menor data de início** e a **maior data de fim**.
  - Largura da coluna por dia é **responsiva**.
  - Nome da etapa fica **dentro da barra** (reticências quando necessário).

- **Planejamento (Eisenhower)**
  - Backlog de **Etapas Pendentes**.
  - 4 faixas: **Q1** (Urgente & Importante), **Q2**, **Q3**, **Q4**.
  - 7 colunas (Domingo → Sábado) por semana.
  - **Arraste e solte** etapas para agendar.
  - Botão **↩ Pendentes** para remover do planejamento.
  - Navegação **Semana anterior/próxima**.

- **Analytics**
  - KPIs: **Tarefas Totais**, **Concluídas**, **Taxa de Conclusão**.
  - Gráficos:
    - **Distribuição por Prioridade** (Q1–Q4) da semana atual.
    - **Distribuição Semanal** por dia da semana.

- **Excel**
  - **Importa** planilha existente e **exporta** para `projetos.xlsx`.
  - Usa **[SheetJS](https://sheetjs.com/)** no navegador.

---

## 🚀 Como usar

1. Abra o arquivo `index.html` no navegador (Chrome/Edge/Firefox).
2. Use o topo roxo para:
   - Alternar tema;
   - **Importar Excel** (`.xlsx/.xls`);
   - **Exportar Excel**;
   - Criar **+ Novo Projeto**.

### Projetos
- Clique no **nome do projeto** para abrir o modal de edição.
- Para **excluir**, use **🗑️ Excluir projeto** dentro do modal.
- Em etapas, edite **nome, responsável, descrição, datas previstas** e **status**.

### Gantt
- Mostra as barras apenas para etapas com **data início e fim previstas**.
- _Hover_ na barra mostra as datas; **clique** abre o projeto.

### Planejamento
- Arraste do **Backlog** para um quadrante/dia.
- Para remover do planejamento: **↩ Pendentes** ou arraste de volta ao Backlog.
- Botões **◀︎/▶︎** trocam a semana exibida.

### Analytics
- Abra a aba **Analítica** para ver os KPIs e gráficos da **semana atual**.
- Os gráficos são **responsivos** (altura fixa, largura auto).

---

## 📄 Formato do Excel

A planilha deve ter (case-insensitive) as colunas abaixo:

```
id_projeto, nome_projeto, data_inicio, data_prevista_termino,
nome_etapa, responsavel_etapa, descricao_etapa,
data_inicio_previsto, data_termino_previsto, status,
dataregistro_inicio_sistema, dataregistro_fim_sistema
```

### Observações
- Datas no formato **YYYY-MM-DD** são as mais seguras.
- Se um projeto vier **sem etapas**, o export gera 1 linha só com dados do projeto.
- Os status aceitos por padrão: `Aguardando análise`, `Em andamento`, `Concluído`.

---

## 🧱 Tecnologias

- **HTML + CSS + JavaScript puro** (sem build).
- **SheetJS** para Excel.
- **Chart.js** para gráficos.
- **dayjs** (+ `isoWeek`) para datas.
- **LocalStorage** para persistência (`projmgr.v1`).

> Seus dados ficam **apenas no seu navegador**. Para limpar, remova a chave `projmgr.v1` no DevTools → Application → Local Storage.

---

## 🛠️ Personalização

- **Cores/brand**: edite as CSS vars no `<style>`:
  - `--brand` (roxo do cabeçalho), `--accent`, `--q1`…`--q4`.
- **Link do GitHub**: botão “🐙 GitHub” no topo → troque o `href`.
- **Campos/Status**: ajuste o array `STATUSES` e os rótulos no modal.

---

## ❗Solução de problemas

- **Exportar Excel não funciona**  
  - Verifique conexão com a internet (o CDN da SheetJS precisa carregar).  
  - Se o navegador bloquear o CDN, use um servidor local simples (`python -m http.server`) ou peça a versão “offline” com a biblioteca embutida.

- **Botões não respondem**  
  - Dê um **refresh** na página (o JS carrega e reanexa eventos ao abrir o modal).
  - Abra o console (F12) e veja se há erros; reporte a mensagem.

- **Gantt não aparece**  
  - Certifique-se de que as etapas têm **data início e fim**.

---

## 🗺️ Roadmap (sugestões)

- Filtros/busca por projeto/responsável/status.
- Zoom no Gantt (dia/semana/mês).
- Exportar PDF das visões.
- Multiusuário com backend (Supabase/Firestore).
- Notificações e lembretes.

---

## 📜 Licença

Use livremente para seus projetos. Se quiser, posso incluir uma licença **MIT**.

---

Feito com 💜 por **ConsultyD**.
