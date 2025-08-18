/**
 * Utilitários para o Gerenciador de Projetos
 */

class Utils {
    /**
     * Gera um ID único
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Formata uma data para exibição
     */
    static formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR');
    }

    /**
     * Formata uma data para input type="date"
     */
    static formatDateForInput(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    /**
     * Converte string de data para objeto Date
     */
    static parseDate(dateString) {
        if (!dateString) return null;
        return new Date(dateString);
    }

    /**
     * Calcula a diferença em dias entre duas datas
     */
    static daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const first = new Date(date1);
        const second = new Date(date2);
        return Math.round(Math.abs((first - second) / oneDay));
    }

    /**
     * Verifica se uma data está no passado
     */
    static isPastDate(date) {
        return new Date(date) < new Date();
    }

    /**
     * Verifica se uma data está no futuro
     */
    static isFutureDate(date) {
        return new Date(date) > new Date();
    }

    /**
     * Calcula o status de uma tarefa baseado nas datas
     */
    static calculateTaskStatus(startDate, endDate, progress = 0) {
        const today = new Date();
        const end = new Date(endDate);
        
        if (progress >= 100) return 'completed';
        if (end < today) return 'overdue';
        if (new Date(startDate) <= today && end >= today) return 'in-progress';
        return 'pending';
    }

    /**
     * Calcula o progresso de uma tarefa baseado na data atual
     */
    static calculateProgress(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        
        if (today < start) return 0;
        if (today > end) return 100;
        
        const total = end - start;
        const elapsed = today - start;
        return Math.round((elapsed / total) * 100);
    }

    /**
     * Valida se uma data está no formato correto
     */
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Valida se o período de datas é válido
     */
    static isValidDateRange(startDate, endDate) {
        if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
            return false;
        }
        return new Date(startDate) <= new Date(endDate);
    }

    /**
     * Obtém o nome do dia da semana
     */
    static getDayName(date) {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[date.getDay()];
    }

    /**
     * Obtém o nome do mês
     */
    static getMonthName(date) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[date.getMonth()];
    }

    /**
     * Formata data e hora para exibição
     */
    static formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('pt-BR');
    }

    /**
     * Cria um elemento HTML com classes e conteúdo
     */
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    /**
     * Adiciona ou remove classes de um elemento
     */
    static toggleClass(element, className, force = null) {
        if (force === null) {
            element.classList.toggle(className);
        } else {
            element.classList.toggle(className, force);
        }
    }

    /**
     * Mostra ou esconde um elemento
     */
    static toggleElement(element, show = null) {
        if (show === null) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        } else {
            element.style.display = show ? '' : 'none';
        }
    }

    /**
     * Debounce function para otimizar performance
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function para limitar a frequência de execução
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Validação de email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Sanitiza texto para evitar XSS
     */
    static sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Copia texto para a área de transferência
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    /**
     * Exibe uma notificação toast
     */
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Estilos do toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Cores baseadas no tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#2563eb'
        };
        toast.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(toast);
        
        // Anima entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove após duração
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * Confirma uma ação com o usuário
     */
    static async confirm(message, title = 'Confirmar') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h2>${title}</h2>
                    </div>
                    <div style="padding: 1.5rem;">
                        <p>${message}</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="cancelBtn">Cancelar</button>
                        <button class="btn btn-danger" id="confirmBtn">Confirmar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const handleConfirm = () => {
                document.body.removeChild(modal);
                resolve(true);
            };

            const handleCancel = () => {
                document.body.removeChild(modal);
                resolve(false);
            };

            modal.querySelector('#confirmBtn').addEventListener('click', handleConfirm);
            modal.querySelector('#cancelBtn').addEventListener('click', handleCancel);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) handleCancel();
            });
        });
    }

    /**
     * Salva dados no localStorage
     */
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    /**
     * Carrega dados do localStorage
     */
    static loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove dados do localStorage
     */
    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    }
}

// Exporta para uso global
window.Utils = Utils;
