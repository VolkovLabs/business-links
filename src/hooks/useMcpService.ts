import { mcp } from '@grafana/llm';
import { useCallback, useRef } from 'react';

import { McpServerConfig } from '@/types';

/**
 * MCP Tool interface
 */
export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  serverName?: string;
  serverUrl?: string;
  [key: string]: unknown; // Allow additional properties
}

/**
 * MCP Tool Call interface
 */
export interface McpToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * MCP Tool Result interface
 */
export interface McpToolResult {
  content: unknown;
  isError?: boolean;
  errorMessage?: string;
}

/**
 * Extended LLM Message interface to support tool calls
 */
export interface ExtendedLlmMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string; // eslint-disable-line @typescript-eslint/naming-convention
}

/**
 * LLM Response interface
 */
export interface LlmResponse {
  choices: Array<{
    message: {
      content?: string;
      toolCalls?: McpToolCall[]; // eslint-disable-line @typescript-eslint/naming-convention
      role?: string;
    };
  }>;
}

/**
 * OpenAI Tool interface
 */
export interface OpenAiTool {
  type: string;
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
  [key: string]: unknown; // Allow additional properties
}

/**
 * MCP Client with server info
 */
interface McpClientWithServer {
  client: InstanceType<typeof mcp.Client>;
  server: McpServerConfig;
}

/**
 * MCP Service Return interface
 */
export interface UseMcpServiceReturn {
  /**
   * Check if MCP is available
   */
  checkMcpStatus: () => Promise<{ isAvailable: boolean; error?: string }>;

  /**
   * Setup MCP clients for multiple servers
   */
  setupMcpClients: (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean) => Promise<McpClientWithServer[]>;

  /**
   * Get available tools from all MCP servers
   */
  getAvailableTools: (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean) => Promise<McpTool[]>;

  /**
   * Execute MCP tool call across multiple servers
   */
  executeToolCall: (toolCall: McpToolCall, mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean) => Promise<McpToolResult>;

  /**
   * Process LLM response with tool calls
   */
  processToolCalls: (
    response: LlmResponse,
    messages: ExtendedLlmMessage[],
    addToolResult: (toolCallId: string, content: string, isError?: boolean) => void,
    mcpServers?: McpServerConfig[],
    useDefaultGrafanaMcp?: boolean
  ) => Promise<{ hasMoreToolCalls: boolean; updatedMessages: ExtendedLlmMessage[] }>;

  /**
   * Convert MCP tools to OpenAI format
   */
  convertToolsToOpenAiFormat: (tools: McpTool[]) => OpenAiTool[];
}

/**
 * Custom hook for MCP service integration with multiple servers
 *
 * Provides functionality for interacting with multiple MCP servers,
 * including tool discovery, execution, and integration with LLM.
 *
 * @returns Object with MCP service functions
 */
