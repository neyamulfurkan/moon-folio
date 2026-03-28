import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { skillSchema } from '@/validations/admin';
import type { Skill } from '@/types/index';

type BulkSortItem = { id: string; sortOrder: number };

function isBulkSortArray(body: unknown): body is BulkSortItem[] {
  return (
    Array.isArray(body) &&
    body.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>)['id'] === 'string' &&
        typeof (item as Record<string, unknown>)['sortOrder'] === 'number'
    )
  );
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const skills: Skill[] = await prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
    return NextResponse.json({ data: skills }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/admin/skills]', err);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  const parsed = skillSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const createdSkill: Skill = await prisma.skill.create({ data: parsed.data });
    return NextResponse.json({ data: createdSkill }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/skills]', err);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
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

  // Bulk sort order update
  if (isBulkSortArray(body)) {
    if (body.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const ids = body.map((item) => item.id);

    let existingCount: number;
    try {
      existingCount = await prisma.skill.count({ where: { id: { in: ids } } });
    } catch (err) {
      console.error('[PATCH /api/admin/skills bulk — count check]', err);
      return NextResponse.json({ error: 'Failed to verify skill IDs' }, { status: 500 });
    }

    if (existingCount !== ids.length) {
      return NextResponse.json(
        { error: 'One or more skill IDs do not exist', code: 'INVALID_IDS' },
        { status: 400 }
      );
    }

    try {
      await prisma.$transaction(
        body.map((item) =>
          prisma.skill.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );
      return NextResponse.json({ data: { updated: body.length } }, { status: 200 });
    } catch (err) {
      console.error('[PATCH /api/admin/skills bulk — transaction]', err);
      return NextResponse.json({ error: 'Failed to update sort order' }, { status: 500 });
    }
  }

  // Single skill update
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const id = record['id'];

  if (typeof id !== 'string' || id.trim() === '') {
    return NextResponse.json({ error: 'Missing or invalid skill id' }, { status: 400 });
  }

  const { id: _id, ...rest } = record;
  void _id;

  const parsed = skillSchema.partial().safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'No fields provided to update' }, { status: 422 });
  }

  try {
    const updatePayload = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined)
    );
    const updatedSkill: Skill = await prisma.skill.update({
      where: { id },
      data: updatePayload,
    });
    return NextResponse.json({ data: updatedSkill }, { status: 200 });
  } catch (err) {
    const isNotFound =
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025';

    if (isNotFound) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    console.error('[PATCH /api/admin/skills single]', err);
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({}, { status: 405 });
}