import { prisma } from '@/lib/prisma';
import type { ProjectSummary, ApiResponse } from '@/types/index';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse<ApiResponse<ProjectSummary[]>>> {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDesc: true,
        thumbnailUrl: true,
        techStack: true,
        featured: true,
        category: true,
      },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json(
      { data: projects },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/projects]', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(): Promise<NextResponse<ApiResponse<never>>> {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT(): Promise<NextResponse<ApiResponse<never>>> {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PATCH(): Promise<NextResponse<ApiResponse<never>>> {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE(): Promise<NextResponse<ApiResponse<never>>> {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}