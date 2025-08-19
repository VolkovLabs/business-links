import { DropzoneFile, IconName } from '@grafana/ui';

import { LlmMessage, LlmRole } from './llm-integrations';
import { AlignContentPositionType, DropdownConfig, HoverMenuPositionType, LinkConfig, McpServerConfig } from './panel';

export interface NestedLinkConfig extends LinkConfig {
  /**
   * Current dashboard/link
   *
   * @type {boolean}
   */
  isCurrentLink?: boolean;
}

/**
 * Visual Link Type
 */
export enum VisualLinkType {
  LINK = 'link',
  TIMEPICKER = 'timepicker',
  HTML = 'html',
  MENU = 'menu',
  LLMAPP = 'llmapp',
}

export interface VisualLink {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Id
   *
   * @type {string}
   */
  id: string;

  /**
   * Visual link type
   *
   * @type {VisualLinkType}
   */
  type: VisualLinkType;

  /**
   * Icon
   *
   * @type {IconName}
   */
  icon?: IconName;

  /**
   * Icon
   *
   * @type {boolean}
   */
  showMenuOnHover?: boolean;

  /**
   * Hover menu position
   *
   * @type {HoverMenuPositionType}
   */
  hoverMenuPosition?: HoverMenuPositionType;

  /**
   * links
   *
   * @type {NestedLinkConfig[]}
   */
  links: NestedLinkConfig[];

  /**
   * Time picker range
   */
  timeRange?: {
    /**
     * From range
     *
     * @type {string | number}
     */
    from: string | number;

    /**
     * To range
     *
     * @type {string | number}
     */
    to: string | number;
  };

  /**
   * HTML content
   *
   */
  content?: string;

  /**
   * Dropdown config
   *
   * @type {DropdownConfig}
   */
  dropdownConfig?: DropdownConfig;

  /**
   * Current Time Picker
   */
  isCurrentTimepicker?: boolean;

  /**
   * Use custom images
   *
   * @type {boolean}
   */
  showCustomIcons?: boolean;

  /**
   * Custom image url
   *
   * @type {string}
   */
  customIconUrl?: string;

  /**
   * Align content position
   *
   * @type {AlignContentPositionType}
   */
  alignContentPosition?: AlignContentPositionType;

  /**
   * Hide tooltip on hover
   *
   * @type {boolean}
   */
  hideTooltipOnHover?: boolean;

  /**
   * Context prompt for Business AI
   *
   * @type {string}
   */
  contextPrompt?: string;

  /**
   * Temperature for LLM (0-1)
   * 0 is most deterministic, 1 is most creative
   *
   * @type {number}
   */
  llmTemperature?: number;

  /**
   * Custom Assistant Name for Business AI
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
   * Show loading spinner for `tool` message instead show temporary and raw message
   *
   * @type {boolean}
   */
  showLoadingForRawMessage?: boolean;

  /**
   * MCP Servers configuration for Business AI
   *
   * @type {McpServerConfig[]}
   */
  mcpServers?: McpServerConfig[];
}

/**
 * Field Source
 */
export interface FieldSource {
  /**
   * Field Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Data Frame ID or Frame Index if no specified
   */
  source: string | number;
}

/**
 * Message type for chat conversations
 */
export interface ChatMessage {
  /**
   * Unique identifier for the message
   *
   * @type {string}
   */
  id: string;

  /**
   * Who sent the message
   *
   * @type {LlmRole}
   */
  sender: LlmRole;

  /**
   * Message content
   *
   * @type {string}
   */
  text: string;

  /**
   * When the message was sent
   *
   * @type {Date}
   */
  timestamp: Date;

  /**
   * Whether the message is currently being streamed
   *
   * @type {boolean}
   */
  isStreaming?: boolean;

  /**
   * Files attached to the message
   *
   * @type {AttachedFile[]}
   */
  attachments?: AttachedFile[];

  /**
   * Error message
   *
   * @type {boolean}
   */
  isError?: boolean;

  /**
   * Tool call ID for MCP tool results
   *
   * @type {string}
   */
  toolCallId?: string;

  /**
   * Whether this is a tool call message
   *
   * @type {boolean}
   */
  isToolCall?: boolean;

  /**
   * Flag use to indicate is this message is temporary and not fully completed (for tools messages)
   *
   * @type {boolean}
   */
  isTemporaryAnswer?: boolean;
}

/**
 * Attached file type with metadata
 */
export interface AttachedFile {
  /**
   * Unique identifier for the file
   *
   * @type {string}
   */
  id: string;

