import { cx } from '@emotion/css';
import {
  Drawer,
  DropzoneFile,
  FileDropzone,
  FileUpload,
  Icon,
  IconButton,
  Spinner,
  TextArea,
  useStyles2,
} from '@grafana/ui';
import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { TEST_IDS } from '@/constants';
import {
  useChatMessages,
  useFileAttachments,
  useLlmService,
  useMcpLlmIntegration,
  useMcpService,
  useTextareaResize,
} from '@/hooks';
import { ChatMessage, LlmMessage, LlmRole, McpServerConfig, McpTool } from '@/types';
import { createToolResultHandler, generateMessageId, getSenderDisplayName } from '@/utils';

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
   * Initial context prompt for Business AI
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

  /**
   * Custom assistant name for Business AI
   *
   * @type {string}
   */
  assistantName?: string;

  /**
   * Use default Grafana MCP server
   *
   * @type {boolean}
   */
  useDefaultGrafanaMcp?: boolean;

  /**
   * MCP Servers configuration
   *
   * @type {McpServerConfig[]}
   */
  mcpServers?: McpServerConfig[];

  /**
   * Show Spinner instead raw tool message
   *
   * @type {boolean}
   */
  showLoadingForRawMessage?: boolean;
}

/**
 * Chat Drawer component
 */
