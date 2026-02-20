import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import intersectionRoutes from './routes/intersections.js';
import reportRoutes from './routes/reports.js';
import analyticsRoutes from './routes/analytics.js';
import exportRoutes from './routes/export.js';
import comparisonRoutes from './routes/comparison.js';
import signupRoutes from './routes/signup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'https://dbprj.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.options('*', cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/intersections', intersectionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/signup', signupRoutes); 

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Traffic Flower API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
