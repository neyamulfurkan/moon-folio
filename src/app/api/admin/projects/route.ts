import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/validations/project';
import { slugify } from '@/lib/utils';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ data: projects }, { status: 200 });
  } catch (error) {
    console.error('[admin/projects GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Auto-generate slug from title if not provided or empty
  let baseSlug = data.slug && data.slug.trim().length > 0
    ? data.slug.trim()
    : slugify(data.title);

  // Enforce slug uniqueness with up to 10 attempts
  let candidateSlug = baseSlug;
  let attempt = 1;
  let slugIsUnique = false;

  while (attempt <= 10) {
    const existing = await prisma.project.findFirst({ where: { slug: candidateSlug } });
    if (!existing) {
      slugIsUnique = true;
      break;
    }
    attempt += 1;
    candidateSlug = `${baseSlug}-${attempt}`;
  }

  if (!slugIsUnique) {
    return NextResponse.json(
      { error: 'Could not generate a unique slug after 10 attempts. Please provide a different title or slug.', code: 'SLUG_CONFLICT' },
      { status: 409 }
    );
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...data,
        slug: candidateSlug,
        thumbnailUrl: data.thumbnailUrl ?? null,
        galleryUrls: data.galleryUrls ?? [],
        liveUrl: data.liveUrl ?? null,
        githubUrl: data.githubUrl ?? null,
        challenge: data.challenge ?? null,
        solution: data.solution ?? null,
      },
    });
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error('[admin/projects POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}