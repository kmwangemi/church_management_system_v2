import { useCallback, useState } from 'react';
import { uploadLogo } from '@/components/upload-helpers';

export const useLogoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);
      const result = await uploadLogo(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);
  return {
    upload,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null),
  };
};
