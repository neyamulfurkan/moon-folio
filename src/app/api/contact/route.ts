import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContactNotification } from '@/lib/resend';
import { contactSchema } from '@/validations/contact';
import type { ApiResponse } from '@/types/index';

const ipSubmissions = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

const getClientIp = (request: NextRequest): string => {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
};

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const timestamps = ipSubmissions.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    return true;
  }

  recent.push(now);
  ipSubmissions.set(ip, recent);
  return false;
};

const parseBody = async (
  request: NextRequest
): Promise<Record<string, unknown> | null> => {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return (await request.json()) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const formData = await request.formData();
      return {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
      };
    } catch {
      return null;
    }
  }

  return null;
};

export const POST = async (request: NextRequest): Promise<NextResponse<ApiResponse<{ id: string; message: string }>>> => {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many signals — try again in a minute.', code: 'RATE_LIMITED' },
      { status: 429 }
    );
  }

  const body = await parseBody(request);

  if (body === null) {
    return NextResponse.json(
      { error: 'Invalid or empty request body.', code: 'BAD_REQUEST' },
      { status: 400 }
    );
  }

  const validation = contactSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        code: 'VALIDATION_ERROR',
        details: validation.error.flatten().fieldErrors as Record<string, string[]>,
      },
      { status: 400 }
    );
  }

  const { name, email, message } = validation.data;

  let savedMessage: { id: string };

  try {
    savedMessage = await prisma.contactMessage.create({
      data: { name, email, message },
      select: { id: true },
    });
  } catch (err) {
    console.error('[contact/route] DB error saving contact message:', err);
    return NextResponse.json(
      { error: 'Failed to save your message. Please try again.', code: 'DB_ERROR' },
      { status: 500 }
    );
  }

  const emailResult = await sendContactNotification({ name, email, message });

  if (!emailResult.success) {
    console.warn('[contact/route] Email notification failed (non-fatal):', emailResult.error);
  }

  return NextResponse.json(
    { data: { id: savedMessage.id, message: 'Message received' } },
    { status: 201 }
  );
};

export const GET = (): NextResponse => {
  return NextResponse.json({ error: 'Method not allowed.', code: 'METHOD_NOT_ALLOWED' }, { status: 405 });
};