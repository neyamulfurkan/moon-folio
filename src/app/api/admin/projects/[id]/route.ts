import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { projectUpdateSchema } from '@/validations/project';
import type { ApiResponse, Project } from '@/types/index';

type RouteContext = { params: { id: string } };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<Project>>> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ data: project }, { status: 200 });
  } catch (err) {
    console.error('[admin/projects/[id] GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<Project>>> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: JSON.stringify(parsed.error.flatten().fieldErrors) },
      { status: 400 }
    );
  }

  const validated = parsed.data;

  if (Object.keys(validated).length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 422 });
  }

  try {
    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (validated.slug !== undefined && validated.slug !== existing.slug) {
      const conflict = await prisma.project.findFirst({
        where: { slug: validated.slug, id: { not: params.id } },
      });
      if (conflict) {
        return NextResponse.json(
          { error: 'A project with this slug already exists', code: 'SLUG_CONFLICT' },
          { status: 409 }
        );
      }
    }

    const updatePayload = Object.fromEntries(
      Object.entries(validated).filter(([, v]) => v !== undefined)
    );
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: updatePayload,
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    console.error('[admin/projects/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await prisma.project.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { deleted: true } }, { status: 200 });
  } catch (err) {
    console.error('[admin/projects/[id] DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}