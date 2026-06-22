import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/connection';
import authRoutes from './routes/auth';
import requestsRoutes from './routes/requests';
import analyticsRoutes from './routes/analytics';
import dataRoutes from './routes/data';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());

// Conectar ao MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  });

// Conectar ao SQL Server (se configurado)
if (process.env.ERP_SERVER) {
  initDatabase().catch((error) => {
    console.error('⚠️  SQL Server não disponível:', error.message);
    console.log('ℹ️  Sistema funcionará apenas com dados do MongoDB');
  });
}

// Rotas
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API App Preços rodando!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/data', dataRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
