import type { FileType, UploadResponse } from '@/lib/types';

// Generic upload function
export const uploadFile = async (
  file: File,
  type: FileType
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`/api/upload?type=${type}`, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Upload failed');
  }
  return result;
};

// Specific upload functions
export const uploadImage = async (file: File): Promise<string> => {
  const result = await uploadFile(file, 'image');
  return result.data!.secure_url;
};

export const uploadLogo = async (file: File): Promise<string> => {
  const result = await uploadFile(file, 'logo');
  return result.data!.secure_url;
};

export const uploadDocument = async (file: File): Promise<string> => {
  const result = await uploadFile(file, 'document');
  return result.data!.secure_url;
};
