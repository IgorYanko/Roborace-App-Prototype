# Roborace App Prototype

Sistema completo para gerenciamento de competições Roborace, desenvolvido com Node.js/Express no backend e HTML/CSS/JavaScript no frontend.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Python 3 (para servidor frontend)
- Git

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Roborace-App-Prototype
```

### 2. Configure o Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Configure o banco de dados (SQLite)
npm run db:generate
npm run db:push

# Inicie o servidor backend
npm start
```

O backend estará rodando em: `http://localhost:3000`

### 3. Configure o Frontend

```bash
# Em um novo terminal, entre na pasta do frontend
cd frontend

# Inicie o servidor frontend
python3 -m http.server 8080
```

O frontend estará rodando em: `http://localhost:8080`

### 4. Acesse a aplicação

Abra seu navegador e acesse: `http://localhost:8080/pages/menu.html`

## 🚀 Início Rápido (Script Automático)

Para facilitar o início, use o script automático:

```bash
# Tornar o script executável (apenas na primeira vez)
chmod +x start.sh

# Iniciar aplicação completa
./start.sh
```

O script irá:
- ✅ Verificar e liberar portas ocupadas
- ✅ Iniciar backend na porta 3000
- ✅ Iniciar frontend na porta 8080
- ✅ Mostrar status dos serviços
- ✅ Parar tudo com Ctrl+C

## 🏗️ Arquitetura

### Backend (Node.js + Express)
- **Porta:** 3000
- **Banco:** SQLite (desenvolvimento)
- **ORM:** Prisma
- **API:** RESTful com CORS configurado

### Frontend (HTML/CSS/JavaScript)
- **Porta:** 8080
- **Servidor:** Python HTTP Server
- **Integração:** API REST via JavaScript

## 📁 Estrutura do Projeto

```
Roborace-App-Prototype/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── models/          # Modelos Prisma
│   │   ├── routes/          # Rotas da API
│   │   └── app.ts          # Servidor principal
│   ├── prisma/
│   │   └── schema.prisma   # Schema do banco
│   └── package.json
├── frontend/               # Interface web
│   ├── pages/              # Páginas HTML
│   │   ├── menu.html       # Menu principal
│   │   ├── competition-subscriber.html
│   │   ├── team-subscriber.html
│   │   ├── competition-manager.html
│   │   └── competition-table.html
│   ├── assets/
│   │   ├── scripts/        # JavaScript
│   │   ├── styles/         # CSS
│   │   └── images/         # Imagens
│   └── index.html
└── README.md
```

## 🔧 Comandos Úteis

### Backend
```bash
cd backend

# Desenvolvimento
npm start              # Inicia o servidor
npm run dev           # Modo desenvolvimento

# Banco de dados
npm run db:generate   # Gera cliente Prisma
npm run db:push       # Aplica mudanças no banco
npm run db:studio     # Interface visual do banco
npm run db:reset      # Reseta o banco

# Build
npm run build         # Compila TypeScript
```

### Frontend
```bash
cd frontend

# Servidor Python (recomendado)
python3 -m http.server 8080

# Servidor Node (alternativo)
npx http-server -p 8080

# Se a porta 8080 estiver ocupada, use outra porta
python3 -m http.server 8081
# ou
npx http-server -p 8081
```

## 🌐 Endpoints da API

### Competições
- `GET /api/competitions` - Listar competições
- `POST /api/competitions` - Criar competição
- `GET /api/competitions/:id` - Buscar competição
- `PUT /api/competitions/:id` - Atualizar competição
- `DELETE /api/competitions/:id` - Deletar competição

### Equipes
- `GET /api/teams/competition/:id` - Listar equipes por competição
- `POST /api/teams` - Criar equipe
- `PUT /api/teams/:id/stats` - Atualizar estatísticas
- `DELETE /api/teams/:id` - Deletar equipe

### Jogadores
- `POST /api/players` - Criar jogador
- `GET /api/players/team/:id` - Listar jogadores por equipe

