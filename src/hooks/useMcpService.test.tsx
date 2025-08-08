import { mcp } from '@grafana/llm';
import { renderHook } from '@testing-library/react';

import { clearMcpCache, prepareToolContent } from '@/utils';

import { useMcpService } from './useMcpService';
import { LlmRole } from '@/types';

jest.mock('@/utils', () => ({
  ...jest.requireActual('@/utils'),
  clearMcpCache: jest.fn(),
  prepareToolContent: jest.fn(),
}));

const createMockClient = () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  listTools: jest.fn(),
  callTool: jest.fn(),
  close: jest.fn(),
});

const mockTransport = {};

jest.mock('@grafana/llm', () => ({
  mcp: {
    Client: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    StreamableHTTPClientTransport: jest.fn(() => mockTransport),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    streamableHTTPURL: jest.fn(() => new URL('http://localhost:3000')),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    convertToolsToOpenAI: jest.fn((tools) => tools),
  },
}));

describe('useMcpService with multiple servers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mcp.Client as jest.Mock).mockImplementation(() => createMockClient());
    (mcp.streamableHTTPURL as jest.Mock).mockReturnValue(new URL('http://localhost:3000'));
    (mcp.convertToolsToOpenAI as jest.Mock).mockImplementation((tools) => tools);
  });

  it('Should setup multiple MCP clients for enabled servers', async () => {
    const { result } = renderHook(() => useMcpService());

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
      { name: 'Server 3', url: 'http://localhost:3006', enabled: false },
    ];

    const clients = await result.current.setupMcpClients(mcpServers);

    expect(clients).toHaveLength(2);
    expect(clients[0].server.name).toEqual('Server 1');
    expect(clients[1].server.name).toEqual('Server 2');
    expect(mcp.Client).toHaveBeenCalledTimes(2);
  });

  it('Should use default Grafana MCP when no custom servers', async () => {
    const { result } = renderHook(() => useMcpService());

    const clients = await result.current.setupMcpClients([], true);

    expect(clients).toHaveLength(1);
    expect(clients[0].server.name).toEqual('Default Grafana MCP');
    expect(mcp.Client).toHaveBeenCalledTimes(1);
  });

  it('Should aggregate tools from all servers', async () => {
    const { result } = renderHook(() => useMcpService());

    const mockTools1 = [
      { name: 'get_time', description: 'Get current time' },
      { name: 'calculate', description: 'Calculate math' },
    ];

    const mockTools2 = [{ name: 'get_weather', description: 'Get weather info' }];

    const mockClient1 = createMockClient();
    const mockClient2 = createMockClient();

    mockClient1.listTools.mockResolvedValue({ tools: mockTools1 });
    mockClient2.listTools.mockResolvedValue({ tools: mockTools2 });

    (mcp.Client as jest.Mock).mockReturnValueOnce(mockClient1).mockReturnValueOnce(mockClient2);

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const tools = await result.current.getAvailableTools(mcpServers);

    expect(tools).toHaveLength(3);
    expect(tools[0]).toHaveProperty('serverName', 'Server 1');
    expect(tools[1]).toHaveProperty('serverName', 'Server 1');
    expect(tools[2]).toHaveProperty('serverName', 'Server 2');
  });

  it('Should execute tool call on first available server', async () => {
    const { result } = renderHook(() => useMcpService());

    const mockResult = { content: 'Current time: 2024-01-01' };
    const mockClient1 = createMockClient();
    mockClient1.callTool.mockResolvedValue(mockResult);
    mockClient1.listTools.mockResolvedValue({ tools: [{ name: 'get_time' }] });

    (mcp.Client as jest.Mock).mockReturnValue(mockClient1);

    const toolCall = {
      id: '1',
      function: { name: 'get_time', arguments: '{}' },
    };

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.content).toEqual('Current time: 2024-01-01');
    expect(toolResult.isError).toEqual(false);
    expect(mockClient1.callTool).toHaveBeenCalledWith({
      name: 'get_time',
      arguments: {},
    });
  });

  it('Should try next server if first fails', async () => {
    const { result } = renderHook(() => useMcpService());

    const mockResult = { content: 'Weather: sunny' };
    const mockClient1 = createMockClient();
    const mockClient2 = createMockClient();

    mockClient1.callTool.mockRejectedValue(new Error('Tool not found'));
    mockClient1.listTools.mockResolvedValue({ tools: [{ name: 'get_weather' }] });
    mockClient2.callTool.mockResolvedValue(mockResult);
    mockClient2.listTools.mockResolvedValue({ tools: [{ name: 'get_weather' }] });

    (mcp.Client as jest.Mock).mockReturnValueOnce(mockClient1).mockReturnValueOnce(mockClient2);

    const toolCall = {
      id: '1',
      function: { name: 'get_weather', arguments: '{}' },
    };

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.content).toEqual('Weather: sunny');
    expect(toolResult.isError).toEqual(false);
    expect(mockClient1.callTool).toHaveBeenCalledTimes(1);
    expect(mockClient2.callTool).toHaveBeenCalledTimes(1);
  });

  it('Should return error if tool not found on any server', async () => {
    const { result } = renderHook(() => useMcpService());

    const mockClient1 = createMockClient();
    const mockClient2 = createMockClient();

    // These servers don't have the unknown_tool in their available tools
    mockClient1.listTools.mockResolvedValue({ tools: [{ name: 'other_tool' }] });
    mockClient2.listTools.mockResolvedValue({ tools: [{ name: 'different_tool' }] });

    (mcp.Client as jest.Mock).mockReturnValueOnce(mockClient1).mockReturnValueOnce(mockClient2);

    const toolCall = {
      id: '1',
      function: { name: 'unknown_tool', arguments: '{}' },
    };

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.isError).toEqual(true);
    expect(toolResult.errorMessage).toContain('is not available on any connected MCP server');
  });

  it('Should convert tools to OpenAI format without server metadata', () => {
    const { result } = renderHook(() => useMcpService());

    const toolsWithMetadata = [
      { name: 'get_time', serverName: 'Server 1', serverUrl: 'http://localhost:3004' },
      { name: 'calculate', serverName: 'Server 2', serverUrl: 'http://localhost:3005' },
    ];

    const convertedTools = result.current.convertToolsToOpenAiFormat(toolsWithMetadata);

    expect(convertedTools).toHaveLength(2);
    expect(convertedTools[0]).not.toHaveProperty('serverName');
    expect(convertedTools[0]).not.toHaveProperty('serverUrl');
    expect(convertedTools[0].function).toHaveProperty('name', 'get_time');
  });

  it('Should handle tool execution errors gracefully', async () => {
    const { result } = renderHook(() => useMcpService());

    const mockClient1 = createMockClient();
    const mockClient2 = createMockClient();

    mockClient1.callTool.mockRejectedValue(new Error('Tool not found'));
    mockClient1.listTools.mockResolvedValue({ tools: [{ name: 'get_time' }] });
    mockClient2.callTool.mockResolvedValue({ content: 'Success result' });
    mockClient2.listTools.mockResolvedValue({ tools: [{ name: 'get_time' }] });

    (mcp.Client as jest.Mock).mockReturnValueOnce(mockClient1).mockReturnValueOnce(mockClient2);

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const toolCall = {
      id: 'call_1',
      function: { name: 'get_time', arguments: '{}' },
    };

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.isError).toEqual(false);
    expect(toolResult.content).toEqual('Success result');
  });

  it('Should call addErrorMessage when provided and errors occur', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const mockClient = createMockClient();
    mockClient.connect.mockRejectedValue(new Error('Connection failed'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const mcpServers = [{ name: 'Test Server', url: 'http://localhost:3004', enabled: true }];

    await result.current.setupMcpClients(mcpServers);

    expect(mockAddErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('Failed to connect to MCP server Test Server')
    );
  });

  it('Should fallback to console.error when addErrorMessage is not provided', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const { result } = renderHook(() => useMcpService());

    const mockClient = createMockClient();
    mockClient.connect.mockRejectedValue(new Error('Connection failed'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const mcpServers = [{ name: 'Test Server', url: 'http://localhost:3004', enabled: true }];

    await result.current.setupMcpClients(mcpServers);

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('Should handle checkMcpStatus error case', async () => {
    const { result } = renderHook(() => useMcpService());

    const status = await result.current.checkMcpStatus();
    expect(status.isAvailable).toEqual(true);
  });

  it('Should handle default Grafana MCP connection failure', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const mockClient = createMockClient();
    mockClient.connect.mockRejectedValue(new Error('Default MCP connection failed'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const clients = await result.current.setupMcpClients([], true);

    expect(clients).toHaveLength(0);
    expect(mockAddErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('Failed to connect to default Grafana MCP server')
    );
  });

  it('Should handle getAvailableTools error when setupMcpClients fails', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const mockClient = createMockClient();
    mockClient.connect.mockRejectedValue(new Error('Setup failed'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const tools = await result.current.getAvailableTools([]);

    expect(tools).toEqual([]);
    expect(mockAddErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to get MCP tools'));
  });

  it('Should handle getAvailableTools error when listTools fails', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const mockClient = createMockClient();
    mockClient.listTools.mockRejectedValue(new Error('List tools failed'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const mcpServers = [{ name: 'Test Server', url: 'http://localhost:3004', enabled: true }];

    const tools = await result.current.getAvailableTools(mcpServers);

    expect(tools).toEqual([]);
    expect(mockAddErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('Failed to get tools from server Test Server')
    );
  });

  it('Should handle executeToolCall error when setupMcpClients fails', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const mockClient = createMockClient();
    mockClient.connect.mockRejectedValue(new Error('Setup failed'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const toolCall = {
      id: '1',
      function: { name: 'test_tool', arguments: '{}' },
    };

    const toolResult = await result.current.executeToolCall(toolCall);

    expect(toolResult.isError).toEqual(true);
    expect(toolResult.errorMessage).toContain("Tool 'test_tool' is not available on any connected MCP server");
    expect(mockAddErrorMessage).toHaveBeenCalledWith(expect.stringContaining('MCP tool call failed'));
  });

  it('Should handle processToolCalls with tool calls', async () => {
    const { result } = renderHook(() => useMcpService());
    const mockAddToolResult = jest.fn();

    const mockClient = createMockClient();
    mockClient.callTool.mockResolvedValue({ content: 'Tool result' });
    mockClient.listTools.mockResolvedValue({ tools: [{ name: 'test_tool' }] });

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const response = {
      choices: [
        {
          message: {
            content: 'Assistant message',
            toolCalls: [
              {
                id: 'tool_call_1',
                function: { name: 'test_tool', arguments: '{}' },
              },
            ],
          },
        },
      ],
    };

    const messages = [{ role: LlmRole.USER, content: 'User message' }];

    const processResult = await result.current.processToolCalls(response, messages, mockAddToolResult, [
      { name: 'Test Server', url: 'http://localhost:3004', enabled: true },
    ]);

    expect(processResult.hasMoreToolCalls).toEqual(true);
    expect(processResult.updatedMessages).toHaveLength(3);
    expect(mockAddToolResult).toHaveBeenCalledWith('tool_call_1', undefined, false);
  });

  it('Should handle processToolCalls without tool calls', async () => {
    const { result } = renderHook(() => useMcpService());
    const mockAddToolResult = jest.fn();

    const response = {
      choices: [
        {
          message: {
            content: 'Assistant message',
          },
        },
      ],
    };

    const messages = [{ role: LlmRole.USER, content: 'User message' }];

    const processResult = await result.current.processToolCalls(response, messages, mockAddToolResult);

    expect(processResult.hasMoreToolCalls).toEqual(false);
    expect(processResult.updatedMessages).toEqual(messages);
    expect(mockAddToolResult).not.toHaveBeenCalled();
  });

  it('Should handle processToolCalls with tool execution error', async () => {
    const { result } = renderHook(() => useMcpService());
    const mockAddToolResult = jest.fn();

    const mockClient = createMockClient();
    mockClient.callTool.mockRejectedValue(new Error('Tool execution failed'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const response = {
      choices: [
        {
          message: {
            content: 'Assistant message',
            toolCalls: [
              {
                id: 'tool_call_1',
                function: { name: 'test_tool', arguments: '{}' },
              },
            ],
          },
        },
      ],
    };

    const messages = [{ role: LlmRole.USER, content: 'User message' }];

    const processResult = await result.current.processToolCalls(response, messages, mockAddToolResult, [
      { name: 'Test Server', url: 'http://localhost:3004', enabled: true },
    ]);

    expect(processResult.hasMoreToolCalls).toEqual(true);
    expect(processResult.updatedMessages).toHaveLength(3);
    expect(mockAddToolResult).toHaveBeenCalledWith('tool_call_1', undefined, true);
  });

  it('Should handle convertToolsToOpenAiFormat error', () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const tools = [{}];
    tools.map = jest.fn().mockImplementation(() => {
      throw new Error('Conversion failed');
    });

    const convertedTools = result.current.convertToolsToOpenAiFormat(tools as any);

    expect(convertedTools).toEqual([]);
    expect(mockAddErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('Failed to convert MCP tools to OpenAI format')
    );
  });

  it('Should handle tools array with undefined tools property', async () => {
    const { result } = renderHook(() => useMcpService());

    const mockClient = createMockClient();
    mockClient.listTools.mockResolvedValue({ tools: undefined });

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const mcpServers = [{ name: 'Test Server', url: 'http://localhost:3004', enabled: true }];

    const tools = await result.current.getAvailableTools(mcpServers);

    expect(tools).toEqual([]);
  });

  it('Should handle non-Error objects in error handling', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const mockClient = createMockClient();
    mockClient.connect.mockRejectedValue('String error');

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const mcpServers = [{ name: 'Test Server', url: 'http://localhost:3004', enabled: true }];

    await result.current.setupMcpClients(mcpServers);

    expect(mockAddErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Unknown error'));
  });

  it('Should handle executeToolCall with non-Error objects', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const mockClient = createMockClient();
    mockClient.callTool.mockRejectedValue('String error');
    mockClient.listTools.mockResolvedValue({ tools: [{ name: 'test_tool' }] });

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const toolCall = {
      id: '1',
      function: { name: 'test_tool', arguments: '{}' },
    };

    const mcpServers = [{ name: 'Test Server', url: 'http://localhost:3004', enabled: true }];

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.isError).toEqual(true);
    expect(toolResult.errorMessage).toEqual('Unknown error');
    expect(mockAddErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('Tool execution failed on server Test Server')
    );
  });

  it('Should handle setupMcpClients general error', async () => {
    const { result } = renderHook(() => useMcpService());

    const mockClient = createMockClient();
    mockClient.connect.mockRejectedValue(new Error('General setup error'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const mcpServers = [{ name: 'Test Server', url: 'invalid-url', enabled: true }];

    await expect(result.current.setupMcpClients(mcpServers)).rejects.toThrow(
      'Invalid URL for server Test Server: invalid-url'
    );
  });

  it('Should handle getAvailableTools when setupMcpClients throws', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const mockClient = createMockClient();
    mockClient.connect.mockRejectedValue(new Error('Setup error'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const mcpServers = [{ name: 'Test Server', url: 'invalid-url', enabled: true }];

    const tools = await result.current.getAvailableTools(mcpServers);

    expect(tools).toEqual([]);
    expect(mockAddErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to get MCP tools'));
  });

  it('Should handle executeToolCall when setupMcpClients throws', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const mockClient = createMockClient();
    mockClient.connect.mockRejectedValue(new Error('Setup error'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const toolCall = {
      id: '1',
      function: { name: 'test_tool', arguments: '{}' },
    };

    const mcpServers = [{ name: 'Test Server', url: 'invalid-url', enabled: true }];

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.isError).toEqual(true);
    expect(toolResult.errorMessage).toContain('Failed to setup MCP clients');
    expect(mockAddErrorMessage).toHaveBeenCalledWith(expect.stringContaining('MCP tool call failed'));
  });

  it('Should handle processToolCalls with addErrorMessage', async () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));
    const mockAddToolResult = jest.fn();

    const mockClient = createMockClient();
    mockClient.callTool.mockRejectedValue(new Error('Tool execution failed'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const response = {
      choices: [
        {
          message: {
            content: 'Assistant message',
            toolCalls: [
              {
                id: 'tool_call_1',
                function: { name: 'test_tool', arguments: '{}' },
              },
            ],
          },
        },
      ],
    };

    const messages = [{ role: LlmRole.USER, content: 'User message' }];

    const processResult = await result.current.processToolCalls(response, messages, mockAddToolResult, [
      { name: 'Test Server', url: 'http://localhost:3004', enabled: true },
    ]);

    expect(processResult.hasMoreToolCalls).toEqual(true);
    expect(processResult.updatedMessages).toHaveLength(3);
    expect(mockAddToolResult).toHaveBeenCalledWith('tool_call_1', undefined, true);
  });

  it('Should handle convertToolsToOpenAiFormat with addErrorMessage', () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const tools = [{}];
    tools.map = jest.fn().mockImplementation(() => {
      throw new Error('Conversion failed');
    });

    const convertedTools = result.current.convertToolsToOpenAiFormat(tools as any);

    expect(convertedTools).toEqual([]);
    expect(mockAddErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('Failed to convert MCP tools to OpenAI format')
    );
  });

  it('Should handle checkMcpStatus error case', async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalThrowError = process.env.THROW_MCP_ERROR;

    process.env.NODE_ENV = 'test';
    process.env.THROW_MCP_ERROR = 'true';

    const { result } = renderHook(() => useMcpService());

    const status = await result.current.checkMcpStatus();

    expect(status.isAvailable).toEqual(false);
    expect(status.error).toContain('Test MCP error');

    process.env.NODE_ENV = originalEnv;
    process.env.THROW_MCP_ERROR = originalThrowError;
  });

  it('Should handle convertToolsToOpenAiFormat error case', () => {
    const mockAddErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(mockAddErrorMessage));

    const invalidTools = {
      length: 1,
      [Symbol.iterator]: function* () {
        yield { name: 'test' };
      },
    };

    const originalMap = Array.prototype.map;
    Array.prototype.map = jest.fn().mockImplementation(() => {
      throw new Error('Map operation failed');
    });

    const convertedTools = result.current.convertToolsToOpenAiFormat(invalidTools as any);

    expect(convertedTools).toEqual([]);
    expect(mockAddErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('Failed to convert MCP tools to OpenAI format')
    );

    Array.prototype.map = originalMap;
  });

  it('Should handle convertToolsToOpenAiFormat error case without addErrorMessage', () => {
    const { result } = renderHook(() => useMcpService());

    const invalidTools = {
      length: 1,
      [Symbol.iterator]: function* () {
        yield { name: 'test' };
      },
    };

    const originalMap = Array.prototype.map;
    Array.prototype.map = jest.fn().mockImplementation(() => {
      throw new Error('Map operation failed');
    });

    const convertedTools = result.current.convertToolsToOpenAiFormat(invalidTools as any);

    expect(convertedTools).toEqual([]);

    Array.prototype.map = originalMap;
  });

  it('Should handle convertToolsToOpenAiFormat error case with addErrorMessage undefined', () => {
    const { result } = renderHook(() => useMcpService(undefined));

    const invalidTools = {
      length: 1,
      [Symbol.iterator]: function* () {
        yield { name: 'test' };
      },
    };

    const originalMap = Array.prototype.map;
    Array.prototype.map = jest.fn().mockImplementation(() => {
      throw new Error('Map operation failed');
    });

    const convertedTools = result.current.convertToolsToOpenAiFormat(invalidTools as any);

    expect(convertedTools).toEqual([]);

    Array.prototype.map = originalMap;
  });

  it('Should handle convertToolsToOpenAiFormat error case with addErrorMessage null', () => {
    const { result } = renderHook(() => useMcpService(null as any));

    const invalidTools = {
      length: 1,
      [Symbol.iterator]: function* () {
        yield { name: 'test' };
      },
    };

    const originalMap = Array.prototype.map;
    Array.prototype.map = jest.fn().mockImplementation(() => {
      throw new Error('Map operation failed');
    });

    const convertedTools = result.current.convertToolsToOpenAiFormat(invalidTools as any);

    expect(convertedTools).toEqual([]);

    Array.prototype.map = originalMap;
  });

  it('Should handle convertToolsToOpenAiFormat error case with property access error', () => {
    const { result } = renderHook(() => useMcpService());

    const toolWithErrorGetter = {
      get name() {
        throw new Error('Property access error');
      },
      description: 'test',
      inputSchema: {},
    };

    const tools = [toolWithErrorGetter];

    const convertedTools = result.current.convertToolsToOpenAiFormat(tools as any);

    expect(convertedTools).toEqual([]);
  });

  it('Should call clearMcpCache when clearCache is invoked', () => {
    const { result } = renderHook(() => useMcpService());

    result.current.clearCache();

    expect(clearMcpCache).toHaveBeenCalledTimes(1);
  });

  it('Should return current clients if configHash is equal', async () => {
    const { result, rerender } = renderHook(() => useMcpService());
    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
      { name: 'Server 3', url: 'http://localhost:3006', enabled: false },
    ];

    await result.current.setupMcpClients(mcpServers);
    rerender();
    await result.current.setupMcpClients(mcpServers);

    /*
     *Should call 2 times on initial
     */
    expect(mcp.Client).toHaveBeenCalledTimes(2);
  });

  it('Should handle setupMcpClients with tools in availableTools', async () => {
    const mockedToolsList = [
      {
        name: 'add_activity_to_incident',
        description: 'Add a note',
      },
    ];
    const createMockClientMock = () => ({
      connect: jest.fn().mockResolvedValue(undefined),
      listTools: jest.fn(() => ({ tools: mockedToolsList })),
      callTool: jest.fn(),
      close: jest.fn(),
      test: jest.fn(),
    });

    const mockClient = createMockClientMock();
    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const { result } = renderHook(() => useMcpService());

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
      { name: 'Server 3', url: 'http://localhost:3006', enabled: false },
    ];

    const clients = await result.current.setupMcpClients(mcpServers, true);
    expect(clients[0].availableTools).toEqual(['add_activity_to_incident']);
  });

  it('Should aggregate tools from all servers adn return current if already exist', async () => {
    const { result, rerender } = renderHook(() => useMcpService());

    const mockTools1 = [
      { name: 'get_time', description: 'Get current time' },
      { name: 'calculate', description: 'Calculate math' },
    ];

    const mockTools2 = [{ name: 'get_weather', description: 'Get weather info' }];

    const mockClient1 = createMockClient();
    const mockClient2 = createMockClient();

    mockClient1.listTools.mockResolvedValue({ tools: mockTools1 });
    mockClient2.listTools.mockResolvedValue({ tools: mockTools2 });

    (mcp.Client as jest.Mock).mockReturnValueOnce(mockClient1).mockReturnValueOnce(mockClient2);

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const tools = await result.current.getAvailableTools(mcpServers);

    expect(tools).toHaveLength(3);
    expect(tools[0]).toHaveProperty('serverName', 'Server 1');
    expect(tools[1]).toHaveProperty('serverName', 'Server 1');
    expect(tools[2]).toHaveProperty('serverName', 'Server 2');

    rerender();

    const toolsSecond = await result.current.getAvailableTools(mcpServers);

    expect(toolsSecond[0]).toHaveProperty('serverName', 'Server 1');
  });

  it('Should execute tool call on first available server and use the same mcp.current if cashed is the same', async () => {
    const { result, rerender } = renderHook(() => useMcpService());

    const mockResult = { content: 'Current time: 2024-01-01' };
    const mockClient1 = createMockClient();
    mockClient1.callTool.mockResolvedValue(mockResult);
    mockClient1.listTools.mockResolvedValue({ tools: [{ name: 'get_time' }] });

    (mcp.Client as jest.Mock).mockReturnValue(mockClient1);

    const toolCall = {
      id: '1',
      function: { name: 'get_time', arguments: '{}' },
    };

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.content).toEqual('Current time: 2024-01-01');
    rerender();

    const toolResultRepeat = await result.current.executeToolCall(toolCall, mcpServers);
    expect(toolResultRepeat.content).toEqual('Current time: 2024-01-01');
  });

  it('Should handle processToolCalls with tool execution error and ad handle error inside', async () => {
    const mockedPrepareToolContent = prepareToolContent as jest.Mock;

    mockedPrepareToolContent.mockImplementation(() => {
      throw new Error('Mocked prepareToolContent failure');
    });

    const { result } = renderHook(() => useMcpService());
    const mockAddToolResult = jest.fn();

    const mockClient = createMockClient();
    mockClient.callTool.mockRejectedValue(new Error('Tool execution failed'));

    (mcp.Client as jest.Mock).mockReturnValue(mockClient);

    const response = {
      choices: [
        {
          message: {
            content: 'Assistant message',
            toolCalls: [
              {
                id: 'tool_call_1',
                function: { name: 'test_tool', arguments: '{}' },
              },
            ],
          },
        },
      ],
    };

    const messages = [{ role: LlmRole.USER, content: 'User message' }];

    const processResult = await result.current.processToolCalls(response, messages, mockAddToolResult, [
      { name: 'Test Server', url: 'http://localhost:3004', enabled: true },
    ]);

    expect(processResult.hasMoreToolCalls).toEqual(true);
    expect(mockAddToolResult).toHaveBeenCalledWith(
      'tool_call_1',
      'Error executing test_tool: Mocked prepareToolContent failure',
      true
    );
  });

  it('Should handle tool execution errors gracefully with time out text', async () => {
    const addErrorMessage = jest.fn();
    const { result } = renderHook(() => useMcpService(addErrorMessage));

    const mockClient1 = createMockClient();

    mockClient1.callTool.mockRejectedValue(new Error('timed out test'));
    mockClient1.listTools.mockResolvedValue({ tools: [{ name: 'get_time' }] });

    (mcp.Client as jest.Mock).mockReturnValueOnce(mockClient1).mockReturnValueOnce(mockClient1);

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const toolCall = {
      id: 'call_1',
      function: { name: 'get_time', arguments: '{}' },
    };

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.isError).toEqual(true);
    expect(addErrorMessage).toHaveBeenCalledWith('Server Server 1 timed out (10000ms)');
  });
});
