import { cx } from '@emotion/css';
import { llm } from '@grafana/llm';
import { Drawer, DropzoneFile, FileDropzone, FileUpload, Icon, IconButton, TextArea, useStyles2 } from '@grafana/ui';
import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { scan, Subscription } from 'rxjs';

import { TEST_IDS } from '@/constants';
import { chatConfig, useChatMessages, useFileAttachments, useLlmService, useTextareaResize } from '@/hooks';
import { ChatMessage } from '@/types';

import { getStyles } from './ChatDrawer.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.drawerElement;

/**
 * Hook for drag'n'drop overlay
 */
export const useDropzoneOverlay = (setIsDropzoneVisible: (value: boolean) => void) => {
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDropzoneVisible(true);
    },
    [setIsDropzoneVisible]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDropzoneVisible(true);
    },
    [setIsDropzoneVisible]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDropzoneVisible(false);
    },
    [setIsDropzoneVisible]
  );

  return { handleDragEnter, handleDragOver, handleDragLeave };
};

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

  /**
   * Temperature for LLM (0-1)
   * 0 is most deterministic, 1 is most creative
   *
   * @type {number}
   */
  llmTemperature?: number;
}

/**
 * Chat Drawer component
 */
export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, initialPrompt, llmTemperature }) => {
  /**
   * Hooks
   */
  const styles = useStyles2(getStyles);
  const { messages, generateMessageId, addMessages, updateLastMessage } = useChatMessages();

  /**
   * Function to add error messages to chat
   */
  const addErrorMessage = useCallback(
    (errorText: string) => {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        sender: 'system',
        text: errorText,
        timestamp: new Date(),
        isStreaming: false,
        isError: true,
      };
      addMessages([errorMessage]);
    },
    [generateMessageId, addMessages]
  );

  const { attachedFiles, formatFileSize, handleFileAttachment, removeAttachedFile, clearAttachedFiles } =
    useFileAttachments(addErrorMessage);
  const { textareaRef, adjustTextareaHeight } = useTextareaResize();
  const { checkLlmStatus, prepareMessageContent, prepareChatHistory, handleLlmError } = useLlmService();

  /**
   * State
   */
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropzoneVisible, setIsDropzoneVisible] = useState(false);

  /**
   * Refs
   */
  const subscriptionRef = useRef<Subscription | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
   * Handles file removal from FileDropzone
   * @param file - DropzoneFile to remove
   */
  const onFileRemove = useCallback(
    (file: DropzoneFile) => {
      removeAttachedFile(file.id);
    },
    [removeAttachedFile]
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
    setIsDropzoneVisible(false);
    onClose();
  }, [onClose, clearAttachedFiles]);

  /**
   * Checks if the send button should be disabled
   */
  const isSendDisabled = (!inputValue.trim() && attachedFiles.length === 0) || isLoading;

  /**
   * Handles the main send message functionality
   */
  const handleSend = useCallback(async () => {
    /**
     * Check LLM status
     */
    const statusCheck = await checkLlmStatus();
    if (!statusCheck.canProceed) {
      const errorMessage = `LLM Service Error: ${statusCheck.error}\n\nHow to fix:\n• Check that LLM plugin is installed and enabled\n• Configure at least one model in Grafana LLM settings\n• Verify API keys are properly set\n• Restart Grafana if needed`;
      addErrorMessage(errorMessage);
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
      const stream = llm.streamChatCompletions({
        messages: [
          {
            role: 'system' as const,
            content:
              initialPrompt ||
              'You are a helpful Business AI integrated into Grafana dashboard. You can analyze text files, images, and documents that users attach.',
          },
          ...chatHistory,
          { role: 'user' as const, content: messageContent },
        ],
        temperature: llmTemperature || chatConfig.temperature,
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
        const errorMessage = `Request Timeout: The LLM service took too long to respond.\n\nHow to fix:\n• The LLM service might be overloaded\n• Try again in a few moments\n• Check your network connection\n• Contact your administrator if the problem persists`;
        addErrorMessage(errorMessage);
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
            const errorMessage = `LLM Error: ${handleLlmError(err)}\n\nHow to fix:\n• Check your LLM configuration\n• Verify API keys are valid\n• Try again in a few moments\n• Contact your administrator if the problem persists`;
            addErrorMessage(errorMessage);
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
      const errorMessage = `Connection Error: ${error instanceof Error ? error.message : String(error)}\n\nHow to fix:\n• Check your internet connection\n• Verify LLM service is running\n• Try again in a few moments\n• Contact your administrator if the problem persists`;
      addErrorMessage(errorMessage);
    }
  }, [
    checkLlmStatus,
    prepareMessageContent,
    inputValue,
    attachedFiles,
    formatFileSize,
    generateMessageId,
    addMessages,
    clearAttachedFiles,
    prepareChatHistory,
    messages,
    initialPrompt,
    updateLastMessage,
    handleLlmError,
    llmTemperature,
    addErrorMessage,
  ]);

  /**
   * Handles keyboard shortcuts in textarea
   * @param e - Keyboard event
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        if (e.ctrlKey || e.shiftKey) {
          return;
        } else {
          e.preventDefault();
          handleSend();
        }
      }
      if (e.key === 'Escape' && !isLoading) {
        setInputValue('');
        clearAttachedFiles();
        setIsDropzoneVisible(false);
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

  /**
   * Handles drag and drop events for the file dropzone overlay
   */
  const { handleDragEnter, handleDragOver, handleDragLeave } = useDropzoneOverlay(setIsDropzoneVisible);

  /**
   * Handles file drop from FileDropzone
   * @param acceptedFiles - Array of accepted files
   * @param handleFileAttachment - Function to handle file attachment
   * @param setIsDropzoneVisible - Function to set dropzone visibility
   */
  const handleDropFiles = (
    acceptedFiles: File[],
    handleFileAttachment: (files: DropzoneFile[]) => void,
    setIsDropzoneVisible: (value: boolean) => void
  ) => {
    const dropzoneFiles = acceptedFiles.map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      file,
      error: null,
    }));
    handleFileAttachment(dropzoneFiles);
    setIsDropzoneVisible(false);
  };

  /**
   * Handles file input upload
   * @param event - Form event from file input
   * @param handleFileAttachment - Function to handle file attachment
   */
  const handleFileInputUpload = (
    event: FormEvent<HTMLInputElement>,
    handleFileAttachment: (files: DropzoneFile[]) => void
  ) => {
    if (event.currentTarget.files && event.currentTarget.files.length > 0) {
      const dropzoneFiles = Array.from(event.currentTarget.files).map((file) => ({
        id: `file-${Date.now()}-${Math.random()}`,
        file,
        error: null,
      }));
      handleFileAttachment(dropzoneFiles);
      event.currentTarget.value = '';
    }
  };

  return (
    <>
      {isOpen && (
        <Drawer title="Business AI" onClose={cleanupAndClose} size="md">
          <div className={styles.container}>
            <div className={styles.messagesContainer}>
              {messages.length === 0 && (
                <div className={styles.emptyState} {...testIds.chatDrawerEmptyState.apply()}>
                  Start a conversation by typing a message or attaching files
                </div>
              )}

              {messages.map((message) =>
                message.text || (message.attachments && !!message.attachments.length) ? (
                  <div
                    key={message.id}
                    className={cx(
                      styles.messageRow,
                      message.sender === 'user' ? styles.messageRowUser : styles.messageRowAssistant
                    )}
                    {...testIds.message.apply(message.text)}
                  >
                    <div
                      className={cx(
                        styles.messageContent,
                        message.sender === 'user'
                          ? styles.messageContentUser
                          : message.sender === 'system' || message.isError
                            ? styles.messageContentError
                            : styles.messageContentAssistant
                      )}
                    >
                      <div className={styles.messageSender} {...testIds.messageSender.apply()}>
                        {message.sender === 'assistant'
                          ? 'Business AI'
                          : message.sender === 'system'
                            ? 'System'
                            : message.sender}
                      </div>
                      <div className={styles.messageText}>
                        {message.text}
                        {message.isStreaming && <span className={styles.pulsingDot} />}
                      </div>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className={styles.attachmentsContainer}>
                          {message.attachments.map((file) =>
                            file.name ? (
                              <div key={file.id} {...testIds.attachment.apply()}>
                                <div className={styles.fileDetails}>
                                  <span className={styles.fileTypeIcon}>
                                    {file.type.startsWith('image/') ? (
                                      <Icon name="gf-landscape" {...testIds.attachmentImageIcon.apply()} />
                                    ) : (
                                      <Icon name="file-alt" />
                                    )}
                                  </span>
                                  <span className={styles.fileName}>{file.name}</span>
                                  <span className={styles.fileSize}>({formatFileSize(file.size)})</span>
                                  {file.url && (
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      {...testIds.attachmentImage.apply(file.name)}
                                      className={styles.fileThumbnail}
                                    />
                                  )}
                                </div>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null
              )}
              <div ref={messagesEndRef} />
            </div>

            <div
              className={styles.inputPanel}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              {...testIds.inputPanel.apply()}
            >
              {isDropzoneVisible ? (
                <div className={styles.fileDropzoneOverlay} {...testIds.fileDropzoneOverlay.apply()}>
                  <FileDropzone
                    options={{
                      multiple: true,
                      onDrop: (acceptedFiles: File[]) => {
                        handleDropFiles(acceptedFiles, handleFileAttachment, setIsDropzoneVisible);
                      },
                    }}
                    onFileRemove={onFileRemove}
                  >
                    <div className={styles.dropzoneContent}>
                      <Icon name="upload" size="xl" />
                      <h6>Drop files here</h6>
                    </div>
                  </FileDropzone>
                </div>
              ) : (
                <>
                  {attachedFiles.length > 0 && (
                    <div className={styles.attachedFilesPreview} {...testIds.attachedFilesPreview.apply()}>
                      <div className={styles.attachedFilesTitle}>Attached files ({attachedFiles.length}):</div>
                      <div className={styles.attachedFilesList}>
                        {attachedFiles.map((file) =>
                          file.name ? (
                            <div key={file.id} className={styles.fileItem}>
                              <div className={styles.fileDetails}>
                                <span className={styles.fileTypeIcon}>
                                  {file.type.startsWith('image/') ? (
                                    <Icon name="gf-landscape" {...testIds.attachmentImageIcon.apply()} />
                                  ) : (
                                    <Icon name="file-alt" {...testIds.attachedFilesPreviewIcon.apply()} />
                                  )}
                                </span>
                                <span className={styles.fileName}>{file.name}</span>
                                <span className={styles.fileSize}>({formatFileSize(file.size)})</span>
                                {file.url && (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className={styles.fileThumbnail}
                                    {...testIds.attachmentImage.apply(file.name)}
                                  />
                                )}
                              </div>
                              <IconButton
                                name="times"
                                aria-label={`Remove ${file.name}`}
                                onClick={() => removeAttachedFile(file.id)}
                                size="sm"
                                variant="secondary"
                                className={styles.removeButton}
                                {...testIds.removeButton.apply()}
                              />
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                  <div className={styles.inputArea}>
                    <div className={styles.textareaContainer}>
                      <TextArea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message or drag files here..."
                        disabled={isLoading}
                        className={styles.textarea}
                        {...testIds.input.apply()}
                      />
                      <div className={styles.buttonsContainer}>
                        <FileUpload
                          accept=".jpg,.jpeg,.png,.gif,.webp,.txt,.pdf,.doc,.docx,.json,.csv"
                          onFileUpload={(event: FormEvent<HTMLInputElement>) => {
                            handleFileInputUpload(event, handleFileAttachment);
                          }}
                          className={styles.attachButton}
                        />
                        <IconButton
                          name={isLoading ? 'fa fa-spinner' : 'message'}
                          aria-label="Send message"
                          onClick={handleSend}
                          disabled={isSendDisabled}
                          className={styles.sendButton}
                          title="Send message"
                          {...testIds.sendButton.apply()}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
};
