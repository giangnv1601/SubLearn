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
app.use(cors());

// Routes
app.use('/api/movies', movieRoute)
app.use('/api/subtitles', subtitleRoute)
app.use('/api/users', userRoute)
app.use('/api/quizzes', quizRoute)
app.use('/api/results', resultRoute)

export default app

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

