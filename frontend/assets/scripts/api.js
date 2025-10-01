const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    static async getCompetitions() {
        return this.request('/competitions');
    }

    static async getCompetition(id) {
        return this.request(`/competitions/${id}`);
    }

    static async createCompetition(data) {
        return this.request('/competitions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateCompetition(id, data) {
        return this.request(`/competitions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteCompetition(id) {
        return this.request(`/competitions/${id}`, {
            method: 'DELETE'
        });
    }

    static async getTeams(competitionId) {
        return this.request(`/teams/competition/${competitionId}`);
    }

    static async getTeam(id) {
        return this.request(`/teams/${id}`);
    }

    static async createTeam(data) {
        return this.request('/teams', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateTeamStats(id, result) {
        return this.request(`/teams/${id}/stats`, {
            method: 'PUT',
            body: JSON.stringify({ result })
        });
    }

    static async deleteTeam(id) {
        return this.request(`/teams/${id}`, {
            method: 'DELETE'
        });
    }

    static async getPlayers(teamId) {
        return this.request(`/players/team/${teamId}`);
    }

    static async getPlayer(id) {
        return this.request(`/players/${id}`);
    }

    static async createPlayer(data) {
        return this.request('/players', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updatePlayer(id, data) {
        return this.request(`/players/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deletePlayer(id) {
        return this.request(`/players/${id}`, {
            method: 'DELETE'
        });
    }

    static async getMatches(competitionId) {
        return this.request(`/matches/competition/${competitionId}`);
    }

    static async getMatchesByPhase(competitionId, phase) {
        return this.request(`/matches/competition/${competitionId}/phase/${phase}`);
    }

    static async createMatch(data) {
        return this.request('/matches', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateMatchResult(id, result) {
        return this.request(`/matches/${id}/result`, {
            method: 'PUT',
            body: JSON.stringify({ result })
        });
    }

    static async generateGroupMatches(competitionId, teamIds) {
        return this.request(`/matches/competition/${competitionId}/generate-group`, {
            method: 'POST',
            body: JSON.stringify({ teamIds })
        });
    }

    static async generateSemifinals(competitionId, top4Teams) {
        return this.request(`/matches/competition/${competitionId}/generate-semifinals`, {
            method: 'POST',
            body: JSON.stringify({ top4Teams })
        });
    }

    static async generateThirdPlaceAndFinal(competitionId, semifinalWinners, semifinalLosers) {
        return this.request(`/matches/competition/${competitionId}/generate-finals`, {
            method: 'POST',
            body: JSON.stringify({ semifinalWinners, semifinalLosers })
        });
    }
}

class NotificationService {
    static show(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                .notification-success {
                    background: linear-gradient(135deg, #00a000, #00cc00);
                }
                .notification-error {
                    background: linear-gradient(135deg, #a00000, #cc0000);
                }
                .notification-info {
                    background: linear-gradient(135deg, #0066cc, #0088ff);
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    static getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateTeamForm(formData) {
        const errors = [];

        if (!this.validateRequired(formData.teamName)) {
            errors.push('Nome da equipe é obrigatório');
        }

        if (!this.validateRequired(formData.institution)) {
            errors.push('Instituição é obrigatória');
        }

        if (!this.validateRequired(formData.email)) {
            errors.push('E-mail é obrigatório');
        } else if (!this.validateEmail(formData.email)) {
            errors.push('E-mail inválido');
        }

        if (!this.validateRequired(formData.competitionId)) {
            errors.push('Competição é obrigatória');
        }

        return errors;
    }

    static validateCompetitionForm(formData) {
        const errors = [];

        if (!this.validateRequired(formData.name)) {
            errors.push('Nome da competição é obrigatório');
        }

        if (!formData.maxTeams || formData.maxTeams < 2) {
            errors.push('Número máximo de equipes deve ser pelo menos 2');
        }

        if (!formData.maxPlayersPerTeam || formData.maxPlayersPerTeam < 1) {
            errors.push('Número máximo de jogadores por equipe deve ser pelo menos 1');
        }

        return errors;
    }
}

window.ApiService = ApiService;
window.NotificationService = NotificationService;
window.FormValidator = FormValidator;