### Partidas
- `GET /api/matches/competition/:id` - Listar partidas por competição
- `PUT /api/matches/:id/result` - Atualizar resultado
- `POST /api/matches/competition/:id/generate-group` - Gerar chaveamento

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] Cadastro de competições
- [x] Cadastro de equipes e jogadores
- [x] Gerenciamento de partidas
- [x] Sistema de ranking
- [x] Dashboard administrativo
- [x] Interface responsiva
- [x] Validação de formulários
- [x] Notificações em tempo real
- [x] Integração completa frontend-backend

### 🔄 Em Desenvolvimento
- [ ] Sistema de autenticação
- [ ] Geração automática de chaveamentos
- [ ] Relatórios em PDF
- [ ] Notificações por email

## 🐛 Solução de Problemas

### Erros de Build TypeScript
Se encontrar erros como "An import path can only end with a '.ts' extension":

**Solução:** Adicione `rewriteRelativeImportExtensions: true` no `tsconfig.json`:
```json
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
  }
}
```

**Depois use extensões .ts nos imports:**
```typescript
// ✅ Correto (com rewriteRelativeImportExtensions: true)
import { CompetitionModel } from '../models/Competition.ts';

// ❌ Incorreto (sem a configuração)
import { CompetitionModel } from '../models/Competition.js';
```

### CORS Errors
Se encontrar erros de CORS, verifique se:
1. Backend está rodando na porta 3000
2. Frontend está rodando na porta 8080
3. CORS está configurado corretamente no backend

### Erros de Servidor Frontend
Se o Python não funcionar:
```bash
# Verificar se Python está instalado
python3 --version

# Se não tiver Python, use Node.js
npx http-server -p 8080

# Ou instale Python
# macOS: brew install python3
# Ubuntu: sudo apt install python3
```

### Banco de Dados
Se houver problemas com o banco:

**Erro: "Table does not exist"**
```bash
cd backend
npx prisma db push    # Aplica schema no banco
npm run db:generate   # Gera cliente Prisma
```

**Resetar banco completamente:**
```bash
cd backend
npm run db:reset      # Reseta o banco (perde dados)
npm run db:generate   # Gera cliente Prisma
```

**Verificar status do banco:**
```bash
cd backend
npm run db:studio     # Interface visual do banco
```

### Portas Ocupadas
Se as portas estiverem ocupadas:

**Verificar qual processo está usando a porta:**
```bash
# Verificar porta 3000 (backend)
lsof -i :3000

# Verificar porta 8080 (frontend)
lsof -i :8080
```

**Matar processos nas portas:**
```bash
# Matar processo na porta 3000
lsof -ti tcp:3000 | xargs kill -9

# Matar processo na porta 8080
lsof -ti tcp:8080 | xargs kill -9

# Matar processo na porta 8081
lsof -ti tcp:8081 | xargs kill -9
```

**Usar portas alternativas:**
```bash
# Frontend em porta diferente
python3 -m http.server 8081
# ou
npx http-server -p 8081

# Backend em porta diferente (alterar no .env)
PORT=3001 npm start
```

### Verificar se os Serviços Estão Rodando
```bash
# Verificar backend
curl http://localhost:3000

# Verificar frontend
curl http://localhost:8080

# Verificar processos nas portas
lsof -i :3000
lsof -i :8080
```

## 🚀 Deploy

### Desenvolvimento
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:8080`

### Produção (Recomendado)
1. **Containerização:** Use Docker Compose
2. **Reverse Proxy:** Nginx para unificar origens
3. **Banco:** PostgreSQL para produção
4. **HTTPS:** Configure SSL/TLS

## 📝 Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados (desenvolvimento)
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização
- **JavaScript ES6+** - Lógica
- **Font Awesome** - Ícones
- **Particles.js** - Efeitos visuais

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido para a Univás** | **Sistema Roborace** 🏆
