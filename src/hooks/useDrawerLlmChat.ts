import { formattedValueToString, getValueFormat } from '@grafana/data';
import { openai } from '@grafana/llm';
import { useCallback, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  AttachedFile,
  ChatMessage,
  LlmHealthCheck,
  LlmMessage,
  UseChatMessagesReturn,
  UseFileAttachmentsReturn,
  UseLlmServiceReturn,
  UseTextareaResizeReturn,
} from '@/types';

/**
 * Configuration constants for the chat drawer
 */
export const chatConfig = {
  maxFileSize: 10 * 1024 * 1024,
  maxTextAreaHeight: 200,
  minTextAreaHeight: 40,
  requestTimeout: 15000,
  temperature: 0.7,
} as const;

/**
 * Allowed file types for attachment
 */
const allowedFileTypes: string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/json',
  'text/csv',
] as const;

/**
 * Custom hook for managing chat messages
 *
 * Provides functionality for managing the chat message state including
 * adding messages, updating messages, and generating unique IDs.
 *
 * @returns Object with message management functions
 */
export const useChatMessages = (): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /**
   * Generates a unique message ID
   * @returns Unique message identifier
   */
  const generateMessageId = useCallback((): string => {
    return `msg-${uuidv4()}`;
  }, []);

  /**
   * Adds multiple messages to the chat
   * @param newMessages - Messages to add
   */
  const addMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  }, []);

  /**
   * Updates the last message in the chat
   * @param updater - Function to update the message
   */
  const updateLastMessage = useCallback((updater: (message: ChatMessage) => ChatMessage) => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const updated = [...prev];
      updated[updated.length - 1] = updater(updated[updated.length - 1]);
      return updated;
    });
  }, []);

  return {
    messages,
    setMessages,
    generateMessageId,
    addMessages,
    updateLastMessage,
  };
};

/**
 * Custom hook for managing file attachments
 *
 * Handles file upload, validation, formatting, and management.
 * Supports various file types including images, documents, and text files.
 *
 * @returns Object with file management functions
 */
