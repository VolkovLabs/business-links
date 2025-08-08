import { llm } from '@grafana/llm';
import { renderHook } from '@testing-library/react';

import { LlmRole } from '@/types';
import { useMcpLlmIntegration } from './useMcpLlmIntegration';
import { useMcpService } from './useMcpService';

jest.mock('@grafana/llm', () => ({
  llm: {
    enabled: jest.fn(),
    chatCompletions: jest.fn(),
    Model: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      BASE: 'base-model',
    },
  },
}));

jest.mock('./useMcpService', () => ({
  useMcpService: jest.fn(),
}));

const mockUseMcpService = useMcpService as jest.MockedFunction<typeof useMcpService>;

/**
 * Helper function to create a complete mock MCP service object
 */
const createMockMcpService = (overrides = {}) => ({
  checkMcpStatus: jest.fn(),
  getAvailableTools: jest.fn(),
  convertToolsToOpenAiFormat: jest.fn(),
  executeToolCall: jest.fn(),
  setupMcpClients: jest.fn(),
  processToolCalls: jest.fn(),
  clearCache: jest.fn(),
  ...overrides,
});

describe('useMcpLlmIntegration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('Should return available when both LLM and MCP are enabled', async () => {
      const mockMcpService = createMockMcpService({
        checkMcpStatus: jest.fn().mockResolvedValue({ isAvailable: true }),
      });

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      (llm.enabled as jest.Mock).mockResolvedValue(true);

      const availability = await result.current.checkAvailability();

      expect(availability.isAvailable).toBe(true);
      expect(availability.error).toBeUndefined();
      expect(llm.enabled).toHaveBeenCalledTimes(1);
      expect(mockMcpService.checkMcpStatus).toHaveBeenCalledTimes(1);
    });

    it('Should return unavailable when LLM is disabled', async () => {
      const mockMcpService = createMockMcpService({
        checkMcpStatus: jest.fn().mockResolvedValue({ isAvailable: true }),
      });

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      (llm.enabled as jest.Mock).mockResolvedValue(false);

      const availability = await result.current.checkAvailability();

      expect(availability.isAvailable).toBe(false);
      expect(availability.error).toBe('LLM is not enabled in Grafana settings');
      expect(llm.enabled).toHaveBeenCalledTimes(1);
      expect(mockMcpService.checkMcpStatus).not.toHaveBeenCalled();
    });

    it('Should return unavailable when MCP is disabled', async () => {
      const mockMcpService = createMockMcpService({
        checkMcpStatus: jest.fn().mockResolvedValue({
          isAvailable: false,
          error: 'MCP connection failed',
        }),
      });

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      (llm.enabled as jest.Mock).mockResolvedValue(true);

      const availability = await result.current.checkAvailability();

      expect(availability.isAvailable).toBe(false);
      expect(availability.error).toBe('MCP connection failed');
      expect(llm.enabled).toHaveBeenCalledTimes(1);
      expect(mockMcpService.checkMcpStatus).toHaveBeenCalledTimes(1);
    });

    it('Should handle errors gracefully', async () => {
      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn(),
        convertToolsToOpenAiFormat: jest.fn(),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      (llm.enabled as jest.Mock).mockRejectedValue(new Error('LLM service error'));

      const availability = await result.current.checkAvailability();

      expect(availability.isAvailable).toBe(false);
      expect(availability.error).toBe('Availability check failed: LLM service error');
    });

    it('Should pass addErrorMessage to useMcpService', () => {
      const mockAddErrorMessage = jest.fn();
      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn(),
        convertToolsToOpenAiFormat: jest.fn(),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      renderHook(() => useMcpLlmIntegration(mockAddErrorMessage));

      expect(mockUseMcpService).toHaveBeenCalledWith(mockAddErrorMessage);
    });

    it('Should call addErrorMessage when sendMessageWithTools fails', async () => {
      const mockAddErrorMessage = jest.fn();
      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockRejectedValue(new Error('MCP service error')),
        convertToolsToOpenAiFormat: jest.fn(),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration(mockAddErrorMessage));

      const messages = [{ role: LlmRole.USER, content: 'Hello' }];

      await expect(result.current.sendMessageWithTools(messages)).rejects.toThrow(
        'MCP + LLM request failed: MCP service error'
      );

      expect(mockAddErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('Failed to use MCP with LLM: MCP service error')
      );
    });
  });

  describe('getAvailableTools', () => {
    it('Should return tools from MCP service', async () => {
      const mockTools = [
        { name: 'get_time', description: 'Get current time' },
        { name: 'get_weather', description: 'Get weather info' },
      ];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn(),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const mcpServers = [{ name: 'Server 1', url: 'http://localhost:3004', enabled: true }];

      const tools = await result.current.getAvailableTools(mcpServers, true);

      expect(tools).toEqual(mockTools);
      expect(mockMcpService.getAvailableTools).toHaveBeenCalledWith(mcpServers, true);
    });
  });

  describe('sendMessageWithTools', () => {
    it('Should send message without tool calls successfully', async () => {
      const mockTools = [{ name: 'get_time', description: 'Get current time' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [{ role: LlmRole.USER, content: 'Hello, how are you?' }];

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'I am doing well, thank you for asking!',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock).mockResolvedValue(mockResponse);

      const response = await result.current.sendMessageWithTools(messages);

      expect(response).toBe('I am doing well, thank you for asking!');
      expect(llm.chatCompletions).toHaveBeenCalledWith({
        model: llm.Model.BASE,
        messages: [{ role: 'user', content: 'Hello, how are you?' }],
        tools: mockTools,
      });
    });

    it('Should handle tool calls and execute them', async () => {
      const mockTools = [{ name: 'get_time', description: 'Get current time' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn().mockResolvedValue({
          content: '14:30 UTC',
          isError: false,
        }),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [{ role: LlmRole.USER, content: 'What time is it?' }];

      const toolCall = {
        id: 'call_1',
        function: { name: 'get_time', arguments: '{}' },
      };

      const mockResponseWithToolCall = {
        choices: [
          {
            message: {
              content: 'Let me check the time for you.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const mockResponseFinal = {
        choices: [
          {
            message: {
              content: 'The current time is 14:30 UTC.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock)
        .mockResolvedValueOnce(mockResponseWithToolCall)
        .mockResolvedValueOnce(mockResponseFinal);

      const response = await result.current.sendMessageWithTools(messages);

      expect(response).toBe('The current time is 14:30 UTC.');
      expect(mockMcpService.executeToolCall).toHaveBeenCalledWith(toolCall, undefined, undefined);
      expect(llm.chatCompletions).toHaveBeenCalledTimes(2);
    });

    it('Should handle tool call errors gracefully', async () => {
      const mockTools = [{ name: 'get_weather', description: 'Get weather info' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn().mockRejectedValue(new Error('Weather service unavailable')),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [{ role: LlmRole.USER, content: 'Get the weather' }];

      const toolCall = {
        id: 'call_1',
        function: { name: 'get_weather', arguments: '{}' },
      };

      const mockResponseWithToolCall = {
        choices: [
          {
            message: {
              content: 'Let me get the weather for you.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const mockResponseFinal = {
        choices: [
          {
            message: {
              content: 'I encountered an error getting the weather.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock)
        .mockResolvedValueOnce(mockResponseWithToolCall)
        .mockResolvedValueOnce(mockResponseFinal);

      const response = await result.current.sendMessageWithTools(messages);

      expect(response).toBe('I encountered an error getting the weather.');
      expect(mockMcpService.executeToolCall).toHaveBeenCalledWith(toolCall, undefined, undefined);
    });

    it('Should call onToolResult callback when provided', async () => {
      const mockTools = [{ name: 'get_time', description: 'Get current time' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn().mockResolvedValue({
          content: '14:30 UTC',
          isError: false,
        }),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [{ role: LlmRole.USER, content: 'What time is it?' }];

      const toolCall = {
        id: 'call_1',
        function: { name: 'get_time', arguments: '{}' },
      };

      const mockResponseWithToolCall = {
        choices: [
          {
            message: {
              content: 'Let me check the time for you.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const mockResponseFinal = {
        choices: [
          {
            message: {
              content: 'The current time is 14:30 UTC.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      const onToolResult = jest.fn();

      (llm.chatCompletions as jest.Mock)
        .mockResolvedValueOnce(mockResponseWithToolCall)
        .mockResolvedValueOnce(mockResponseFinal);

      await result.current.sendMessageWithTools(messages, onToolResult);

      expect(onToolResult).toHaveBeenCalledWith('call_1', '"14:30 UTC"', false);
    });

    it('Should include assistant messages even with null content (they may have tool_calls)', async () => {
      const mockTools: any[] = [];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [
        { role: LlmRole.USER, content: 'Hello' },
        { role: LlmRole.ASSISTANT as const, content: null },
        { role: LlmRole.USER, content: '' },
        { role: LlmRole.SYSTEM as const, content: 'You are a helpful assistant' },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock).mockResolvedValue(mockResponse);

      await result.current.sendMessageWithTools(messages);

      expect(llm.chatCompletions).toHaveBeenCalledWith({
        model: llm.Model.BASE,
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'null' },
          { role: 'system', content: 'You are a helpful assistant' },
        ],
        tools: mockTools,
      });
    });

    it('Should filter out messages with empty string content', async () => {
      const mockTools: any[] = [];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [
        { role: LlmRole.USER, content: 'Hello' },
        { role: LlmRole.USER, content: '' },
        { role: LlmRole.USER, content: '   ' },
        { role: LlmRole.SYSTEM, content: 'You are a helpful assistant' },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock).mockResolvedValue(mockResponse);

      await result.current.sendMessageWithTools(messages);

      expect(llm.chatCompletions).toHaveBeenCalledWith({
        model: llm.Model.BASE,
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'user', content: '   ' },
          { role: 'system', content: 'You are a helpful assistant' },
        ],
        tools: mockTools,
      });
    });

    it('Should handle tool calls with empty content in updated messages', async () => {
      const mockTools = [{ name: 'get_time', description: 'Get current time' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn().mockResolvedValue({
          content: '',
          isError: false,
        }),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [{ role: LlmRole.USER, content: 'What time is it?' }];

      const toolCall = {
        id: 'call_1',
        function: { name: 'get_time', arguments: '{}' },
      };

      const mockResponseWithToolCall = {
        choices: [
          {
            message: {
              content: 'Let me check the time for you.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const mockResponseFinal = {
        choices: [
          {
            message: {
              content: 'The current time is not available.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock)
        .mockResolvedValueOnce(mockResponseWithToolCall)
        .mockResolvedValueOnce(mockResponseFinal);

      const response = await result.current.sendMessageWithTools(messages);

      expect(response).toBe('The current time is not available.');
      expect(mockMcpService.executeToolCall).toHaveBeenCalledWith(toolCall, undefined, undefined);
      expect(llm.chatCompletions).toHaveBeenCalledTimes(2);
    });

    it('Should handle tool calls with empty string content in updated messages filter', async () => {
      const mockTools = [{ name: 'get_time', description: 'Get current time' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn().mockResolvedValue({
          content: '',
          isError: false,
        }),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [
        { role: LlmRole.USER, content: 'What time is it?' },
        { role: LlmRole.USER, content: '' },
      ];

      const toolCall = {
        id: 'call_1',
        function: { name: 'get_time', arguments: '{}' },
      };

      const mockResponseWithToolCall = {
        choices: [
          {
            message: {
              content: 'Let me check the time for you.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const mockResponseFinal = {
        choices: [
          {
            message: {
              content: 'The current time is not available.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock)
        .mockResolvedValueOnce(mockResponseWithToolCall)
        .mockResolvedValueOnce(mockResponseFinal);

      const response = await result.current.sendMessageWithTools(messages);

      expect(response).toBe('The current time is not available.');
      expect(mockMcpService.executeToolCall).toHaveBeenCalledWith(toolCall, undefined, undefined);
      expect(llm.chatCompletions).toHaveBeenCalledTimes(2);
    });

    it('Should handle messages with empty string content in initial filter', async () => {
      const mockTools: any[] = [];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [
        { role: LlmRole.USER, content: 'Hello' },
        { role: LlmRole.USER, content: '' },
        { role: LlmRole.SYSTEM, content: 'You are a helpful assistant' },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock).mockResolvedValue(mockResponse);

      await result.current.sendMessageWithTools(messages);

      expect(llm.chatCompletions).toHaveBeenCalledWith({
        model: llm.Model.BASE,
        messages: [
          { role: LlmRole.USER, content: 'Hello' },
          { role: LlmRole.SYSTEM, content: 'You are a helpful assistant' },
        ],
        tools: mockTools,
      });
    });

    it('Should handle messages with tool role', async () => {
      const mockTools: any[] = [];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'tool', content: '/', toolCallId: 'call_kTFIvbxnDzZTvf1DdKHVxcBq' },
        { role: 'system', content: 'You are a helpful assistant' },
      ] as any;

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock).mockResolvedValue(mockResponse);

      await result.current.sendMessageWithTools(messages);

      expect(llm.chatCompletions).toHaveBeenCalledWith({
        model: llm.Model.BASE,
        messages: [
          { role: 'user', content: 'Hello' },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          { role: 'tool', content: '/', tool_call_id: 'call_kTFIvbxnDzZTvf1DdKHVxcBq' },
          { role: 'system', content: 'You are a helpful assistant' },
        ],
        tools: mockTools,
      });
    });

    it('Should handle tool messages with empty content in filter', async () => {
      const mockTools = [{ name: 'get_time', description: 'Get current time' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn().mockResolvedValue({
          content: '',
          isError: false,
        }),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [
        { role: LlmRole.USER, content: 'What time is it?' },
        { role: LlmRole.TOOL, content: '', toolCallId: 'call_1' },
      ];

      const toolCall = {
        id: 'call_1',
        function: { name: 'get_time', arguments: '{}' },
      };

      const mockResponseWithToolCall = {
        choices: [
          {
            message: {
              content: 'Let me check the time for you.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const mockResponseFinal = {
        choices: [
          {
            message: {
              content: 'The current time is not available.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock)
        .mockResolvedValueOnce(mockResponseWithToolCall)
        .mockResolvedValueOnce(mockResponseFinal);

      const response = await result.current.sendMessageWithTools(messages);

      expect(response).toBe('The current time is not available.');
      expect(mockMcpService.executeToolCall).toHaveBeenCalledWith(toolCall, undefined, undefined);
      expect(llm.chatCompletions).toHaveBeenCalledTimes(2);
    });

    it('Should handle system messages with empty content in filter', async () => {
      const mockTools: any[] = [];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [
        { role: LlmRole.USER, content: 'Hello' },
        { role: LlmRole.SYSTEM, content: '' },
        { role: LlmRole.SYSTEM, content: 'You are a helpful assistant' },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock).mockResolvedValue(mockResponse);

      await result.current.sendMessageWithTools(messages);

      expect(llm.chatCompletions).toHaveBeenCalledWith({
        model: llm.Model.BASE,
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'system', content: 'You are a helpful assistant' },
        ],
        tools: mockTools,
      });
    });

    it('Should handle messages with empty string content in filter', async () => {
      const mockTools: any[] = [];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [
        { role: LlmRole.USER, content: 'Hello' },
        { role: LlmRole.USER, content: '' },
        { role: LlmRole.SYSTEM, content: 'You are a helpful assistant' },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock).mockResolvedValue(mockResponse);

      await result.current.sendMessageWithTools(messages);

      expect(llm.chatCompletions).toHaveBeenCalledWith({
        model: llm.Model.BASE,
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'system', content: 'You are a helpful assistant' },
        ],
        tools: mockTools,
      });
    });

    it('Should handle tool calls without onToolResult callback', async () => {
      const mockTools = [{ name: 'get_time', description: 'Get current time' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn().mockResolvedValue({
          content: '14:30 UTC',
          isError: false,
        }),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [{ role: LlmRole.USER, content: 'What time is it?' }];

      const toolCall = {
        id: 'call_1',
        function: { name: 'get_time', arguments: '{}' },
      };

      const mockResponseWithToolCall = {
        choices: [
          {
            message: {
              content: 'Let me check the time for you.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const mockResponseFinal = {
        choices: [
          {
            message: {
              content: 'The current time is 14:30 UTC.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock)
        .mockResolvedValueOnce(mockResponseWithToolCall)
        .mockResolvedValueOnce(mockResponseFinal);

      const response = await result.current.sendMessageWithTools(messages);

      expect(response).toBe('The current time is 14:30 UTC.');
      expect(mockMcpService.executeToolCall).toHaveBeenCalledWith(toolCall, undefined, undefined);
      expect(llm.chatCompletions).toHaveBeenCalledTimes(2);
    });

    it('Should handle tool call errors without onToolResult callback', async () => {
      const mockTools = [{ name: 'get_weather', description: 'Get weather info' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn().mockRejectedValue(new Error('Weather service unavailable')),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [{ role: LlmRole.USER, content: 'Get the weather' }];

      const toolCall = {
        id: 'call_1',
        function: { name: 'get_weather', arguments: '{}' },
      };

      const mockResponseWithToolCall = {
        choices: [
          {
            message: {
              content: 'Let me get the weather for you.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const mockResponseFinal = {
        choices: [
          {
            message: {
              content: 'I encountered an error getting the weather.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock)
        .mockResolvedValueOnce(mockResponseWithToolCall)
        .mockResolvedValueOnce(mockResponseFinal);

      const response = await result.current.sendMessageWithTools(messages);

      expect(response).toBe('I encountered an error getting the weather.');
      expect(mockMcpService.executeToolCall).toHaveBeenCalledWith(toolCall, undefined, undefined);
    });

    it('Should handle tool call errors with onToolResult callback', async () => {
      const mockTools = [{ name: 'get_weather', description: 'Get weather info' }];

      const onToolResult = jest.fn();

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn().mockRejectedValue(new Error('Weather service unavailable')),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [{ role: LlmRole.USER, content: 'Get the weather' }];

      const toolCall = {
        id: 'call_1',
        function: { name: 'get_weather', arguments: '{}' },
      };

      const mockResponseWithToolCall = {
        choices: [
          {
            message: {
              content: 'Let me get the weather for you.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const mockResponseFinal = {
        choices: [
          {
            message: {
              content: 'I encountered an error getting the weather.',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock)
        .mockResolvedValueOnce(mockResponseWithToolCall)
        .mockResolvedValueOnce(mockResponseFinal);

      const response = await result.current.sendMessageWithTools(messages, onToolResult);

      expect(response).toBe('I encountered an error getting the weather.');
      expect(mockMcpService.executeToolCall).toHaveBeenCalledWith(toolCall, undefined, undefined);
    });

    it('Should handle tool messages without toolCallId', async () => {
      const mockTools = [{ name: 'get_time', description: 'Get current time' }];

      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockResolvedValue(mockTools),
        convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [
        { role: LlmRole.USER, content: 'Hello' },
        { role: LlmRole.TOOL, content: 'Tool response', toolCallId: undefined },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              tool_calls: undefined,
            },
          },
        ],
      };

      (llm.chatCompletions as jest.Mock).mockResolvedValue(mockResponse);

      await result.current.sendMessageWithTools(messages);

      expect(llm.chatCompletions).toHaveBeenCalledWith({
        model: llm.Model.BASE,
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'tool', content: 'Tool response' },
        ],
        tools: mockTools,
      });
    });

    it('Should handle errors without addErrorMessage callback', async () => {
      const mockMcpService = {
        checkMcpStatus: jest.fn(),
        getAvailableTools: jest.fn().mockRejectedValue(new Error('MCP service error')),
        convertToolsToOpenAiFormat: jest.fn(),
        executeToolCall: jest.fn(),
        setupMcpClients: jest.fn(),
        processToolCalls: jest.fn(),
        clearCache: jest.fn(),
      };

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      const messages = [{ role: LlmRole.USER, content: 'Hello' }];

      await expect(result.current.sendMessageWithTools(messages)).rejects.toThrow(
        'MCP + LLM request failed: MCP service error'
      );
    });
  });

  it('Should handle MCP status with undefined error', async () => {
    const mockMcpService = {
      checkMcpStatus: jest.fn().mockResolvedValue({
        isAvailable: false,
        error: undefined,
      }),
      getAvailableTools: jest.fn(),
      convertToolsToOpenAiFormat: jest.fn(),
      executeToolCall: jest.fn(),
      setupMcpClients: jest.fn(),
      processToolCalls: jest.fn(),
      clearCache: jest.fn(),
    };

    mockUseMcpService.mockReturnValue(mockMcpService);

    const { result } = renderHook(() => useMcpLlmIntegration());

    (llm.enabled as jest.Mock).mockResolvedValue(true);

    const availability = await result.current.checkAvailability();

    expect(availability.isAvailable).toBe(false);
    expect(availability.error).toBe('MCP service is not available');
  });

  it('Should handle non-Error objects in checkAvailability', async () => {
    const mockMcpService = {
      checkMcpStatus: jest.fn(),
      getAvailableTools: jest.fn(),
      convertToolsToOpenAiFormat: jest.fn(),
      executeToolCall: jest.fn(),
      setupMcpClients: jest.fn(),
      processToolCalls: jest.fn(),
      clearCache: jest.fn(),
    };

    mockUseMcpService.mockReturnValue(mockMcpService);

    const { result } = renderHook(() => useMcpLlmIntegration());

    (llm.enabled as jest.Mock).mockRejectedValue('String error');

    const availability = await result.current.checkAvailability();

    expect(availability.isAvailable).toBe(false);
    expect(availability.error).toBe('Availability check failed: Unknown error');
  });

  it('Should handle response with undefined content', async () => {
    const mockTools: any[] = [];

    const mockMcpService = {
      checkMcpStatus: jest.fn(),
      getAvailableTools: jest.fn().mockResolvedValue(mockTools),
      convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
      executeToolCall: jest.fn(),
      setupMcpClients: jest.fn(),
      processToolCalls: jest.fn(),
      clearCache: jest.fn(),
    };

    mockUseMcpService.mockReturnValue(mockMcpService);

    const { result } = renderHook(() => useMcpLlmIntegration());

    const messages = [{ role: LlmRole.USER, content: 'Hello' }];

    const mockResponse = {
      choices: [
        {
          message: {
            content: undefined,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            tool_calls: undefined,
          },
        },
      ],
    };

    (llm.chatCompletions as jest.Mock).mockResolvedValue(mockResponse);

    const response = await result.current.sendMessageWithTools(messages);

    expect(response).toBe('No response received');
  });

  it('Should handle tool call errors with non-Error objects', async () => {
    const mockTools = [{ name: 'get_weather', description: 'Get weather info' }];

    const mockMcpService = {
      checkMcpStatus: jest.fn(),
      getAvailableTools: jest.fn().mockResolvedValue(mockTools),
      convertToolsToOpenAiFormat: jest.fn().mockReturnValue(mockTools),
      executeToolCall: jest.fn().mockRejectedValue('String error'),
      setupMcpClients: jest.fn(),
      processToolCalls: jest.fn(),
      clearCache: jest.fn(),
    };

    mockUseMcpService.mockReturnValue(mockMcpService);

    const { result } = renderHook(() => useMcpLlmIntegration());

    const messages = [{ role: LlmRole.USER, content: 'Get the weather' }];

    const toolCall = {
      id: 'call_1',
      function: { name: 'get_weather', arguments: '{}' },
    };

    const mockResponseWithToolCall = {
      choices: [
        {
          message: {
            content: 'Let me get the weather for you.',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            tool_calls: [toolCall],
          },
        },
      ],
    };

    const mockResponseFinal = {
      choices: [
        {
          message: {
            content: 'I encountered an error getting the weather.',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            tool_calls: undefined,
          },
        },
      ],
    };

    (llm.chatCompletions as jest.Mock)
      .mockResolvedValueOnce(mockResponseWithToolCall)
      .mockResolvedValueOnce(mockResponseFinal);

    const response = await result.current.sendMessageWithTools(messages);

    expect(response).toBe('I encountered an error getting the weather.');
    expect(mockMcpService.executeToolCall).toHaveBeenCalledWith(toolCall, undefined, undefined);
  });

  it('Should handle sendMessageWithTools errors with non-Error objects', async () => {
    const mockMcpService = createMockMcpService({
      getAvailableTools: jest.fn().mockRejectedValue('String error'),
    });

    mockUseMcpService.mockReturnValue(mockMcpService);

    const { result } = renderHook(() => useMcpLlmIntegration());

    const messages = [{ role: LlmRole.USER, content: 'Hello' }];

    await expect(result.current.sendMessageWithTools(messages)).rejects.toThrow(
      'MCP + LLM request failed: Unknown error'
    );
  });

  it('Should handle sendMessageWithTools errors with addErrorMessage and non-Error objects', async () => {
    const mockAddErrorMessage = jest.fn();
    const mockMcpService = createMockMcpService({
      getAvailableTools: jest.fn().mockRejectedValue('String error'),
    });

    mockUseMcpService.mockReturnValue(mockMcpService);

    const { result } = renderHook(() => useMcpLlmIntegration(mockAddErrorMessage));

    const messages = [{ role: LlmRole.USER, content: 'Hello' }];

    await expect(result.current.sendMessageWithTools(messages)).rejects.toThrow(
      'MCP + LLM request failed: Unknown error'
    );

    expect(mockAddErrorMessage).toHaveBeenCalledWith('Failed to use MCP with LLM: Unknown error');
  });

  describe('clearMcpCache', () => {
    it('Should call clearCache on MCP service', () => {
      const mockMcpService = createMockMcpService();

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      result.current.clearMcpCache();

      expect(mockMcpService.clearCache).toHaveBeenCalledTimes(1);
    });

    it('Should not throw when clearCache is called', () => {
      const mockMcpService = createMockMcpService();

      mockUseMcpService.mockReturnValue(mockMcpService);

      const { result } = renderHook(() => useMcpLlmIntegration());

      expect(() => result.current.clearMcpCache()).not.toThrow();
    });
  });
});
