import { mcp } from '@grafana/llm';
import { useCallback, useRef } from 'react';

import {
  CachedMcpState,
  ExtendedLlmMessage,
  LlmResponse,
  McpClientWithServer,
  McpServerConfig,
  McpTool,
  McpToolCall,
  McpToolResult,
  OpenAiTool,
  UseMcpServiceReturn,
} from '@/types';
import { clearMcpCache, prepareToolContent, timeoutError } from '@/utils';

/**
 * Generate hash from server configuration to detect changes
 */
const generateConfigHash = (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): string => {
  const config = {
    servers: mcpServers?.filter((s) => s.enabled).map((s) => ({ name: s.name, url: s.url })) || [],
    useDefault: useDefaultGrafanaMcp || false,
  };
  return JSON.stringify(config);
};

/**
 * Custom hook for MCP service integration with multiple servers
 *
 * Provides functionality for interacting with multiple MCP servers,
 * including tool discovery, execution, and integration with LLM.
 * Includes intelligent caching to avoid unnecessary reconnections and tool queries.
 *
 * @param addErrorMessage - Optional function to add error messages to chat
 * @returns Object with MCP service functions
 */
export const useMcpService = (addErrorMessage?: (message: string) => void): UseMcpServiceReturn => {
  const mcpCacheRef = useRef<CachedMcpState | null>(null);

  /**
   * Checks if MCP service is available
   * @returns Promise with MCP availability status
   */
  const checkMcpStatus = useCallback(async (): Promise<{ isAvailable: boolean; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'test' && process.env.THROW_MCP_ERROR === 'true') {
        throw new Error('Test MCP error');
      }
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
  const getEnabledServers = useCallback(
    (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): McpServerConfig[] => {
      const enabledCustomServers = mcpServers?.filter((server) => server.enabled) || [];

      if (enabledCustomServers.length === 0 && !useDefaultGrafanaMcp) {
        return [];
      }

      return enabledCustomServers;
    },
    []
  );

  /**
   * Clear cached MCP state and force reconnection
   */
  const clearCache = useCallback(() => {
    clearMcpCache(mcpCacheRef);
  }, []);

  /**
   * Sets up MCP clients for multiple servers with caching
   * @param mcpServers - Array of configured MCP servers
   * @param useDefaultGrafanaMcp - Whether to use default Grafana MCP server
   * @returns Promise with array of MCP clients with server info
   */
  const setupMcpClients = useCallback(
    async (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): Promise<McpClientWithServer[]> => {
      try {
        const configHash = generateConfigHash(mcpServers, useDefaultGrafanaMcp);
        const now = Date.now();
        const cacheTimeout = 5 * 60 * 1000;
        if (mcpCacheRef.current?.configHash === configHash && now - mcpCacheRef.current.lastUpdated < cacheTimeout) {
          return mcpCacheRef.current.clients;
        }

        if (mcpCacheRef.current?.configHash !== configHash) {
          clearCache();
        }

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

            let availableTools: string[] = [];
            try {
              const toolsResponse = await defaultClient.listTools();
              availableTools = toolsResponse.tools?.map((tool: McpTool) => tool.name) || [];
            } catch {
              availableTools = [];
            }

            clients.push({
              client: defaultClient,
              server: {
                name: 'Default Grafana MCP',
                url: mcp.streamableHTTPURL().toString(),
                enabled: true,
              },
              availableTools,
            });
          } catch (error) {
            const errorMessage = `Failed to connect to default Grafana MCP server: ${error instanceof Error ? error.message : 'Unknown error'}`;
            if (addErrorMessage) {
              addErrorMessage(errorMessage);
            }
          }
        }

        for (const server of enabledServers) {
          try {
            const client = new mcp.Client({
              name: 'volkovlabs-links-panel',
              version: '2.1.0',
            });

            let serverUrl: URL;
            try {
              serverUrl = new URL(server.url);
            } catch {
              throw new Error(`Invalid URL for server ${server.name}: ${server.url}`);
            }

            const transport = new mcp.StreamableHTTPClientTransport(serverUrl);
            await client.connect(transport);

            let availableTools: string[] = [];
            try {
              const toolsResponse = await client.listTools();
              availableTools = toolsResponse.tools?.map((tool: McpTool) => tool.name) || [];
            } catch {
              availableTools = [];
            }

            clients.push({ client, server, availableTools });
          } catch (error) {
            const errorMessage = `Failed to connect to MCP server ${server.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            if (addErrorMessage) {
              addErrorMessage(errorMessage);
            }

            if (error instanceof Error && error.message.includes('Invalid URL')) {
              throw error;
            }
          }
        }

        mcpCacheRef.current = {
          clients,
          tools: [],
          configHash,
          lastUpdated: now,
        };
        return clients;
      } catch (error) {
        const errorMessage = `Failed to setup MCP clients: ${error instanceof Error ? error.message : 'Unknown error'}`;
        if (addErrorMessage) {
          addErrorMessage(errorMessage);
        }
        throw new Error(errorMessage);
      }
    },
    [getEnabledServers, addErrorMessage, clearCache]
  );

  /**
   * Gets available tools from all MCP servers with caching
   * @param mcpServers - Array of configured MCP servers
   * @param useDefaultGrafanaMcp - Whether to use default Grafana MCP server
   * @returns Promise with array of available tools from all servers
   */
  const getAvailableTools = useCallback(
    async (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): Promise<McpTool[]> => {
      try {
        const configHash = generateConfigHash(mcpServers, useDefaultGrafanaMcp);
        const now = Date.now();
        const cacheTimeout = 5 * 60 * 1000;

        if (
          mcpCacheRef.current?.configHash === configHash &&
          mcpCacheRef.current?.tools.length > 0 &&
          now - mcpCacheRef.current?.lastUpdated < cacheTimeout
        ) {
          return mcpCacheRef.current.tools;
        }

        const clients = await setupMcpClients(mcpServers, useDefaultGrafanaMcp);

        if (clients.length === 0) {
          const errorMessage = 'Failed to get MCP tools';
          if (addErrorMessage) {
            addErrorMessage(errorMessage);
          }
          return [];
        }

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
            const errorMessage = `Failed to get tools from server ${server.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            if (addErrorMessage) {
              addErrorMessage(errorMessage);
            }
          }
        }

        if (mcpCacheRef.current) {
          mcpCacheRef.current.tools = allTools;
          mcpCacheRef.current.lastUpdated = now;
        }

        return allTools;
      } catch (error) {
        const errorMessage = `Failed to get MCP tools: ${error instanceof Error ? error.message : 'Unknown error'}`;
        if (addErrorMessage) {
          addErrorMessage(errorMessage);
        }

        return [];
      }
    },
    [setupMcpClients, addErrorMessage]
  );

  /**
   * Executes a single MCP tool call across multiple servers using cached clients
   * @param toolCall - Tool call to execute
   * @param mcpServers - Array of configured MCP servers
   * @param useDefaultGrafanaMcp - Whether to use default Grafana MCP server
   * @returns Promise with tool execution result
   */
  const executeToolCall = useCallback(
    async (
      toolCall: McpToolCall,
      mcpServers?: McpServerConfig[],
      useDefaultGrafanaMcp?: boolean
    ): Promise<McpToolResult> => {
      try {
        const configHash = generateConfigHash(mcpServers, useDefaultGrafanaMcp);
        let clients: McpClientWithServer[];

        if (mcpCacheRef?.current?.configHash === configHash) {
          clients = mcpCacheRef.current.clients;
        } else {
          clients = await setupMcpClients(mcpServers, useDefaultGrafanaMcp);
        }

        let lastError: Error | null = null;
        const errorMessages: string[] = [];

        const serverTimeout = 10000;

        for (const { client, server, availableTools } of clients) {
          try {
            if (availableTools && !availableTools.includes(toolCall.function.name)) {
              continue;
            }

            const errorOnTimeout = timeoutError(server.name, serverTimeout);

            const result = await Promise.race([
              client.callTool({
                name: toolCall.function.name,
                arguments: JSON.parse(toolCall.function.arguments),
              }),
              errorOnTimeout,
            ]);

            return {
              content: result.content,
              isError: false,
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error && error.message.includes('timed out')
                ? `Server ${server.name} timed out (${serverTimeout}ms)`
                : `Tool execution failed on server ${server.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;

            errorMessages.push(errorMessage);
            lastError = error instanceof Error ? error : new Error('Unknown error');

            continue;
          }
        }

        if (addErrorMessage) {
          errorMessages.forEach((msg) => addErrorMessage(msg));
        }

        const serversWithTool = clients.filter(
          ({ availableTools }) => !availableTools || availableTools.includes(toolCall.function.name)
        );

        if (serversWithTool.length === 0) {
          throw new Error(`Tool '${toolCall.function.name}' is not available on any connected MCP server`);
        } else {
          throw lastError || new Error(`Tool '${toolCall.function.name}' failed on all servers that support it`);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('Failed to setup MCP clients') || error.message.includes('Invalid URL'))
        ) {
          const errorMessage = 'MCP tool call failed';
          if (addErrorMessage) {
            addErrorMessage(errorMessage);
          }
          return {
            content: null,
            isError: true,
            errorMessage: 'Failed to setup MCP clients',
          };
        }

        const errorMessage = `MCP tool call failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        if (addErrorMessage) {
          addErrorMessage(errorMessage);
        }

        return {
          content: null,
          isError: true,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    [setupMcpClients, addErrorMessage]
  );

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
          const toolContent = prepareToolContent(result, toolCall.function.name, result.errorMessage);

          updatedMessages.push({
            role: 'tool',
            content: toolContent,
            toolCallId: toolCall.id,
          } as ExtendedLlmMessage);

          addToolResult(toolCall.id, toolContent, result.isError);
        } catch (error) {
          const errorContent = `Error executing ${toolCall.function.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;

          updatedMessages.push({
            role: 'tool',
            content: errorContent,
            toolCallId: toolCall.id,
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
   * @param tools - Array of MCP tools
   * @returns Array of tools in OpenAI format
   */
  const convertToolsToOpenAiFormat = useCallback(
    (tools: McpTool[]): OpenAiTool[] => {
      try {
        return tools.map((tool) => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description || '',
            parameters: tool.inputSchema || {},
          },
        }));
      } catch (error) {
        const errorMessage = `Failed to convert MCP tools to OpenAI format: ${error instanceof Error ? error.message : 'Unknown error'}`;
        if (addErrorMessage) {
          addErrorMessage(errorMessage);
        }

        return [];
      }
    },
    [addErrorMessage]
  );

  return {
    checkMcpStatus,
    setupMcpClients,
    getAvailableTools,
    executeToolCall,
    processToolCalls,
    convertToolsToOpenAiFormat,
    clearCache,
  };
};
