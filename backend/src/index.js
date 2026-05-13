import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import connectMongo from './config/mongo.js';
import { connectNeo4j } from './config/neo4j.js';

import userRoutes from './routes/userRoute.js';
import graphRoutes from './routes/graphRoute.js';
import authRoutes from './routes/authRoute.js';
import appInfoRoutes from './routes/appingfoRoute.js';
import notificationRoutes from './routes/notificationRoute.js';
import reviewRoutes from './routes/reviewPageRoute.js';
import contentRoutes from './routes/movienseriesRoute.js';
import watchlistRoutes from './routes/watchlistRoute.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const init = async () => {
  await connectMongo();
  await connectNeo4j();
};

init();

app.use('/api', userRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/app-info', appInfoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/watchlist', watchlistRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
