import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
import path from 'path';
import fs from 'fs';
import { uploadFileToB2 } from '../services/b2Service';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const initWorker = () => {
  const worker = new Worker('video-conversion', async job => {
    console.log(`Processing job ${job.id}`);
    const { filePath, outputFormat, fileName } = job.data;
    
    // Output file path
    const outputFileName = `${path.parse(fileName).name}_converted.${outputFormat}`;
    const outputFilePath = path.join(path.dirname(filePath), outputFileName);

    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .output(outputFilePath)
        .on('end', async () => {
          console.log(`Conversion finished: ${outputFileName}`);
          
          try {
            // Upload to B2
            const b2Key = `converted/${outputFileName}`;
            // Mime type guessing (simplified)
            const contentType = outputFormat === 'mp4' ? 'video/mp4' : 'video/x-matroska';
            
            await uploadFileToB2(outputFilePath, b2Key, contentType);
            console.log(`Uploaded to B2: ${b2Key}`);

            // Cleanup local files (input and output)
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);

            resolve({ b2Key });
          } catch (err) {
            console.error('Upload failed:', err);
            reject(err);
          }
        })
        .on('error', (err) => {
          console.error('Conversion failed:', err);
          reject(err);
        })
        .run();
    });
  }, { connection });

  worker.on('completed', job => {
    console.log(`Job ${job.id} completed!`);
  });

  worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed: ${err.message}`);
  });
  
  return worker;
};
