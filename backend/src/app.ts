import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import competitionRoutes from './routes/competitionRoutes.ts';
import teamRoutes from './routes/teamRoutes.ts';
import playerRoutes from './routes/playerRoutes.ts';
import matchRoutes from './routes/matchRoutes.ts';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// CORS simples para desenvolvimento
const corsOptions: cors.CorsOptions = {
  origin: true, // Aceita qualquer origem em desenvolvimento
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Preflight manual para cada rota da API
app.options('/api/competitions', cors(corsOptions));
app.options('/api/teams', cors(corsOptions));
app.options('/api/players', cors(corsOptions));
app.options('/api/matches', cors(corsOptions));

app.use('/api/competitions', competitionRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'API Roborace Competitions está funcionando!',
    version: '1.0.0',
    endpoints: {
      competitions: '/api/competitions',
      teams: '/api/teams',
      players: '/api/players',
      matches: '/api/matches'
    }
  });
});

app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}`);
});