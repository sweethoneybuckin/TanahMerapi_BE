// config/cloudinary.js
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'tanah-merapi',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// Create multer upload middleware
const uploadCloud = multer({ storage: storage });

export { cloudinary, uploadCloud };

// middleware/CloudinaryUpload.js
import { uploadCloud } from '../config/cloudinary.js';

// Export middleware for different upload types
export const singleUpload = uploadCloud.single('image');
export const multipleUpload = uploadCloud.array('images', 5);
export const menuItemUpload = uploadCloud.single('image');
export const packageUpload = uploadCloud.single('image');
export const promotionUpload = uploadCloud.single('image');
export const slideUpload = uploadCloud.single('image');
export const settingUpload = uploadCloud.single('image');
export const fileUpload = uploadCloud.single('file');

// services/CloudinaryService.js
import { cloudinary } from '../config/cloudinary.js';

// Helper function to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }
  
  try {
    // Extract the public ID from the URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    const urlParts = url.split('/');
    const filenamePart = urlParts[urlParts.length - 1];
    const publicId = filenamePart.split('.')[0];
    
    // Include folder if present
    const folderIndex = urlParts.indexOf('upload') + 1;
    if (folderIndex < urlParts.length - 1) {
      const folder = urlParts.slice(folderIndex, -1).join('/');
      return folder ? `${folder}/${publicId}` : publicId;
    }
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Delete image from Cloudinary
export const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return;
    }
    
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      await cloudinary.v2.uploader.destroy(publicId);
      console.log(`Deleted image with public ID: ${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};