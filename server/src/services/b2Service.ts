import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const B2_ENDPOINT = process.env.B2_ENDPOINT || 'https://s3.us-west-004.backblazeb2.com';
const B2_KEY_ID = process.env.B2_APPLICATION_KEY_ID!;
const B2_APP_KEY = process.env.B2_APPLICATION_KEY!;
const BUCKET_NAME = process.env.B2_BUCKET_NAME!;

const s3Client = new S3Client({
  endpoint: B2_ENDPOINT,
  region: 'us-west-004', // B2 usually requires a region, often matches the endpoint
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_APP_KEY,
  },
});

export const uploadFileToB2 = async (filePath: string, key: string, contentType: string) => {
  const fileStream = fs.createReadStream(filePath);
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  });
  return await s3Client.send(command);
};

export const getDownloadUrl = async (key: string, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};
