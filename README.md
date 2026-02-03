---

# ConvertX – Video Converter Platform

ConvertX is a **production-ready video conversion platform** built with a modern, scalable web stack. Users can upload videos, track conversion progress in real time, and securely download optimized files in their desired format.



---

## 🚀 Features

* **Drag & Drop Upload** – Smooth and intuitive file upload experience
* **Multi-Format Conversion** – Convert videos to MP4, AVI, MOV, MKV
* **Asynchronous Processing** – Reliable background jobs powered by BullMQ & Redis
* **Scalable Object Storage** – Secure video storage using Backblaze B2 (S3-compatible)
* **Real-Time Status Tracking** – Live conversion progress via polling
* **Secure Downloads** – Time-limited signed URLs for safe file access

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express
* TypeScript

### Infrastructure & Processing

* FFmpeg (Video processing)
* BullMQ + Redis (Job queue)
* Backblaze B2 (S3-compatible object storage)

---

## ⚙️ How It Works

1. **Upload**
   The user selects a video file and target format from the Next.js frontend.

2. **Ingest**
   The file is streamed to the Node.js API and uploaded directly to a secure Backblaze B2 bucket.

3. **Queue**
   After upload, a conversion job is added to a Redis-backed **BullMQ** queue.

4. **Process**
   A dedicated worker service picks up the job, downloads the source video, and converts it using **FFmpeg**.

5. **Store**
   The converted video is uploaded back to Backblaze B2. Temporary local files are cleaned up automatically.

6. **Notify**
   The frontend polls a status endpoint. Once complete, it receives a secure, time-limited download URL.

---

## 📦 Installation & Setup

### Prerequisites

* Node.js **v18+**
* Redis (local or remote)
* FFmpeg (available in system PATH)
* Backblaze B2 bucket credentials

---

### 1️⃣ Clone & Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

---

### 2️⃣ Environment Configuration

Create a `.env` file inside the `server` directory:

```env
PORT=5000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

B2_APPLICATION_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_app_key
B2_BUCKET_NAME=your_bucket_name
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
```

---

### 3️⃣ Running the Project

#### Start Backend

```bash
cd server
npm run dev
```

#### Start Frontend

```bash
cd client
npm run dev
```

Open your browser and visit:

```
http://localhost:3000
```

---

## 🏗️ Architecture Overview

ConvertX uses a **decoupled, scalable architecture**:

* The **API server** handles uploads, job creation, and status checks
* The **worker service** handles CPU-intensive FFmpeg processing
* Redis + BullMQ ensures reliable background job execution
* Object storage (Backblaze B2) keeps the system stateless and scalable

This design keeps the UI responsive while enabling horizontal scaling of workers.

---
