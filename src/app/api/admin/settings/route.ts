import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { settingsSchema } from '@/validations/admin';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await prisma.siteSettings.findMany();
    const record = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error('[settings GET]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid settings data', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const validatedData = parsed.data;

  const upsertOperations = Object.entries(validatedData)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        create: { key, value: value as string },
        update: { value: value as string },
      })
    );

  try {
    await Promise.all(upsertOperations);
    return NextResponse.json({ data: { updated: true } });
  } catch (error) {
    console.error('[settings PATCH]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}