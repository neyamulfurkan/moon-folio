import { auth } from '@/lib/auth';
import { generateSignedUploadParams } from '@/lib/cloudinary';

const ALLOWED_FOLDERS = ['projects', 'gallery', 'cv', 'profile'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const isAllowedFolder = (folder: string): folder is AllowedFolder =>
  (ALLOWED_FOLDERS as readonly string[]).includes(folder);

export const POST = async (request: Request): Promise<Response> => {
  const session = await auth();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('folder' in body) ||
    typeof (body as Record<string, unknown>).folder !== 'string'
  ) {
    return Response.json({ error: 'Missing required field: folder' }, { status: 400 });
  }

  const folder = (body as Record<string, string>).folder;

  if (!folder || !isAllowedFolder(folder)) {
    return Response.json({ error: 'Invalid folder' }, { status: 400 });
  }

  try {
    const params = generateSignedUploadParams(folder);
    if (!params.cloudName || !params.apiKey || !params.signature) {
      console.error('[upload] Cloudinary credentials incomplete — check CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME), CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in Vercel environment variables');
      return Response.json({ error: 'Cloudinary is not configured on the server. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your Vercel environment variables.' }, { status: 500 });
    }
    return Response.json({ data: { signature: params.signature, timestamp: params.timestamp, apiKey: params.apiKey, cloudName: params.cloudName, folder } }, { status: 200 });
  } catch (err) {
    console.error('[upload] Failed to generate signed upload params:', err);
    return Response.json({ error: err instanceof Error ? err.message : 'Failed to generate upload parameters' }, { status: 500 });
  }
};

export const GET = (): Response =>
  Response.json({ error: 'Method Not Allowed' }, { status: 405 });

export const PUT = (): Response =>
  Response.json({ error: 'Method Not Allowed' }, { status: 405 });

export const PATCH = (): Response =>
  Response.json({ error: 'Method Not Allowed' }, { status: 405 });

export const DELETE = (): Response =>
  Response.json({ error: 'Method Not Allowed' }, { status: 405 });