  /**
   * Original filename
   *
   * @type {string}
   */
  name: string;

  /**
   * File size in bytes
   *
   * @type {number}
   */
  size: number;

  /**
   * MIME type of the file
   *
   * @type {string}
   */
  type: string;

  /**
   * File content (base64 for images, text for text files)
   *
   * @type {string}
   */
  content: string;

  /**
   * Data URL for preview (images only)
   *
   * @type {string}
   */
  url?: string;
}

/**
 * LLM health check result
 */
export interface LlmHealthCheck {
  /**
   * Whether the LLM can be used
   *
   * @type {boolean}
   */
  canProceed: boolean;

  /**
   * Error message if LLM is not available
   *
   * @type {string}
   */
  error?: string;
}

/**
 * Properties for the ChatDrawer component
 */
export interface ChatDrawerProps {
  /**
   * Title displayed in the drawer header
   *
   * @type {string}
   */
  title: string;

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
}

/**
 * Return type for useChatMessages hook
 */
export interface UseChatMessagesReturn {
  /**
   * Array of chat messages
   *
   * @type {ChatMessage[]}
   */
  messages: ChatMessage[];

  /**
   * Function to set messages directly
   *
   * @type {React.Dispatch<React.SetStateAction<ChatMessage[]>>}
   */
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

  /**
   * Add multiple messages
   *
   */
  addMessages: (messages: ChatMessage[]) => void;

  /**
   * Update the last message
   *
   */
  updateLastMessage: (updater: (message: ChatMessage) => ChatMessage) => void;
}

/**
 * Return type for useFileAttachments hook
 */
export interface UseFileAttachmentsReturn {
  /**
   * Array of attached files
   *
   * @type {AttachedFile[]}
   */
  attachedFiles: AttachedFile[];

  /**
   * Format file size in human-readable format
   *
   */
  formatFileSize: (bytes: number) => string;

  /**
   * Handle file attachment from FileDropzone
   *
   */
  handleFileAttachment: (dropzoneFiles: DropzoneFile[]) => void;

  /**
   * Remove a specific attached file
   *
   */
  removeAttachedFile: (fileId: string) => void;

  /**
   * Clear all attached files
   *
   */
  clearAttachedFiles: () => void;
}

/**
 * Return type for useTextareaResize hook
 */
export interface UseTextareaResizeReturn {
  /**
   * Ref for the textarea element
   *
   * @type {React.RefObject<HTMLTextAreaElement | null>}
   */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;

  /**
   * Function to adjust textarea height
   *
   */
  adjustTextareaHeight: () => void;
}

/**
 * Return type for useLLMService hook
 */
export interface UseLlmServiceReturn {
  /**
   * Check LLM service status
   *
   */
  checkLlmStatus: () => Promise<LlmHealthCheck>;

  /**
   * Prepare message content with attachments
   *
   * @type {(text: string, files: AttachedFile[], formatFileSize: (bytes: number) => string) => string}
   */
  prepareMessageContent: (text: string, files: AttachedFile[], formatFileSize: (bytes: number) => string) => string;

  /**
   * Prepare chat history for LLM API
   *
   * @type {(messages: ChatMessage[], prepareContent: (text: string, files: AttachedFile[], formatFileSize: (bytes: number) => string) => string, formatFileSize: (bytes: number) => string) => LLMMessage[]}
   */
  prepareChatHistory: (
    messages: ChatMessage[],
    prepareContent: (text: string, files: AttachedFile[], formatFileSize: (bytes: number) => string) => string,
    formatFileSize: (bytes: number) => string
  ) => LlmMessage[];

  /**
   * Handle LLM errors
   *
   */
  handleLlmError: (error: { message: string }) => string;
}

/**
 * Configuration constants type
 */
export interface ChatConfig {
  /**
   * Maximum file size in bytes
   *
   * @type {number}
   */
  readonly maxFileSize: number;

  /**
   * Maximum textarea height in pixels
   *
   * @type {number}
   */
  readonly maxTextAreaHeight: number;

  /**
   * Minimum textarea height in pixels
   *
   * @type {number}
   */
  readonly minTextAreaHeight: number;

  /**
   * Request timeout in milliseconds
   *
   * @type {number}
   */
  readonly requestTimeout: number;

  /**
   * LLM temperature setting
   *
   * @type {number}
   */
  readonly temperature: number;
}

/**
 * Allowed file types for validation
 */
export type AllowedFileType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'text/plain'
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/json'
  | 'text/csv';