export const useMcpService = (): UseMcpServiceReturn => {
  const mcpClientsRef = useRef<McpClientWithServer[] | null>(null);

  /**
   * Checks if MCP service is available
   * @returns Promise with MCP availability status
   */
  const checkMcpStatus = useCallback(async (): Promise<{ isAvailable: boolean; error?: string }> => {
    try {
      // Always use local MCP server
      return { isAvailable: true };
    } catch (error) {
      return {
        isAvailable: false,
        error: `MCP status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }, []);

  /**
   * Gets enabled MCP servers from configuration
   * @param mcpServers - Array of configured MCP servers
   * @param useDefaultGrafanaMcp - Whether to use default Grafana MCP server
   * @returns Array of enabled servers
   */
  const getEnabledServers = useCallback((mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): McpServerConfig[] => {
    const enabledCustomServers = mcpServers?.filter(server => server.enabled) || [];
    
    // If no custom servers and default Grafana MCP is disabled, return empty array
    if (enabledCustomServers.length === 0 && !useDefaultGrafanaMcp) {
      return [];
    }
    
    // Return enabled custom servers (default Grafana MCP will be added separately if enabled)
    return enabledCustomServers;
  }, []);

  /**
   * Sets up MCP clients for multiple servers
   * @param mcpServers - Array of configured MCP servers
   * @param useDefaultGrafanaMcp - Whether to use default Grafana MCP server
   * @returns Promise with array of MCP clients with server info
   */
  const setupMcpClients = useCallback(async (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): Promise<McpClientWithServer[]> => {
    try {
      mcpClientsRef.current = null;
      
      const enabledServers = getEnabledServers(mcpServers, useDefaultGrafanaMcp);
      
      const clients: McpClientWithServer[] = [];

      if (useDefaultGrafanaMcp) {
        try {
          const defaultClient = new mcp.Client({
            name: 'volkovlabs-links-panel',
            version: '2.1.0',
          });
          const transport = new mcp.StreamableHTTPClientTransport(mcp.streamableHTTPURL());
          await defaultClient.connect(transport);
          
          clients.push({
            client: defaultClient,
            server: {
              name: 'Default Grafana MCP',
              url: mcp.streamableHTTPURL().toString(),
              enabled: true,
            },
          });
          
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to connect to default Grafana MCP server:', error);
        }
      }

      // Create clients for all enabled custom servers
      for (const server of enabledServers) {
        try {
          const client = new mcp.Client({
            name: 'volkovlabs-links-panel',
            version: '2.1.0',
          });
          const transport = new mcp.StreamableHTTPClientTransport(new URL(server.url));
          await client.connect(transport);
          
          clients.push({ client, server });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to connect to MCP server ${server.name}:`, error);
          // Continue with other servers
        }
      }

      mcpClientsRef.current = clients;
      return mcpClientsRef.current;
    } catch (error) {
      throw new Error(`Failed to setup MCP clients: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [getEnabledServers]);

  /**
   * Gets available tools from all MCP servers
   * @param mcpServers - Array of configured MCP servers
   * @param useDefaultGrafanaMcp - Whether to use default Grafana MCP server
   * @returns Promise with array of available tools from all servers
   */
  const getAvailableTools = useCallback(async (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): Promise<McpTool[]> => {
    try {
      const clients = await setupMcpClients(mcpServers, useDefaultGrafanaMcp);
      
      const allTools: McpTool[] = [];

      for (const { client, server } of clients) {
        try {
          const toolsResponse = await client.listTools();
          const tools = toolsResponse.tools || [];
          
          const toolsWithServer = tools.map((tool: McpTool) => ({
            ...tool,
            serverName: server.name,
            serverUrl: server.url,
          }));
          
          allTools.push(...toolsWithServer);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to get tools from server ${server.name}:`, error);
        }
      }

      return allTools;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to get MCP tools:', error);
      return [];
    }
  }, [setupMcpClients]);

  /**
   * Executes a single MCP tool call across multiple servers
   * @param toolCall - Tool call to execute
   * @param mcpServers - Array of configured MCP servers
   * @param useDefaultGrafanaMcp - Whether to use default Grafana MCP server
   * @returns Promise with tool execution result
   */
  const executeToolCall = useCallback(async (toolCall: McpToolCall, mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): Promise<McpToolResult> => {
    try {
      const clients = await setupMcpClients(mcpServers, useDefaultGrafanaMcp);
      
      for (const { client, server } of clients) {
        try {
          const result = await client.callTool({
            name: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments),
          });

          return {
            content: result.content,
            isError: false,
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`Tool execution failed on server ${server.name}:`, error);
          continue;
        }
      }

      throw new Error(`Tool '${toolCall.function.name}' not found on any MCP server`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`MCP tool call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // eslint-disable-next-line no-console
      console.error(`Full error:`, error);
      return {
        content: null,
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [setupMcpClients]);

  /**
   * Processes LLM response with tool calls
   * @param response - LLM response
   * @param messages - Current conversation messages
   * @param addToolResult - Function to add tool results to chat
   * @param mcpServers - Array of configured MCP servers
   * @param useDefaultGrafanaMcp - Whether to use default Grafana MCP server
   * @returns Promise with processing result
   */
  const processToolCalls = useCallback(
    async (
      response: LlmResponse,
      messages: ExtendedLlmMessage[],
      addToolResult: (toolCallId: string, content: string, isError?: boolean) => void,
      mcpServers?: McpServerConfig[],
      useDefaultGrafanaMcp?: boolean
    ): Promise<{ hasMoreToolCalls: boolean; updatedMessages: ExtendedLlmMessage[] }> => {
      const updatedMessages = [...messages];

      if (!response.choices?.[0]?.message?.toolCalls) {
        return { hasMoreToolCalls: false, updatedMessages };
      }

      updatedMessages.push({
        role: 'assistant',
        content: response.choices[0].message.content || '',
        ...response.choices[0].message,
      } as ExtendedLlmMessage);

      for (const toolCall of response.choices[0].message.toolCalls) {
        try {
          const result = await executeToolCall(toolCall, mcpServers, useDefaultGrafanaMcp);
          
          const toolContent = result.isError
            ? `Error executing ${toolCall.function.name}: ${result.errorMessage}`
            : JSON.stringify(result.content);

          updatedMessages.push({
            role: 'tool',
            content: toolContent,
            toolCallId: toolCall.id, // eslint-disable-line @typescript-eslint/naming-convention
          } as ExtendedLlmMessage);

          addToolResult(toolCall.id, toolContent, result.isError);
        } catch (error) {
          const errorContent = `Error executing ${toolCall.function.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          
          updatedMessages.push({
            role: 'tool',
            content: errorContent,
            toolCallId: toolCall.id, // eslint-disable-line @typescript-eslint/naming-convention
          } as ExtendedLlmMessage);

          addToolResult(toolCall.id, errorContent, true);
        }
      }

      return { hasMoreToolCalls: true, updatedMessages };
    },
    [executeToolCall]
  );

  /**
   * Converts MCP tools to OpenAI format
   * @param tools - MCP tools array
   * @returns Tools in OpenAI format
   */
  const convertToolsToOpenAiFormat = useCallback((tools: McpTool[]): OpenAiTool[] => {
    try {
      const cleanTools = tools.map(tool => {
        const { serverName, serverUrl, ...cleanTool } = tool;
        return cleanTool;
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mcp.convertToolsToOpenAI(cleanTools as any) as OpenAiTool[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to convert MCP tools to OpenAI format:', error);
      return [];
    }
  }, []);

  return {
    checkMcpStatus,
    setupMcpClients,
    getAvailableTools,
    executeToolCall,
    processToolCalls,
    convertToolsToOpenAiFormat,
  };
}; 
