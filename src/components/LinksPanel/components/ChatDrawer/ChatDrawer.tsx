import { cx } from '@emotion/css';
import { openai } from '@grafana/llm';
import { Drawer, IconButton, useStyles2 } from '@grafana/ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { scan, Subscription } from 'rxjs';

import { chatConfig, useChatMessages, useFileAttachments, useLlmService, useTextareaResize } from '@/hooks';
import { ChatMessage } from '@/types';

import { getStyles } from './ChatDrawer.styles';

/**
 * Properties for the ChatDrawer component
 */
interface ChatDrawerProps {
  /**
   * Whether the drawer is currently open
   *
   * @type {boolean}
   */
  isOpen: boolean;

  /**
   * Callback function when drawer is closed
   *
   */
  onClose: () => void;

  /**
   * Whether the drawer is currently open
   *
   * @type {string}
   */
  initialPrompt?: string;
}

/**
 * Chat Drawer component
 */
export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, initialPrompt }) => {
  /**
   * Hooks
   */
  const styles = useStyles2(getStyles);
  const { messages, generateMessageId, addMessages, updateLastMessage } = useChatMessages();
  const { attachedFiles, formatFileSize, handleFileAttachment, removeAttachedFile, clearAttachedFiles } =
    useFileAttachments();
  const { textareaRef, adjustTextareaHeight } = useTextareaResize();
  const { checkLlmStatus, prepareMessageContent, prepareChatHistory, handleLlmError } = useLlmService();

  /**
   * State
   */
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Refs
   */
  const subscriptionRef = useRef<Subscription | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles input change with auto-resize functionality
   * @param e - Change event from textarea
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      setTimeout(adjustTextareaHeight, 0);
    },
    [adjustTextareaHeight]
  );

  /**
   * Scrolls to the bottom of the messages container
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /**
   * Handles file input change event
   * @param event - File input change event
   */
  const onFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFileAttachment(event.target.files);
      event.target.value = '';
    },
    [handleFileAttachment]
  );

  /**
   * Cleans up subscription and resets component state
   */
  const cleanupAndClose = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    setIsLoading(false);
    clearAttachedFiles();
    setInputValue('');
    onClose();
  }, [onClose, clearAttachedFiles]);

  /**
   * Handles the main send message functionality
   */
  const handleSend = useCallback(async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading) {
      return;
    }

    /**
     * Check LLM status
     */
    const statusCheck = await checkLlmStatus();
    if (!statusCheck.canProceed) {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        sender: 'assistant',
        text: `LLM Error: ${statusCheck.error}\n\nPlease check:\n1. LLM plugin is installed and enabled\n2. At least one model is configured\n3. API keys are properly set`,
        timestamp: new Date(),
        isStreaming: false,
      };
      addMessages([errorMessage]);
      return;
    }

    /**
     * Prepare messages
     */
    const messageContent = prepareMessageContent(inputValue.trim(), attachedFiles, formatFileSize);
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date(),
      attachments: [...attachedFiles],
    };
    const assistantMessage: ChatMessage = {
      id: generateMessageId(),
      sender: 'assistant',
      text: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    /**
     * Update UI
     */
    addMessages([userMessage, assistantMessage]);
    setInputValue('');
    clearAttachedFiles();
    setIsLoading(true);

    /**
     * Clean up previous subscription
     */
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    try {
      /**
       * Prepare chat history
       */
      const chatHistory = prepareChatHistory(messages, prepareMessageContent, formatFileSize);

      /**
       * Create stream
       */
      const stream = openai.streamChatCompletions({
        messages: [
          {
            role: 'system' as const,
            content:
              initialPrompt ||
              'You are a helpful assistant integrated into Grafana dashboard. You can analyze text files, images, and documents that users attach.',
          },
          ...chatHistory,
          { role: 'user' as const, content: messageContent },
        ],
        temperature: chatConfig.temperature,
      });

      /**
       * Set timeout
       */
      const timeoutId = setTimeout(() => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
        setIsLoading(false);
        updateLastMessage((msg) => ({
          ...msg,
          text: 'Request timeout. The LLM service might be overloaded or misconfigured.',
          isStreaming: false,
        }));
      }, chatConfig.requestTimeout);

      /**
       * Subscribe to stream
       */
      subscriptionRef.current = stream
        .pipe(
          scan((acc, chunk) => {
            let delta = '';

            if (typeof chunk === 'string') {
              delta = chunk;
            } else if (chunk && typeof chunk === 'object') {
              /**
               * Handle different response formats
               */
              if ('choices' in chunk && Array.isArray(chunk.choices) && chunk.choices.length > 0) {
                const choice = chunk.choices[0];
                if ('delta' in choice && choice.delta) {
                  const deltaObj = choice.delta;
                  if ('content' in deltaObj && typeof deltaObj.content === 'string') {
                    delta = deltaObj.content;
                  } else if ('text' in deltaObj && typeof deltaObj.text === 'string') {
                    delta = deltaObj.text;
                  }
                }
              } else if ('content' in chunk && typeof chunk.content === 'string') {
                delta = chunk.content;
              } else if ('text' in chunk && typeof chunk.text === 'string') {
                delta = chunk.text;
              }
            }

            return acc + delta;
          }, '')
        )
        .subscribe({
          next: (fullText) => {
            clearTimeout(timeoutId);
            updateLastMessage((msg) => ({
              ...msg,
              text: fullText || 'Receiving response...',
            }));
          },
          error: (err) => {
            clearTimeout(timeoutId);
            setIsLoading(false);
            const errorMessage = handleLlmError(err);
            updateLastMessage((msg) => ({
              ...msg,
              text: errorMessage,
              isStreaming: false,
            }));
          },
          complete: () => {
            clearTimeout(timeoutId);
            setIsLoading(false);
            updateLastMessage((msg) => ({
              ...msg,
              isStreaming: false,
            }));
          },
        });
    } catch (error) {
      setIsLoading(false);
      updateLastMessage((msg) => ({
        ...msg,
        text: `Connection Error: ${error instanceof Error ? error.message : 'Failed to connect to LLM service'}`,
        isStreaming: false,
      }));
    }
  }, [
    inputValue,
    attachedFiles,
    isLoading,
    messages,
    initialPrompt,
    checkLlmStatus,
    generateMessageId,
    addMessages,
    updateLastMessage,
    prepareMessageContent,
    formatFileSize,
    clearAttachedFiles,
    prepareChatHistory,
    handleLlmError,
  ]);

  /**
   * Handles keyboard shortcuts in textarea
   * @param e - Keyboard event
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
      if (e.key === 'Escape' && !isLoading) {
        setInputValue('');
        clearAttachedFiles();
      }
    },
    [handleSend, isLoading, clearAttachedFiles]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  return (
    <>
      {isOpen && (
        <Drawer title="Business AI" onClose={cleanupAndClose} size="md">
          <div className={styles.container}>
            <div className={styles.messagesContainer}>
              {messages.length === 0 && (
                <div className={styles.emptyState}>Start a conversation by typing a message or attaching files</div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cx(
                    styles.messageRow,
                    message.sender === 'user' ? styles.messageRowUser : styles.messageRowAssistant
                  )}
                >
                  <div
                    className={cx(
                      styles.messageContent,
                      message.sender === 'user' ? styles.messageContentUser : styles.messageContentAssistant
                    )}
                  >
                    <div className={styles.messageSender}>{message.sender}</div>
                    <div className={styles.messageText}>
                      {message.text}
                      {message.isStreaming && <span className={styles.pulsingDot} />}
                    </div>

                    {message.attachments && message.attachments.length > 0 && (
                      <div className={styles.attachmentsContainer}>
                        {message.attachments.map((file) => (
                          <div key={file.id} className={styles.attachmentItem}>
                            <span>📎</span>
                            <span>{file.name}</span>
                            <span>({formatFileSize(file.size)})</span>
                            {file.url && <img src={file.url} alt={file.name} className={styles.attachmentImage} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputPanel}>
              {attachedFiles.length > 0 && (
                <div className={styles.attachedFilesPreview}>
                  <div className={styles.attachedFilesTitle}>Attached files ({attachedFiles.length}):</div>
                  <div className={styles.attachedFilesList}>
                    {attachedFiles.map((file) => (
                      <div key={file.id} className={styles.fileItem}>
                        <div className={styles.fileDetails}>
                          <span className={styles.fileTypeIcon}>{file.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                          <span className={styles.fileName}>{file.name}</span>
                          <span className={styles.fileSize}>({formatFileSize(file.size)})</span>
                          {file.url && <img src={file.url} alt={file.name} className={styles.fileThumbnail} />}
                        </div>
                        <IconButton
                          name="times"
                          aria-label={`Remove ${file.name}`}
                          onClick={() => removeAttachedFile(file.id)}
                          size="sm"
                          variant="secondary"
                          className={styles.removeButton}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.inputArea}>
                <div className={styles.textareaContainer}>
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className={styles.textarea}
                  />

                  <div className={styles.buttonsContainer}>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className={styles.attachButton}
                      title="Attach files (images, documents, text files)"
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                      </svg>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.txt,.pdf,.doc,.docx,.json,.csv"
                      onChange={onFileInputChange}
                      style={{ display: 'none' }}
                    />

                    <button
                      onClick={handleSend}
                      disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
                      className={styles.sendButton}
                      title="Send message (Ctrl+Enter)"
                      type="button"
                    >
                      {isLoading ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={styles.loadingSpinner}
                        >
                          <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                          <path d="M12 2a10 10 0 0 1 10 10"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
};
