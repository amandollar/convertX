'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle, Download, FileVideo, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusCardProps {
  jobId: string;
  originalName: string;
  onReset: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ jobId, originalName, onReset }) => {
  const [status, setStatus] = useState<string>('waiting'); // waiting, active, completed, failed
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/status/${jobId}`);
        const { state, result } = response.data;
        
        setStatus(state);

        if (state === 'completed' && result?.downloadUrl) {
          setDownloadUrl(result.downloadUrl);
          clearInterval(interval);
        } else if (state === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Status check failed:', err);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 2 seconds
    interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-6"
      >
        {status === 'completed' ? (
          <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        ) : status === 'failed' ? (
           <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-red-500" />
          </div>
        ) : (
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}

        <div className="space-y-1">
          <h2 className="text-lg font-medium text-zinc-100">
            {status === 'completed' ? 'Ready for download' : 
             status === 'failed' ? 'Conversion Failed' :
             status === 'active' ? 'Converting...' : 
             'Processing...'}
          </h2>
          <p className="text-zinc-500 text-sm max-w-[250px] mx-auto truncate">
            {originalName}
          </p>
        </div>

        {status === 'completed' && downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank" // Often safer for B2/S3 links
            rel="noopener noreferrer" 
            className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-5 py-2.5 rounded-md text-sm font-medium transition-colors w-full justify-center"
          >
            <Download className="w-4 h-4" />
            Download Video
          </a>
        )}
        
        {status === 'failed' && (
           <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
        )}

        <button
          onClick={onReset}
          className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Convert Another
        </button>
      </motion.div>
    </div>
  );
};

export default StatusCard;
