import { mcp } from '@grafana/llm';
import { renderHook } from '@testing-library/react';

import { useMcpService } from './useMcpService';

const createMockClient = () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  listTools: jest.fn(),
  callTool: jest.fn(),
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
    expect(clients[0].server.name).toBe('Server 1');
    expect(clients[1].server.name).toBe('Server 2');
    expect(mcp.Client).toHaveBeenCalledTimes(2);
  });

  it('Should use default Grafana MCP when no custom servers', async () => {
    const { result } = renderHook(() => useMcpService());

    const clients = await result.current.setupMcpClients([], true);

    expect(clients).toHaveLength(1);
    expect(clients[0].server.name).toBe('Default Grafana MCP');
    expect(mcp.Client).toHaveBeenCalledTimes(1);
  });

  it('Should aggregate tools from all servers', async () => {
    const { result } = renderHook(() => useMcpService());

    const mockTools1 = [
      { name: 'get_time', description: 'Get current time' },
      { name: 'calculate', description: 'Calculate math' },
    ];

    const mockTools2 = [
      { name: 'get_weather', description: 'Get weather info' },
    ];

    const mockClient1 = createMockClient();
    const mockClient2 = createMockClient();
    
    mockClient1.listTools.mockResolvedValue({ tools: mockTools1 });
    mockClient2.listTools.mockResolvedValue({ tools: mockTools2 });

    (mcp.Client as jest.Mock)
      .mockReturnValueOnce(mockClient1)
      .mockReturnValueOnce(mockClient2);

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

    expect(toolResult.content).toBe('Current time: 2024-01-01');
    expect(toolResult.isError).toBe(false);
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
    mockClient2.callTool.mockResolvedValue(mockResult);

    (mcp.Client as jest.Mock)
      .mockReturnValueOnce(mockClient1)
      .mockReturnValueOnce(mockClient2);

    const toolCall = {
      id: '1',
      function: { name: 'get_weather', arguments: '{}' },
    };

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.content).toBe('Weather: sunny');
    expect(toolResult.isError).toBe(false);
    expect(mockClient1.callTool).toHaveBeenCalledTimes(1);
    expect(mockClient2.callTool).toHaveBeenCalledTimes(1);
  });

  it('Should return error if tool not found on any server', async () => {
    const { result } = renderHook(() => useMcpService());

    const mockClient1 = createMockClient();
    const mockClient2 = createMockClient();
    
    mockClient1.callTool.mockRejectedValue(new Error('Tool not found'));
    mockClient2.callTool.mockRejectedValue(new Error('Tool not found'));

    (mcp.Client as jest.Mock)
      .mockReturnValueOnce(mockClient1)
      .mockReturnValueOnce(mockClient2);

    const toolCall = {
      id: '1',
      function: { name: 'unknown_tool', arguments: '{}' },
    };

    const mcpServers = [
      { name: 'Server 1', url: 'http://localhost:3004', enabled: true },
      { name: 'Server 2', url: 'http://localhost:3005', enabled: true },
    ];

    const toolResult = await result.current.executeToolCall(toolCall, mcpServers);

    expect(toolResult.isError).toBe(true);
    expect(toolResult.errorMessage).toContain('not found on any MCP server');
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
    expect(convertedTools[0]).toHaveProperty('name', 'get_time');
  });
}); 
