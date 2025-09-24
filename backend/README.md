# Roborace Competitions API

API para gerenciamento de competições de robótica com sistema de pontos corridos e mata-mata.

## 🚀 Configuração Inicial

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados PostgreSQL
1. Instalar PostgreSQL
2. Criar o banco de dados:
```sql
CREATE DATABASE roborace_competitions;
```

### 3. Configurar variáveis de ambiente
Copie o arquivo `env.example` para `.env` e configure as variáveis:
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roborace_competitions?schema=public"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Inicializar banco de dados com Prisma
```bash
# Gerar o cliente Prisma
npm run db:generate

# Criar e aplicar migrações
npm run db:migrate
```

### 5. Executar a aplicação
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

## 📊 Estrutura do Banco de Dados

### Tabelas:
- **competitions**: Competições (nome, max_teams, max_players_per_team)
- **teams**: Equipes (nome, instituição, estatísticas)
- **players**: Jogadores (nome, team_id)
- **matches**: Partidas (team1_id, team2_id, resultado, fase)

### Relacionamentos:
- Competition → Teams (1:N)
- Team → Players (1:N)
- Competition → Matches (1:N)
- Team → Matches (1:N) - como team1 ou team2

## 🛠 Endpoints da API

### Competições
- `POST /api/competitions` - Criar competição
- `GET /api/competitions` - Listar competições
- `GET /api/competitions/:id` - Buscar competição
- `PUT /api/competitions/:id` - Atualizar competição
- `DELETE /api/competitions/:id` - Deletar competição

### Equipes
- `POST /api/teams` - Criar equipe
- `GET /api/teams/competition/:competitionId` - Listar equipes de uma competição
- `GET /api/teams/:id` - Buscar equipe (com jogadores)
- `PUT /api/teams/:id/stats` - Atualizar estatísticas
- `DELETE /api/teams/:id` - Deletar equipe

### Jogadores
- `POST /api/players` - Criar jogador
- `GET /api/players/team/:teamId` - Listar jogadores de uma equipe
- `GET /api/players/:id` - Buscar jogador
- `PUT /api/players/:id` - Atualizar jogador
- `DELETE /api/players/:id` - Deletar jogador

### Partidas
- `POST /api/matches` - Criar partida
- `GET /api/matches/competition/:competitionId` - Listar partidas de uma competição
- `GET /api/matches/competition/:competitionId/phase/:phase` - Listar partidas por fase
- `PUT /api/matches/:id/result` - Atualizar resultado da partida

### Geração de Partidas
- `POST /api/matches/competition/:competitionId/generate-group` - Gerar partidas do grupo
- `POST /api/matches/competition/:competitionId/generate-semifinals` - Gerar semifinais
- `POST /api/matches/competition/:competitionId/generate-finals` - Gerar disputa do 3º lugar e final

## 🏆 Sistema de Pontuação

- **Vitória**: 2 pontos
- **Empate**: 1 ponto
- **Derrota**: 0 pontos

## 🎯 Fases da Competição

1. **Grupo**: Pontos corridos entre todas as equipes
2. **Semifinal**: Top 4 equipes (1º vs 4º, 2º vs 3º)
3. **Disputa do 3º lugar**: Perdedores das semifinais
4. **Final**: Vencedores das semifinais

## 📝 Exemplos de Uso

### Criar uma competição
```bash
curl -X POST http://localhost:3000/api/competitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Roborace 2024",
    "max_teams": 8,
    "max_players_per_team": 4
  }'
```

### Criar uma equipe
```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Equipe Alpha",
    "institution": "Universidade XYZ",
    "competition_id": 1
  }'
```

### Registrar resultado de partida
```bash
curl -X PUT http://localhost:3000/api/matches/1/result \
  -H "Content-Type: application/json" \
  -d '{
    "result": "team1_win"
  }'
```

## 🔧 Scripts Disponíveis

- `npm start` - Executar em produção
- `npm run dev` - Executar em desenvolvimento (com hot reload)
- `npm run build` - Compilar TypeScript
- `npm run db:generate` - Gerar cliente Prisma
- `npm run db:migrate` - Criar e aplicar migrações
- `npm run db:deploy` - Aplicar migrações em produção
- `npm run db:reset` - Resetar banco de dados
- `npm run db:studio` - Abrir Prisma Studio (interface visual)
