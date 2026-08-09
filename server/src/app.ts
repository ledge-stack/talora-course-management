import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import submissionRoutes from './routes/submissionRoutes';
import adminRoutes from './routes/adminRoutes';
import complaintRoutes from './routes/complaintRoutes';
import timetableRoutes from './routes/timetableRoutes';
import prisma from './db';
import { env } from './config/env';
import * as Sentry from '@sentry/node';

const app = express();

if (env.TRUST_PROXY) {
  app.set('trust proxy', env.TRUST_PROXY === 'true' || env.TRUST_PROXY === '1');
}

if (env.SENTRY_DSN) {
  Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });
}

app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging
const logger = pinoHttp();
app.use(logger);

// Basic rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Public/Shared Routes
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await prisma.courseUnit.findMany({
      include: {
        _count: { select: { groups: true } }
      }
    });
    res.json(courses);
  } catch (error) {
    console.error('[API] Failed to fetch courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/timetable', timetableRoutes);

app.get('/', (req, res) => {
  res.send('University Course Management API is running');
});

export default app;