export const useFileAttachments = (): UseFileAttachmentsReturn => {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  /**
   * Formats file size in human-readable format
   * @param fileSizeInBytes - File size in bytes
   * @returns Formatted file size string
   */
  const formatFileSize = useCallback((fileSizeInBytes: number): string => {
    return formattedValueToString(getValueFormat('decbytes')(fileSizeInBytes));
  }, []);

  /**
   * Validates if file type is allowed
   * @param fileType - MIME type of the file
   * @returns Whether the file type is allowed
   */
  const isFileTypeAllowed = useCallback((fileType: string): boolean => {
    return allowedFileTypes.includes(fileType);
  }, []);

  /**
   * Validates if file size is within limits
   * @param fileSize - Size of the file in bytes
   * @returns Whether the file size is acceptable
   */
  const isFileSizeValid = useCallback((fileSize: number): boolean => {
    return fileSize <= chatConfig.maxFileSize;
  }, []);

  /**
   * Processes and adds files to attachments
   * @param files - FileList from input element
   */
  const handleFileAttachment = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      Array.from(files).forEach((file) => {
        /**
         * Validate file size
         */
        if (!isFileSizeValid(file.size)) {
          alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(chatConfig.maxFileSize)}.`);
          return;
        }

        /**
         * Validate file type
         */
        if (!isFileTypeAllowed(file.type)) {
          alert(`File type ${file.type} is not supported.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const newFile: AttachedFile = {
            id: `file-${uuidv4()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content,
            url: file.type.startsWith('image/') ? content : undefined,
          };

          setAttachedFiles((prev) => [...prev, newFile]);
        };

        /**
         * Read file based on type
         */
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });
    },
    [isFileSizeValid, isFileTypeAllowed, formatFileSize]
  );

  /**
   * Removes a file from attachments
   * @param fileId - ID of the file to remove
   */
  const removeAttachedFile = useCallback((fileId: string) => {
    setAttachedFiles((prev) => prev.filter((fileItem) => fileItem.id !== fileId));
  }, []);

  /**
   * Clears all attached files
   */
  const clearAttachedFiles = useCallback(() => {
    setAttachedFiles([]);
  }, []);

  return {
    attachedFiles,
    formatFileSize,
    handleFileAttachment,
    removeAttachedFile,
    clearAttachedFiles,
  };
};

/**
 * Custom hook for managing textarea auto-resize functionality
 *
 * Provides automatic height adjustment for textarea based on content
 * with configurable minimum and maximum heights.
 *
 * @returns Object with textarea ref and resize function
 */
export const useTextareaResize = (): UseTextareaResizeReturn => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Adjusts textarea height based on content
   * Respects minimum and maximum height constraints
   */
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    const scrollHeight = Math.min(textarea.scrollHeight, chatConfig.maxTextAreaHeight);
    textarea.style.height = `${Math.max(scrollHeight, chatConfig.minTextAreaHeight)}px`;
  }, []);

  return { textareaRef, adjustTextareaHeight };
};

/**
 * Custom hook for LLM service integration
 *
 * Provides functionality for interacting with Grafana's LLM service,
 * including health checks, message preparation, and error handling.
 *
 * @returns Object with LLM service functions
 */
export const useLlmService = (): UseLlmServiceReturn => {
  /**
   * Checks if LLM service is available and properly configured
   * @returns Promise with health check result
   */
  const checkLlmStatus = useCallback(async (): Promise<LlmHealthCheck> => {
    try {
      if (!(await openai.enabled())) {
        return { canProceed: false, error: 'LLM is not enabled in Grafana settings' };
      }

      if (typeof openai.health !== 'function') {
        return { canProceed: true };
      }

      const health = await openai.health();

      if (!health.ok) {
        return {
          canProceed: false,
          error: health.error || 'LLM service is not properly configured',
        };
      }

      if (!health.models || Object.keys(health.models).length === 0) {
        return {
          canProceed: false,
          error: 'No LLM models are configured. Please configure at least one model in Grafana LLM settings.',
        };
      }

      return { canProceed: true };
    } catch (error) {
      return {
        canProceed: false,
        error: `LLM status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }, []);

  /**
   * Prepares message content including file attachments
   * @param text - User's text input
   * @param files - Attached files
   * @param formatFileSize - File size formatter function
   * @returns Formatted message content
   */
  const prepareMessageContent = useCallback(
    (text: string, files: AttachedFile[], formatFileSize: (bytes: number) => string): string => {
      let content = text;

      if (files.length > 0) {
        content += '\n\n**Attached files:**\n';
        files.forEach((file) => {
          content += `- ${file.name} (${formatFileSize(file.size)})\n`;

          if (file.type.startsWith('text/') || file.type === 'application/json') {
            content += `\`\`\`\n${file.content}\n\`\`\`\n`;
          } else if (file.type.startsWith('image/')) {
            content += `[Image: ${file.name}]\n`;
          }
        });
      }

      return content;
    },
    []
  );

  /**
   * Converts chat messages to LLM API format
   * @param messages - Chat messages
   * @param prepareContent - Content preparation function
   * @param formatFileSize - File size formatter function
   * @returns Array of LLM messages
   */
  const prepareChatHistory = useCallback(
    (
      messages: ChatMessage[],
      prepareContent: (text: string, files: AttachedFile[], formatFileSize: (bytes: number) => string) => string,
      formatFileSize: (bytes: number) => string
    ): LlmMessage[] => {
      return messages
        .filter((message) => !message.isStreaming)
        .map((messageItem) => ({
          role: messageItem.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content:
            messageItem.sender === 'user' && messageItem.attachments && messageItem.attachments.length > 0
              ? prepareContent(messageItem.text, messageItem.attachments, formatFileSize)
              : messageItem.text,
        }));
    },
    []
  );

  /**
   * Handles different types of LLM errors and returns user-friendly messages
   * @param error - Error object from LLM service
   * @returns User-friendly error message
   */
  const handleLlmError = useCallback((error: { message: string }): string => {
    if (!error.message) {
      return 'Sorry, an error occurred while processing your request.';
    }

    const message = error.message;

    if (message.includes('422')) {
      return 'Configuration Error: The LLM request format is invalid. Please check your Grafana LLM plugin configuration.';
    }

    if (message.includes('401') || message.includes('403')) {
      return 'Authentication Error: Please check your API keys in Grafana LLM settings.';
    }

    if (message.includes('429')) {
      return 'Rate Limit: Too many requests. Please wait a moment and try again.';
    }

    if (message.includes('500')) {
      return 'Server Error: The LLM service is experiencing issues.';
    }

    return `Error: ${message}`;
  }, []);

  return {
    checkLlmStatus,
    prepareMessageContent,
    prepareChatHistory,
    handleLlmError,
  };
};
