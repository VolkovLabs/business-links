import { mcp } from '@grafana/llm';

import { McpServerConfig } from './panel';

/**
 * MCP Tool interface
 */
export interface McpTool {
  /**
   * Name
   */
  name: string;

  /**
   * Description
   */
  description?: string;

  /**
   * Input schema
   */
  inputSchema?: Record<string, unknown>;

  /**
   * Server Name
   */
  serverName?: string;

  /**
   * Server Url
   */
  serverUrl?: string;

  [key: string]: unknown;
}

/**
 * MCP Tool Call interface
 */
export interface McpToolCall {
  /**
   * MCP tool ID
   */
  id: string;

  function: {
    /**
     * Name
     */
    name: string;

    /**
     * Arguments
     */
    arguments: string;
  };
}

/**
 * MCP Tool Result interface
 */
export interface McpToolResult {
  /**
   * Content
   */
  content: unknown;

  /**
   * Is error
   */
  isError?: boolean;

  /**
   * Error Message
   */
  errorMessage?: string;
}

/**
 * Extended LLM Message interface to support tool calls
 */
export interface ExtendedLlmMessage {
  /**
   * Role
   */
  role: 'system' | 'user' | 'assistant' | 'tool';

  /**
   * Content
   */
  content: string;

  /**
   * Tool Call Id
   */
  toolCallId?: string;
}

/**
 * LLM Response interface
 */
export interface LlmResponse {
  /**
   * Choices
   */
  choices: Array<{
    /**
     * Message
     */
    message: {
      /**
       * Content
       */
      content?: string;

      /**
       * Tool calls
       */
      toolCalls?: McpToolCall[];

      /**
       * Role
       */
      role?: string;
    };
  }>;
}

/**
 * OpenAI Tool interface
 */
export interface OpenAiTool {
  /**
   * Type
   */
  type: string;

  /**
   * Function
   */
  function: {
    /**
     * Name
     */
    name: string;

    /**
     * Description
     */
    description?: string;

    /**
     * Parameters
     */
    parameters?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

/**
 * MCP Client with server info and cached tools
 */
export interface McpClientWithServer {
  /**
   * Client
   */
  client: InstanceType<typeof mcp.Client>;

  /**
   * Server
   */
  server: McpServerConfig;

  /**
   * Available
   */
  availableTools?: string[];
}

/**
 * Cached MCP state
 */
export interface CachedMcpState {
  /**
   * Clients
   */
  clients: McpClientWithServer[];

  /**
   * Tools
   */
  tools: McpTool[];

  /**
   * Config hash
   */
  configHash: string;

  /**
   * Last update
   */
  lastUpdated: number;
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
  executeToolCall: (
    toolCall: McpToolCall,
    mcpServers?: McpServerConfig[],
    useDefaultGrafanaMcp?: boolean
  ) => Promise<McpToolResult>;

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

  /**
   * Clear cached MCP state and force reconnection
   */
  clearCache: () => void;
}
