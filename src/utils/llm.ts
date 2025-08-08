import { v4 as uuidv4 } from 'uuid';

import { ChatMessage, LlmRole } from '@/types';

/**
 * Helper function to get display name for message sender
 * @param sender - Sender identifier
 * @param customAssistantName - Custom name for assistant sender
 * @returns Display name for the sender
 */
export const getSenderDisplayName = (sender: string, customAssistantName: string): string => {
  const senderDisplayNameMap: Record<string, string> = {
    assistant: customAssistantName,
    system: 'System',
    tool: 'Tool',
  };

  return senderDisplayNameMap[sender] ?? sender;
};

/**
 * Generates a unique message ID
 * @returns Unique message identifier
 */
export const generateMessageId = (): string => {
  return `msg-${uuidv4()}`;
};

/**
 * Return a function that helps to create messages in LLM with tools
 * Helps to debug and scale code base
 * @param addMessages - Function helper to add message
 */
export const createToolResultHandler = (
  addMessages: (messages: ChatMessage[]) => void
): ((toolCallId: string, content: string, isError?: boolean) => void) => {
  return (toolCallId: string, content: string, isError?: boolean) => {
    const toolMessage: ChatMessage = {
      id: generateMessageId(),
      sender: LlmRole.TOOL,
      text: isError ? `Error: ${content}` : `Tool Result: ${content}`,
      timestamp: new Date(),
      isError,
      isStreaming: false,
    };
    addMessages([toolMessage]);
  };
};
