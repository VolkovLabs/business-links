export const useMcpService = jest.fn(() => ({
  checkMcpStatus: jest.fn(),
  getAvailableTools: jest.fn(),
  convertToolsToOpenAiFormat: jest.fn(),
  executeToolCall: jest.fn(),
  setupMcpClients: jest.fn(),
  processToolCalls: jest.fn(),
}));

export type McpTool = {
  name: string;
  description: string;
};
