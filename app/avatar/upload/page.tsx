'use client';

import type { PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-2xl w-full glass-card p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-2 text-gradient">Upload Your Avatar</h1>
        <p className="text-gray-400 mb-2">Upload an image to Vercel Blob storage</p>
        <p className="text-sm text-gray-500 mb-8">
          Using client-side upload (no file size limit, efficient)
        </p>

        <form
          onSubmit={async (event) => {
            event.preventDefault();

            if (!inputFileRef.current?.files) {
              toast.error("No file selected");
              return;
            }

            const file = inputFileRef.current.files[0];

            // Validate file size (optional - client upload has no hard limit)
            if (file.size > 100 * 1024 * 1024) { // 100MB soft limit
              toast.error("File too large. Maximum size is 100MB.");
              return;
            }

            setUploading(true);
            setProgress(0);

            try {
              // Client-side upload directly to Vercel Blob
              // No data goes through your server (efficient!)
              const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/avatar/upload',
                onUploadProgress: ({ loaded, total }) => {
                  setProgress(Math.round((loaded / total) * 100));
                },
              });

              setBlob(newBlob);
              toast.success('Upload successful!');

              // Reset form
              if (inputFileRef.current) {
                inputFileRef.current.value = '';
              }
            } catch (error) {
              console.error('Upload failed:', error);
              toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.');
            } finally {
              setUploading(false);
              setProgress(0);
            }
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium text-gray-300">
              Select Image
            </label>
            <Input
              id="file"
              name="file"
              ref={inputFileRef}
              type="file"
              accept="image/jpeg, image/png, image/webp"
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <Button
            type="submit"
            disabled={uploading}
            className="btn-gradient w-full relative overflow-hidden"
          >
            {uploading ? (
              <>
                <span className="relative z-10">Uploading... {progress}%</span>
                <div
                  className="absolute inset-0 bg-accent/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Features:</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>✅ Direct browser-to-storage upload (no server bandwidth used)</li>
            <li>✅ No file size limit (server upload limited to 4.5MB)</li>
            <li>✅ Progress tracking</li>
            <li>✅ Automatic random suffix (prevents cache issues)</li>
            <li>✅ Content type validation (images only)</li>
            <li>✅ Global CDN delivery</li>
          </ul>
        </div>

        {blob && (
          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-accent">Upload Successful!</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Blob URL:</p>
              <a
                href={blob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline break-all block"
              >
                {blob.url}
              </a>
            </div>
            {blob.url && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Preview:</p>
                <img
                  src={blob.url}
                  alt="Uploaded avatar"
                  className="max-w-full h-auto rounded-lg border border-white/10"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
