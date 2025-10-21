import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';

import moviesRoutes from './routes/moviesRoutes.js';
import subtitleRoutes from './routes/subtitlesRoutes.js';

import { importMoviesOnStartup } from './services/movieService.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/movies', moviesRoutes);
app.use('/api/subtitles', subtitleRoutes)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // importMoviesOnStartup();
  });
});


