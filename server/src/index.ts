import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload';
import statusRoutes from './routes/status';
import { initWorker } from './worker/ffmpegWorker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Worker
initWorker();

app.use('/api/upload', uploadRoutes);
app.use('/api/status', statusRoutes);

app.get('/', (req, res) => {
  res.send('Video Converter API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
