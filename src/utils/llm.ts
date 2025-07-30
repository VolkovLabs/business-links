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
