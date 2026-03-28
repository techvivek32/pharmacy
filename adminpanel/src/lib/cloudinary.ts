import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dw0abqcmm';
const apiKey = process.env.CLOUDINARY_API_KEY || '842336136597824';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'R99Nx1A5Bwg2j5O5BkOAWZrBTo0';

try {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('✅ Cloudinary configured successfully:', { cloudName, apiKey: apiKey.substring(0, 6) + '...' });
} catch (error) {
  console.error('❌ Cloudinary configuration error:', error);
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export const uploadToCloudinary = async (
  buffer: Buffer,
  options: {
    folder?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: any;
  } = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      const uploadOptions = {
        folder: options.folder || 'mediexpress',
        resource_type: options.resource_type || 'auto',
        ...options.transformation,
      };

      console.log('🔄 Starting Cloudinary upload with options:', uploadOptions);

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            console.log('✅ Cloudinary upload successful:', result.secure_url);
            resolve(result as CloudinaryUploadResult);
          } else {
            console.error('❌ Cloudinary upload failed: No result');
            reject(new Error('Upload failed: No result returned'));
          }
        }
      ).end(buffer);
    } catch (error) {
      console.error('❌ Cloudinary upload stream error:', error);
      reject(error);
    }
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting from Cloudinary:', publicId);
    await cloudinary.uploader.destroy(publicId);
    console.log('✅ Deleted from Cloudinary successfully');
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;