import { groqClient, buildSystemPrompt } from '@/lib/groq';
import {
  CHAT_MODEL,
  CHAT_MAX_TOKENS,
  CHAT_TEMPERATURE,
  MAX_CHAT_MESSAGES,
} from '@/lib/constants';
import type { ChatMessage } from '@/types/index';

export const runtime = 'edge';

const ipRequestMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 30;

  const timestamps = ipRequestMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) return true;

  recent.push(now);
  ipRequestMap.set(ip, recent);
  return false;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function isValidMessage(msg: unknown): msg is Pick<ChatMessage, 'role' | 'content'> {
  if (typeof msg !== 'object' || msg === null) return false;
  const m = msg as Record<string, unknown>;
  return (
    (m['role'] === 'user' || m['role'] === 'assistant') &&
    typeof m['content'] === 'string' &&
    m['content'].length <= 500
  );
}

export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Try again in a minute.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !Array.isArray((body as Record<string, unknown>)['messages'])
  ) {
    return new Response(
      JSON.stringify({ error: 'Request must include a messages array.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const rawMessages = (body as Record<string, unknown>)['messages'] as unknown[];

  if (rawMessages.length > MAX_CHAT_MESSAGES) {
    return new Response(
      JSON.stringify({ error: `Maximum ${MAX_CHAT_MESSAGES} messages allowed.` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!rawMessages.every(isValidMessage)) {
    return new Response(
      JSON.stringify({
        error: 'Each message must have role ("user" or "assistant") and content (max 500 chars).',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const filteredMessages = rawMessages.map((m) => ({
    role: (m as Pick<ChatMessage, 'role' | 'content'>).role,
    content: (m as Pick<ChatMessage, 'role' | 'content'>).content,
  }));

  const groqMessages = [
    { role: 'system' as const, content: buildSystemPrompt() },
    ...filteredMessages,
  ];

  let groqStream: AsyncIterable<{ choices: Array<{ delta: { content?: string }; finish_reason?: string }> }>;

  try {
    groqStream = await groqClient.chat.completions.create({
      model: CHAT_MODEL,
      messages: groqMessages,
      stream: true,
      max_tokens: CHAT_MAX_TOKENS,
      temperature: CHAT_TEMPERATURE,
    }) as unknown as AsyncIterable<{ choices: Array<{ delta: { content?: string }; finish_reason?: string }> }>;
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    const isContentPolicy =
      message.toLowerCase().includes('content') &&
      message.toLowerCase().includes('policy');

    if (isContentPolicy) {
      return new Response("I can't answer that one.", {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of groqStream) {
          const content = chunk.choices[0]?.delta?.content ?? '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        const isContentPolicy =
          message.toLowerCase().includes('content') &&
          message.toLowerCase().includes('policy');

        if (isContentPolicy) {
          controller.enqueue(encoder.encode("I can't answer that one."));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    },
  });
}