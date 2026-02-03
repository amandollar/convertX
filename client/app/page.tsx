'use client';

import { useState } from 'react';
import UploadForm from '@/components/UploadForm';
import StatusCard from '@/components/StatusCard';
import { Zap } from 'lucide-react';

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string>('');

  const handleUploadStart = () => {
    // Optional: UI tweak when upload starts
  };

  const handleUploadSuccess = (id: string, name: string) => {
    setJobId(id);
    setOriginalName(name);
  };

  const handleReset = () => {
    setJobId(null);
    setOriginalName('');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            ConvertX
          </h1>
          <p className="text-zinc-400">
            Simple, secure video conversion.
          </p>
        </div>

        <div className="w-full">
          {jobId ? (
            <StatusCard 
              jobId={jobId} 
              originalName={originalName} 
              onReset={handleReset} 
            />
          ) : (
            <UploadForm 
              onUploadStart={handleUploadStart} 
              onUploadSuccess={handleUploadSuccess} 
            />
          )}
        </div>
      </div>
    </main>
  );
}
