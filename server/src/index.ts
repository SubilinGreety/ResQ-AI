import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import scenarioRoutes from './routes/scenarioRoutes';
import riskRoutes from './routes/riskRoutes';
import alertRoutes from './routes/alertRoutes';
import { connectDB, prisma } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan('dev'));
app.use(express.json());

// Base Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    system: 'ResQ AI - Modules 1, 2 & 3 (Scenario, Risk Prediction & Alerts)',
    city: 'Chennai, Tamil Nadu',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/scenarios', riskRoutes);
app.use('/api/scenarios', alertRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

async function startServer() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚨 ResQ AI EOC Backend [MODULE 1] Activated`);
    console.log(`📍 City Sector: Chennai, Tamil Nadu`);
    console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/scenarios`);
    console.log(`🩺 Health Status: http://localhost:${PORT}/api/health`);
    console.log(`==================================================\n`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Initiating graceful EOC backend shutdown...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('🔒 Database connections closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
