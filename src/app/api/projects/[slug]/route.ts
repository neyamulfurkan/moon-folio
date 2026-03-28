import { prisma } from '@/lib/prisma';
import type { ApiResponse, Project } from '@/types/index';
import type { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
): Promise<Response> {
  try {
    const project = await prisma.project.findFirst({
      where: { slug: params.slug, published: true },
    });

    if (!project) {
      const body: ApiResponse<never> = { error: 'Project not found' };
      return Response.json(body, { status: 404 });
    }

    const body: ApiResponse<Project> = { data: project };
    return Response.json(body, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('[api/projects/[slug]] GET error:', err);
    const body: ApiResponse<never> = { error: 'Internal server error' };
    return Response.json(body, { status: 500 });
  }
}

export function POST(): Response {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export function PUT(): Response {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export function PATCH(): Response {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export function DELETE(): Response {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}