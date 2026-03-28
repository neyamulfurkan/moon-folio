import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ContactMessage, ApiResponse } from '@/types/index';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ContactMessage[]>>> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const messages = await prisma.contactMessage.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: messages }, { status: 200 });
  } catch (error) {
    console.error('[admin/messages GET] Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', code: 'FETCH_ERROR' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ContactMessage>>> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, isRead, isArchived } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Message ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const updateData: { isRead?: boolean; isArchived?: boolean } = {};
    if (typeof isRead === 'boolean') {
      updateData.isRead = isRead;
    }
    if (typeof isArchived === 'boolean') {
      updateData.isArchived = isArchived;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided', code: 'NO_FIELDS' },
        { status: 422 }
      );
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updatedMessage }, { status: 200 });
  } catch (error) {
    console.error('[admin/messages PATCH] Error updating message:', error);

    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Message not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update message', code: 'UPDATE_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(): Promise<NextResponse<ApiResponse<never>>> {
  return NextResponse.json(
    { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function POST(): Promise<NextResponse<ApiResponse<never>>> {
  return NextResponse.json(
    { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse<ApiResponse<never>>> {
  return NextResponse.json(
    { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}