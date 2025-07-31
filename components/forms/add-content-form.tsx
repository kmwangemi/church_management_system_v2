'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { uploadDocument, uploadImage } from '@/components/upload-helpers';
import { useCreateContent } from '@/lib/hooks/content/use-content-queries';
import type { FileType } from '@/lib/types';
import type { AddContentPayload } from '@/lib/validations/content';
import {
  AddContentSchema,
  CONTENT_CATEGORIES,
  CONTENT_STATUSES,
  CONTENT_TYPES,
} from '@/lib/validations/content';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, FileText, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import RenderApiError from '../api-error';

interface AddContentFormProps {
  onCloseDialog: () => void;
}

export function AddContentForm({ onCloseDialog }: AddContentFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    mutateAsync: createContentMutation,
    isPending,
    isError,
    error,
  } = useCreateContent();
  const form = useForm<AddContentPayload>({
    resolver: zodResolver(AddContentSchema),
    defaultValues: {
      title: '',
      description: '',
      type: '' as any,
      category: '' as any,
      tags: '',
      status: 'draft',
      isPublic: false,
    },
  });
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (100MB)
      if (file.size > 100 * 1024 * 1024) {
        form.setError('fileUrl', {
          type: 'manual',
          message: 'File size must be less than 100MB',
        });
        return;
      }
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'audio/mpeg',
        'audio/wav',
        'audio/mp3',
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];
      if (!allowedTypes.includes(file.type)) {
        form.setError('fileUrl', {
          type: 'manual',
          message:
            'Invalid file type. Please upload PDF, DOC, MP3, MP4, JPG, PNG, or PPT files.',
        });
        return;
      }
      setSelectedFile(file);
      form.clearErrors('fileUrl');
    }
  };
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    form.setValue('fileUrl', undefined);
    form.setValue('fileName', undefined);
    form.setValue('fileSize', undefined);
    form.setValue('fileMimeType', undefined);
  };
  const uploadFileToServer = async (
    file: File
  ): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
  }> => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      // Determine file type for upload service
      const fileType: FileType = file.type.startsWith('image/')
        ? 'image'
        : 'document';
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      let fileUrl: string;
      if (fileType === 'image') {
        fileUrl = await uploadImage(file);
      } else {
        fileUrl = await uploadDocument(file);
      }
      clearInterval(progressInterval);
      setUploadProgress(100);
      return {
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
      };
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };
  const onSubmit = async (data: AddContentPayload) => {
    try {
      let fileData = {};
      // Upload file if selected
      if (selectedFile) {
        const uploadResult = await uploadFileToServer(selectedFile);
        fileData = uploadResult;
      }
      // Create content with file data
      const contentPayload: AddContentPayload = {
        ...data,
        ...fileData,
      };
      await createContentMutation(contentPayload);
      onCloseDialog();
    } catch (error) {
      console.error('Error creating content:', error);
      // Error handling is managed by the mutation hook
    }
  };
  const isLoading = isPending || isUploading;
  return (
    <>
      {isError && <RenderApiError error={error} />}
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Content Details</span>
              </CardTitle>
              <CardDescription>
                Add new content to the church library
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Content Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter content title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the content..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Content Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[400px] overflow-y-auto">
                          {CONTENT_TYPES.map((option) => (
                            <SelectItem
                              className="cursor-pointer"
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[400px] overflow-y-auto">
                          {CONTENT_CATEGORIES.map((option) => (
                            <SelectItem
                              className="cursor-pointer"
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tags <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tags separated by commas (e.g., faith, prayer, worship)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Status <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[400px] overflow-y-auto">
                          {CONTENT_STATUSES.map((option) => (
                            <SelectItem
                              className="cursor-pointer"
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Public Content
                        </FormLabel>
                        <div className="text-muted-foreground text-sm">
                          Make this content visible to all members
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {/* File Upload Section */}
              <FormField
                control={form.control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload File (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {selectedFile ? (
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-8 w-8 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">
                                  {selectedFile.name}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {(selectedFile.size / (1024 * 1024)).toFixed(
                                    2
                                  )}{' '}
                                  MB
                                </p>
                              </div>
                            </div>
                            <Button
                              disabled={isUploading}
                              onClick={removeFile}
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label
                            className="block cursor-pointer rounded-lg border-2 border-gray-300 border-dashed p-6 text-center transition-colors hover:border-gray-400"
                            htmlFor="file-upload"
                          >
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                              <span className="font-medium text-blue-600 text-sm hover:text-blue-500">
                                Click to upload a file
                              </span>
                              <p className="mt-1 text-gray-500 text-xs">
                                PDF, DOC, MP3, MP4, JPG, PNG, PPT up to 100MB
                              </p>
                            </div>
                            <input
                              accept=".pdf,.doc,.docx,.mp3,.mp4,.jpg,.jpeg,.png,.ppt,.pptx"
                              className="hidden"
                              id="file-upload"
                              onChange={handleFileSelect}
                              ref={fileInputRef}
                              type="file"
                            />
                          </label>
                        )}
                        {/* Upload Progress */}
                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Uploading...</span>
                              <span>{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {uploadProgress === 100 && !isUploading && (
                          <div className="flex items-center space-x-2 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>Upload complete</span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end space-x-4">
            <Button
              disabled={isLoading}
              onClick={onCloseDialog}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              // disabled={!form.formState.isValid || isLoading}
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Creating Content...'}
                </>
              ) : (
                'Add Content'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
