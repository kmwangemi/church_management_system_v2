import { FILE_CONFIGS } from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary';
import { type NextRequest, NextResponse } from 'next/server';
import path from 'node:path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload to Cloudinary
const uploadToCloudinary = (
  buffer: Buffer,
  options: {
    folder: string;
    resourceType: 'image' | 'raw';
    originalName?: string;
  }
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: options.folder,
      resource_type: options.resourceType,
    };
    // For non-image files, preserve original filename
    if (options.resourceType === 'raw' && options.originalName) {
      uploadOptions.public_id = path.parse(options.originalName).name;
    }
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      })
      .end(buffer);
  });
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = (formData.get('type') as string) || 'image';
    if (!file) {
      return NextResponse.json(
        {
          error: 'No file uploaded',
        },
        { status: 400 }
      );
    }
    // Validate file type
    const config = FILE_CONFIGS[fileType as keyof typeof FILE_CONFIGS];
    if (!config) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Supported types: image, document, logo',
        },
        { status: 400 }
      );
    }
    // Validate file size
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: `File size exceeds the limit. Maximum allowed size is ${maxSizeMB}MB.`,
        },
        { status: 400 }
      );
    }
    // Validate file type
    if (!config.allowedMimeTypes.includes(file.type)) {
      const allowedTypes = config.allowedMimeTypes
        .map((type) => type.split('/')[1].toUpperCase())
        .join(', ');
      return NextResponse.json(
        {
          error: `File format not supported. Please upload ${allowedTypes} files only.`,
        },
        { status: 400 }
      );
    }
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder: config.folder,
      resourceType: config.resourceType,
      originalName: file.name,
    });
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        created_at: result.created_at,
      },
    });
  } catch (error: any) {
    // Handle specific errors
    if (error.message?.includes('File format not supported')) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: `Upload failed: ${error.message || 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
export function GET() {
  return NextResponse.json(
    {
      message: 'Upload endpoint - use POST method',
    },
    { status: 405 }
  );
}
