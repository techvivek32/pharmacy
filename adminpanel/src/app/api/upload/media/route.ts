import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const isAuthenticated = token ? !!verifyToken(token) : false;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const folder = formData.get('folder') as string;

    // Allow unauthenticated uploads only for registration documents
    const isRegistrationUpload = folder === 'rider-licenses' || folder === 'registration';
    if (!isAuthenticated && !isRegistrationUpload) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size based on type
    let allowedTypes: string[];
    let allowedExtensions: string[];
    let maxSize: number;
    let uploadFolder: string;

    if (type === 'video') {
      allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/avi'];
      allowedExtensions = ['mp4', 'mov', 'avi', 'webm'];
      maxSize = 50 * 1024 * 1024;
      uploadFolder = folder || 'mediexpress/videos';
    } else {
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/pjpeg'];
      allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      maxSize = 10 * 1024 * 1024;
      uploadFolder = folder || 'mediexpress/images';
    }

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension || '');

    if (!isValidType) {
      return NextResponse.json({ 
        success: false, 
        message: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}. Received: ${file.type}` 
      }, { status: 400 });
    }

    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json({ 
        success: false, 
        message: `File too large. Maximum size is ${sizeMB}MB.` 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with appropriate settings
    const uploadOptions = {
      folder: uploadFolder,
      resource_type: type === 'video' ? 'video' as const : 'image' as const,
      transformation: type === 'video' ? {
        quality: 'auto',
        format: 'mp4'
      } : {
        quality: 'auto',
        format: 'webp'
      }
    };

    const result = await uploadToCloudinary(buffer, uploadOptions);

    return NextResponse.json({
      success: true,
      data: { 
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      },
      message: `${type === 'video' ? 'Video' : 'Image'} uploaded successfully`,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}