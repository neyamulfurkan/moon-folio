import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: process.env.CLOUDINARY_API_KEY ?? '',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
  secure: true,
});

export type CloudinaryTransformOptions = {
  width?: number;
  height?: number;
  crop?: string;
  format?: 'auto' | 'avif' | 'webp' | 'jpg';
  quality?: 'auto' | number;
};

/**
 * Builds a Cloudinary transformation URL without an SDK call.
 * Uses URL-based transformation API for zero latency.
 */
export const getCloudinaryUrl = (
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME environment variable is not set');
  }

  const parts: string[] = [];

  if (options.width !== undefined) parts.push(`w_${options.width}`);
  if (options.height !== undefined) parts.push(`h_${options.height}`);
  if (options.crop !== undefined) parts.push(`c_${options.crop}`);
  parts.push(`f_${options.format ?? 'auto'}`);
  parts.push(`q_${options.quality ?? 'auto'}`);

  const transforms = parts.join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
};

/**
 * Generates signed upload parameters for direct client-to-Cloudinary uploads.
 * Must be called server-side — never expose CLOUDINARY_API_SECRET to the client.
 */
export const generateSignedUploadParams = (
  folder: string
): { signature: string; timestamp: number; apiKey: string; cloudName: string } => {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error(
      'Missing Cloudinary environment variables: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, or CLOUDINARY_CLOUD_NAME'
    );
  }

  // Timestamp must be within last 1 hour or Cloudinary rejects the signed upload
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
  };
};

export { cloudinary };