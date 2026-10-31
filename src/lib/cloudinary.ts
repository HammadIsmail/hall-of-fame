import { v2 as cloudinary } from 'cloudinary';
import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // ignore
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbbk9wg2i',
  api_key: process.env.CLOUDINARY_API_KEY || '452747391118659',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'i60Gfi8O_B0XsjuknW2iZqNFqy8',
  secure: true,
});

export async function uploadImage(data: Buffer | string, folder = 'hall-of-fame'): Promise<string> {
  if (typeof data === 'string') {
    const res = await cloudinary.uploader.upload(data, {
      folder,
      resource_type: 'image',
    });
    return res.secure_url;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(data);
  });
}

export default cloudinary;

