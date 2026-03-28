'use client';

import { useState, useRef, useCallback } from 'react';
import type { ChatMessage } from '@/types/index';
import { MAX_CHAT_MESSAGES, MIN_SEND_GAP_MS } from '@/lib/constants';
import { generateId } from '@/lib/utils';

export type UseSparkChatReturn = {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  inputValue: string;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  setInputValue: (value: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  error: string | null;
};

type UseSparkChatOptions = {
  onOpen?: () => void;
};

export const useSparkChat = (options: UseSparkChatOptions = {}): UseSparkChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageTimestamps = useRef<number[]>([]);
  const hasShownChat = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback((): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    const isInit = content === '__init__';

    if (!isInit) {
      // Rate limit check: ignore if a message was sent within the last MIN_SEND_GAP_MS
      const now = Date.now();
      const recent = messageTimestamps.current.filter(
        (ts) => now - ts < MIN_SEND_GAP_MS
      );
      if (recent.length > 0) return;

      if (messages.length >= MAX_CHAT_MESSAGES) {
        setError('Conversation limit reached — refresh to start over.');
        return;
      }
    }

    const userMessage: ChatMessage | null = isInit
      ? null
      : { role: 'user', content, id: generateId() };

    if (userMessage !== null) {
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
    }

    setIsLoading(true);
    setError(null);
    messageTimestamps.current = [...messageTimestamps.current, Date.now()];

    // Build conversation history (last 10 non-init messages)
    const currentMessages = userMessage !== null
      ? [...messages, userMessage]
      : messages;

    const conversationHistory = currentMessages
      .slice(-10)
      .map(({ role, content: c }) => ({ role, content: c }));

    // If init, send an empty user message to get the greeting
    const body = isInit
      ? { messages: [{ role: 'user' as const, content: 'Hello' }] }
      : { messages: conversationHistory };

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let response: Response;
    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setIsLoading(false);
        return;
      }
      setError('Signal lost — check your connection.');
      setIsLoading(false);
      return;
    }

    if (!response.ok) {
      setError('Signal lost — check your connection.');
      setIsLoading(false);
      return;
    }

    if (response.body === null) {
      setError('Signal lost — check your connection.');
      setIsLoading(false);
      return;
    }

    // Add empty assistant message to be filled by stream
    const assistantId = generateId();
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', id: assistantId },
    ]);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setIsLoading(false);
        return;
      }
      setError('I glitched for a second. Try again?');
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const openChat = useCallback((): void => {
    setIsOpen(true);
    options.onOpen?.();

    if (!hasShownChat.current) {
      hasShownChat.current = true;
      void sendMessage('__init__');
    }
  }, [options, sendMessage]);

  const closeChat = useCallback((): void => {
    setIsOpen(false);
  }, []);

  return {
    messages,
    isOpen,
    isLoading,
    inputValue,
    openChat,
    closeChat,
    sendMessage,
    setInputValue,
    messagesEndRef,
    error,
  };
};