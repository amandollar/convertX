'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Upload, FileVideo, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface UploadFormProps {
  onUploadStart: () => void;
  onUploadSuccess: (jobId: string, originalName: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadStart, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('mp4');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    onUploadStart();
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('format', format);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percentCompleted);
        },
      });

      const { jobId, originalName } = response.data;
      onUploadSuccess(jobId, originalName);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
      <div
        className={clsx(
          "relative border border-dashed rounded-lg p-12 transition-all text-center cursor-pointer",
          dragActive 
            ? "border-blue-500 bg-blue-500/5" 
            : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50",
          file ? "border-blue-500/50 bg-blue-500/5" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
        
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center gap-3"
            >
              <FileVideo className="w-10 h-10 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="p-3 bg-zinc-800 rounded-full">
                <Upload className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-medium text-zinc-300">
                  Upload a video
                </p>
                <p className="text-xs text-zinc-500">
                  Drag and drop or click to browse
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Convert to</label>
          <div className="grid grid-cols-4 gap-2">
            {['mp4', 'mov', 'avi', 'mkv'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={clsx(
                  "py-2 px-3 rounded-md text-xs font-medium transition-colors border",
                  format === fmt 
                    ? "bg-zinc-100 text-zinc-900 border-zinc-100" 
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                )}
                disabled={uploading}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={clsx(
            "w-full py-2.5 rounded-md text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
            uploading 
                ? "bg-zinc-800 text-zinc-400 cursor-wait" 
                : "bg-blue-600 hover:bg-blue-500 text-white"
          )}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading... {progress}%
            </span>
          ) : (
            'Start Conversion'
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadForm;
