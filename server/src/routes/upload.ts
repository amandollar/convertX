import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { addVideoToQueue } from '../queue/videoQueue';

const router = Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { format } = req.body; // Target format (e.g., 'mp4', 'mov')
    const jobId = uuidv4();

    await addVideoToQueue({
      fileName: req.file.filename,
      filePath: req.file.path,
      outputFormat: format || 'mp4',
      jobId,
    });

    res.json({ 
      message: 'Video upload successful, processing started.',
      jobId, 
      originalName: req.file.originalname 
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
