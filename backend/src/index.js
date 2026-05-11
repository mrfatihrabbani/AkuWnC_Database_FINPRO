import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import connectMongo from './config/mongo.js';
import { connectNeo4j } from './config/neo4j.js';

import movieRoutes from './routes/movie.routes.js';
import userRoutes from './routes/user.routes.js';
import graphRoutes from './routes/graph.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// db connections
const init = async () => {
  await connectMongo();
  await connectNeo4j();
};

init();

// mount routes
app.use('/api/movies', movieRoutes);
app.use('/api', userRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