export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  assistantName,
  useDefaultGrafanaMcp,
  mcpServers,
  showLoadingForRawMessage,
}) => {
  /**
   * State
   */
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropzoneVisible, setIsDropzoneVisible] = useState(false);
  const [availableTools, setAvailableTools] = useState<McpTool[]>([]);
  const [mcpEnabled, setMcpEnabled] = useState(false);

  /**
   * Hooks
   */
  const styles = useStyles2(getStyles);
  const { messages, addMessages, updateLastMessage } = useChatMessages();

  /**
   * Function to add error messages to chat
   */
  const addErrorMessage = useCallback(
    (errorText: string) => {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        sender: LlmRole.SYSTEM,
        text: errorText,
        timestamp: new Date(),
        isStreaming: false,
        isError: true,
      };
      addMessages([errorMessage]);
    },
    [addMessages]
  );

  const { attachedFiles, formatFileSize, handleFileAttachment, removeAttachedFile, clearAttachedFiles } =
    useFileAttachments(addErrorMessage);
  const { textareaRef, adjustTextareaHeight } = useTextareaResize();
  const { prepareMessageContent, prepareChatHistory } = useLlmService();
  const { checkMcpStatus, getAvailableTools } = useMcpService(addErrorMessage);
  const { sendMessageWithTools, checkAvailability } = useMcpLlmIntegration(addErrorMessage);

  /**
   * Refs
   */
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
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
   * Custom assistant name, defaults to 'Business AI'
   */
  const customAssistantName = assistantName || 'Business AI';

  /**
   * Initialize MCP tools
   */
  const initializeMcpTools = useCallback(async () => {
    try {
      const shouldUseDefaultGrafanaMcp = useDefaultGrafanaMcp ?? false;

      const mcpStatus = await checkMcpStatus();
      if (mcpStatus.isAvailable) {
        const tools = await getAvailableTools(mcpServers, shouldUseDefaultGrafanaMcp);

        setAvailableTools(tools);
        setMcpEnabled(true);
      } else {
        addErrorMessage(`MCP not available: ${mcpStatus.error}`);
        setMcpEnabled(false);
      }
    } catch (error) {
      addErrorMessage(`Failed to initialize MCP tools: ${error instanceof Error ? error.message : String(error)}`);
      setMcpEnabled(false);
    }
  }, [checkMcpStatus, getAvailableTools, mcpServers, useDefaultGrafanaMcp, addErrorMessage]);

  /**
   * Handles the main send message functionality with MCP support
   */
  const handleSend = useCallback(async () => {
    /**
     * Check LLM and MCP availability
     */
    const availability = await checkAvailability();
    if (!availability.isAvailable) {
      const errorMessage = `Service Error: ${availability.error}\n\nHow to fix:\n• Check that LLM plugin is installed and enabled\n• Configure at least one model in Grafana LLM settings\n• Verify API keys are properly set\n• Ensure MCP service is enabled\n• Restart Grafana if needed`;
      addErrorMessage(errorMessage);
      return;
    }

    /**
     * Prepare messages
     */
    const messageContent = prepareMessageContent(inputValue.trim(), attachedFiles, formatFileSize);
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      sender: LlmRole.USER,
      text: inputValue.trim(),
      timestamp: new Date(),
      attachments: [...attachedFiles],
    };

    /**
     * Create a loading message instead of empty assistant message
     */
    const loadingMessage: ChatMessage = {
      id: generateMessageId(),
      sender: LlmRole.ASSISTANT,
      text: '',
      timestamp: new Date(),
      /**
       * Use isStreaming to indicate loading state
       */
      isStreaming: true,
    };

    /**
     * Update UI
     */
    addMessages([userMessage, loadingMessage]);
    setInputValue('');
    clearAttachedFiles();
    setIsLoading(true);

    try {
      /**
       * Prepare chat history for MCP
       */
      const chatHistory = prepareChatHistory(messages, prepareMessageContent, formatFileSize);

      /**
       * Convert to LlmMessage format
       */
      const llmMessages: LlmMessage[] = [
        {
          role: LlmRole.SYSTEM,
          content:
            initialPrompt ||
            `You are a helpful ${customAssistantName} integrated into Grafana dashboard. You can analyze text files, images, and documents that users attach.${
              mcpEnabled && availableTools?.length > 0
                ? ` You also have access to ${availableTools?.length} MCP tools that you can use to gather real-time information about the system. Use these tools when appropriate to provide more accurate and up-to-date information.`
                : ''
            }`,
        },
        ...chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: LlmRole.USER, content: messageContent },
      ];

      /**
       * Create onToolResult with utils helper
       */
      const onToolResult = createToolResultHandler(addMessages);

      /**
       * Send message with MCP tools support
       */
      const response = await sendMessageWithTools(
        llmMessages,
        onToolResult,
        mcpServers,
        useDefaultGrafanaMcp ?? false,
        showLoadingForRawMessage
      );

      /**
       * Update assistant message with response
       */
      updateLastMessage((msg) => ({
        ...msg,
        text: response,
        isStreaming: false,
        isTemporaryAnswer: false,
      }));

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      const errorMessage = `Connection Error: ${error instanceof Error ? error.message : String(error)}\n\nHow to fix:\n• Check your internet connection\n• Verify LLM service is running\n• Try again in a few moments\n• Contact your administrator if the problem persists`;
      addErrorMessage(errorMessage);
    }
  }, [
    checkAvailability,
    prepareMessageContent,
    inputValue,
    attachedFiles,
    formatFileSize,
    addMessages,
    clearAttachedFiles,
    addErrorMessage,
    prepareChatHistory,
    messages,
    initialPrompt,
    customAssistantName,
    mcpEnabled,
    availableTools?.length,
    sendMessageWithTools,
    mcpServers,
    useDefaultGrafanaMcp,
    showLoadingForRawMessage,
    updateLastMessage,
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
    if (isOpen) {
      initializeMcpTools();
    }
  }, [isOpen, initializeMcpTools]);

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
        <Drawer title={customAssistantName} onClose={cleanupAndClose} size="md">
          <div className={styles.container}>
            <div className={styles.messagesContainer}>
              {messages.length === 0 && (
                <div className={styles.emptyState} {...testIds.chatDrawerEmptyState.apply()}>
                  <div>Start a conversation by typing a message or attaching files</div>
                  {mcpEnabled && availableTools?.length > 0 && (
                    <div className={styles.mcpToolsInfo} {...testIds.mcpToolsInfo.apply()}>
                      <Icon name="cog" style={{ marginRight: '4px' }} />
                      {availableTools?.length} MCP tool{availableTools?.length !== 1 ? 's' : ''} available
                    </div>
                  )}
                </div>
              )}

              {messages.map((message) =>
                message.text || (message.attachments && !!message.attachments.length) ? (
                  <div
                    key={message.id}
                    className={cx(
                      styles.messageRow,
                      message.sender === LlmRole.USER ? styles.messageRowUser : styles.messageRowAssistant
                    )}
                    {...testIds.message.apply(message.text)}
                  >
                    <div
                      className={cx(
                        styles.messageContent,
                        message.sender === LlmRole.USER
                          ? styles.messageContentUser
                          : message.sender === LlmRole.SYSTEM || message.isError
                            ? styles.messageContentError
                            : message.sender === LlmRole.TOOL
                              ? styles.messageContentTool
                              : styles.messageContentAssistant
                      )}
                    >
                      <div className={styles.messageSender} {...testIds.messageSender.apply(message.sender)}>
                        {getSenderDisplayName(message.sender, customAssistantName)}
                      </div>
                      {message.isTemporaryAnswer ? (
                        <div className={styles.loadingMessage} {...testIds.messageAwait.apply(message.id)}>
                          Answer ...
                          <Spinner size="md" style={{ marginLeft: '20px' }} />
                        </div>
                      ) : (
                        <div className={styles.messageText}>{message.text}</div>
                      )}
                      {message.isStreaming && (
                        <div className={styles.loadingContainer}>
                          <span className={styles.loadingDots}>
                            <span className={styles.loadingDot} />
                            <span className={styles.loadingDot} />
                            <span className={styles.loadingDot} />
                          </span>
                        </div>
                      )}

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
                    {...testIds.fileDropzone.apply()}
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
