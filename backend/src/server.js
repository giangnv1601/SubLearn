import express from 'express';
import moviesRoutes from './routes/moviesRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { importMoviesOnStartup } from './services/movieService.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/movies', moviesRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // importMoviesOnStartup();
  });
});


