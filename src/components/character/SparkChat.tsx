'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '@/types/index';

type SparkChatProps = {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  inputValue: string;
  onClose: () => void;
  onSend: (content: string) => Promise<void>;
  onInputChange: (value: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  error: string | null;
};

const SparkAvatar: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="10" fill="var(--char-skin-base)" />
    <rect x="5.5" y="6" width="3" height="3" fill="var(--char-hair)" />
    <rect x="11.5" y="6" width="3" height="3" fill="var(--char-hair)" />
  </svg>
);

const UserAvatar: React.FC = () => (
  <div
    aria-hidden="true"
    style={{
      width: 20,
      height: 20,
      backgroundColor: 'var(--color-text-tertiary)',
      borderRadius: '50%',
      opacity: 0.6,
    }}
  />
);

export const SparkChat: React.FC<SparkChatProps> = ({
  isOpen,
  messages,
  isLoading,
  inputValue,
  onClose,
  onSend,
  onInputChange,
  messagesEndRef,
  error,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Adjust panel bottom padding when mobile keyboard opens
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const newKeyboardHeight = window.innerHeight - visualViewport.height;
        setKeyboardHeight(newKeyboardHeight > 0 ? newKeyboardHeight : 0);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  // Focus trap when panel is open
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusableElementsRef.current = Array.from(focusable);

    if (focusableElementsRef.current.length) {
      focusableElementsRef.current[0]?.focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const first = focusableElementsRef.current[0];
      const last =
        focusableElementsRef.current[focusableElementsRef.current.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  // Escape key closes panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      void onSend(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const computedHeight = `calc(45vh + ${keyboardHeight}px)`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-labelledby="spark-chat-title"
          aria-modal="true"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: computedHeight,
            zIndex: 100,
            backgroundColor: 'var(--color-bg-secondary)',
            borderTop: '1px solid var(--color-border-default)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >


          {/* Drag handle */}
          <div
            style={{
              width: 32,
              height: 3,
              backgroundColor: 'var(--color-border-default)',
              borderRadius: 2,
              margin: '10px auto 4px',
              flexShrink: 0,
            }}
          />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              borderBottom: '1px solid var(--color-border-subtle)',
              flexShrink: 0,
              backgroundColor: 'var(--color-bg-secondary)',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SparkAvatar />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                }}
              >
                Spark
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                powered by Groq
              </span>
              <button
                onClick={onClose}
                aria-label="Close chat"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  padding: '6px 14px',
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                close
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              minHeight: 0,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                {msg.role === 'assistant' && <SparkAvatar />}
                <div
                  style={{
                    maxWidth: '80%',
                    fontSize: 14,
                    lineHeight: 1.5,
                    color:
                      msg.role === 'assistant'
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-secondary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                  {msg.role === 'assistant' &&
                    isLoading &&
                    msg.id === messages[messages.length - 1]?.id &&
                    (msg.content === '' ? (
                      <span className="animate-pulse"> ...</span>
                    ) : (
                      <span className="animate-pulse"> █</span>
                    ))}
                </div>
                {msg.role === 'user' && <UserAvatar />}
              </div>
            ))}

            {error && (
              <div
                style={{
                  color: 'var(--color-danger)',
                  fontSize: 12,
                  textAlign: 'center',
                  marginTop: 8,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              padding: '12px 16px',
              background: 'var(--color-bg-secondary)',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              flexShrink: 0,
            }}
          >
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ask me anything"
              aria-label="Message input"
              rows={1}
              style={{
                flex: 1,
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                fontFamily: 'inherit',
                color: 'var(--color-text-primary)',
                resize: 'none',
                maxHeight: 120,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: !inputValue.trim() || isLoading ? 'default' : 'pointer',
                color:
                  !inputValue.trim() || isLoading
                    ? 'var(--color-text-tertiary)'
                    : 'var(--color-accent)',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Visually hidden title for accessibility */}
          <h2 id="spark-chat-title" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden' }}>
            Chat with Spark
          </h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
};