import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const videoQueue = new Queue('video-conversion', { connection });

export const addVideoToQueue = async (jobData: { 
  fileName: string; 
  filePath: string; 
  outputFormat: string; 
  jobId: string;
}) => {
  return await videoQueue.add('convert', jobData, {
    jobId: jobData.jobId,
    removeOnComplete: {
      age: 24 * 3600, // Keep for 24 hours
      count: 1000,    // Keep last 1000 jobs
    },
    removeOnFail: false,
  });
};
