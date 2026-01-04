import express from 'express'
import { connectDB } from './config/db.js'
import dotenv from 'dotenv'
import cors from 'cors'

import movieRoute from './routes/movieRoute.js'
import subtitleRoute from './routes/subtitleRoute.js'
import userRoute from './routes/userRoute.js'
import quizRoute from './routes/quizRoute.js'
import resultRoute from './routes/resultRoute.js'

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173'],
  credentials: true
};
app.use(cors(corsOptions));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/movies', movieRoute)
app.use('/api/subtitles', subtitleRoute)
app.use('/api/users', userRoute)
app.use('/api/quizzes', quizRoute)
app.use('/api/results', resultRoute)

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

