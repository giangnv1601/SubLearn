import express from 'express'
import { connectDB } from './config/db.js'
import dotenv from 'dotenv'
import cors from 'cors'

import movieRoute from './routes/movieRoute.js'
import subtitleRoute from './routes/subtitleRoute.js'
import exerciseRoute from './routes/exerciseRoute.js'
import userRoute from './routes/userRoute.js'
import quizzesRouter from './routes/quizRoute.js'

import { importMoviesOnStartup } from './services/movieService.js'

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/movies', movieRoute)
app.use('/api/subtitles', subtitleRoute)
app.use('/api/exercises', exerciseRoute)
app.use('/api/users', userRoute)
app.use('/api/quizzes', quizzesRouter)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // importMoviesOnStartup();
  });
});


