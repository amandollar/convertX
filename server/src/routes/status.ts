import { Router } from 'express';
import { videoQueue } from '../queue/videoQueue';
import { getDownloadUrl } from '../services/b2Service';

const router = Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const job = await videoQueue.getJob(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const result = job.returnvalue; // Contains b2Key if completed

    let downloadUrl = null;
    if (state === 'completed' && result?.b2Key) {
      downloadUrl = await getDownloadUrl(result.b2Key);
    }

    res.json({
      id: job.id,
      state,
      progress: job.progress,
      result: state === 'completed' ? { downloadUrl } : null,
    });

  } catch (error) {
    console.error('Status Check Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
