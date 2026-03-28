import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { experienceSchema, experienceSchemaBase } from '@/validations/admin';
import type { ApiResponse, Experience } from '@/types/index';

async function requireAuth(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<never>>({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(): Promise<NextResponse> {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const experience = await prisma.experience.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json<ApiResponse<Experience[]>>({ data: experience }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/admin/experience]', err);
    return NextResponse.json<ApiResponse<never>>({ error: 'Failed to fetch experience entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authError = await requireAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = experienceSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json<ApiResponse<never>>(
      { error: 'Validation failed', code: JSON.stringify(result.error.flatten().fieldErrors) },
      { status: 400 }
    );
  }

  const { startDate, endDate, isPresent, ...rest } = result.data;

  try {
    const created = await prisma.experience.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: isPresent ? null : endDate ? new Date(endDate) : null,
        isPresent,
      },
    });
    return NextResponse.json<ApiResponse<Experience>>({ data: created }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/experience]', err);
    return NextResponse.json<ApiResponse<never>>({ error: 'Failed to create experience entry' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const authError = await requireAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Bulk sort order update: [{ id: string, sortOrder: number }]
  if (Array.isArray(body)) {
    const items = body as { id?: unknown; sortOrder?: unknown }[];
    for (const item of items) {
      if (typeof item.id !== 'string' || typeof item.sortOrder !== 'number') {
        return NextResponse.json<ApiResponse<never>>(
          { error: 'Each bulk sort item must have id (string) and sortOrder (number)' },
          { status: 400 }
        );
      }
    }

    const typedItems = items as { id: string; sortOrder: number }[];
    const ids = typedItems.map((i) => i.id);

    try {
      const existing = await prisma.experience.findMany({ where: { id: { in: ids } }, select: { id: true } });
      const existingIds = new Set(existing.map((e) => e.id));
      const missing = ids.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        return NextResponse.json<ApiResponse<never>>(
          { error: `Experience entries not found: ${missing.join(', ')}` },
          { status: 404 }
        );
      }

      await prisma.$transaction(
        typedItems.map((item) =>
          prisma.experience.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
        )
      );

      return NextResponse.json<ApiResponse<{ updated: true }>>({ data: { updated: true } }, { status: 200 });
    } catch (err) {
      console.error('[PATCH /api/admin/experience bulk]', err);
      return NextResponse.json<ApiResponse<never>>({ error: 'Failed to update sort order' }, { status: 500 });
    }
  }

  // Individual update: { id: string, ...partial fields }
  const record = body as Record<string, unknown>;
  const { id, ...fields } = record;

  if (typeof id !== 'string') {
    return NextResponse.json<ApiResponse<never>>({ error: 'id is required for individual update' }, { status: 400 });
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json<ApiResponse<never>>({ error: 'No fields provided for update' }, { status: 422 });
  }

  const partial = experienceSchemaBase.partial().safeParse(fields);
  if (!partial.success) {
    return NextResponse.json<ApiResponse<never>>(
      { error: 'Validation failed', code: JSON.stringify(partial.error.flatten().fieldErrors) },
      { status: 400 }
    );
  }

  const { startDate, endDate, isPresent, ...restFields } = partial.data;

  const updateData: Record<string, unknown> = { ...restFields };
  if (startDate !== undefined) updateData['startDate'] = new Date(startDate);
  if (isPresent !== undefined) {
    updateData['isPresent'] = isPresent;
    if (isPresent) {
      updateData['endDate'] = null;
    } else if (endDate) {
      updateData['endDate'] = new Date(endDate);
    }
  } else if (endDate !== undefined) {
    updateData['endDate'] = new Date(endDate);
  }

  try {
    const updated = await prisma.experience.update({ where: { id }, data: updateData });
    return NextResponse.json<ApiResponse<Experience>>({ data: updated }, { status: 200 });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json<ApiResponse<never>>({ error: 'Experience entry not found' }, { status: 404 });
    }
    console.error('[PATCH /api/admin/experience]', err);
    return NextResponse.json<ApiResponse<never>>({ error: 'Failed to update experience entry' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const authError = await requireAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { id } = body as { id?: unknown };
  if (typeof id !== 'string') {
    return NextResponse.json<ApiResponse<never>>({ error: 'id is required' }, { status: 400 });
  }

  try {
    await prisma.experience.delete({ where: { id } });
    return NextResponse.json<ApiResponse<{ deleted: true }>>({ data: { deleted: true } }, { status: 200 });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json<ApiResponse<never>>({ error: 'Experience entry not found' }, { status: 404 });
    }
    console.error('[DELETE /api/admin/experience]', err);
    return NextResponse.json<ApiResponse<never>>({ error: 'Failed to delete experience entry' }, { status: 500 });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({}, { status: 405, headers: { Allow: 'GET, POST, PATCH, DELETE' } });
}