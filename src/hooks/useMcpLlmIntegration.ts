import { llm } from '@grafana/llm';
import { useCallback } from 'react';

import { McpServerConfig } from '@/types';

import { type McpTool, useMcpService } from './useMcpService';

/**
 * LLM Message interface
 */
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null | undefined;
  toolCallId?: string;
  /**
   * Add tool_calls for assistant messages
   */
  toolCalls?: any[]; //
}

/**
 * MCP + LLM Integration Return interface
 */
export interface UseMcpLlmIntegrationReturn {
  /**
   * Send message with MCP tools support
   */
  sendMessageWithTools: (
    messages: LlmMessage[],
    onToolResult?: (toolCallId: string, content: string, isError?: boolean) => void,
    mcpServers?: McpServerConfig[],
    useDefaultGrafanaMcp?: boolean
  ) => Promise<string>;

  /**
   * Check if MCP + LLM integration is available
   */
  checkAvailability: () => Promise<{ isAvailable: boolean; error?: string }>;

  /**
   * Get available tools from MCP servers
   */
  getAvailableTools: (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean) => Promise<McpTool[]>;

  /**
   * Clear MCP cache and force reconnection to servers
   */
  clearMcpCache: () => void;
}

/**
 * Custom hook for MCP + LLM integration
 *
 * Provides functionality for integrating MCP tools with LLM chat completions,
 * following the complete agent pattern from Grafana documentation.
 *
 * @param addErrorMessage - Optional function to add error messages to chat
 * @returns Object with MCP + LLM integration functions
 */
export const useMcpLlmIntegration = (addErrorMessage?: (message: string) => void): UseMcpLlmIntegrationReturn => {
  const mcpService = useMcpService(addErrorMessage);

  /**
   * Check if MCP + LLM integration is available
   */
  const checkAvailability = useCallback(async (): Promise<{ isAvailable: boolean; error?: string }> => {
    try {
      if (!(await llm.enabled())) {
        return {
          isAvailable: false,
          error: 'LLM is not enabled in Grafana settings',
        };
      }

      const mcpStatus = await mcpService.checkMcpStatus();
      if (!mcpStatus.isAvailable) {
        return {
          isAvailable: false,
          error: mcpStatus.error || 'MCP service is not available',
        };
      }

      return { isAvailable: true };
    } catch (error) {
      return {
        isAvailable: false,
        error: `Availability check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }, [mcpService]);

  /**
   * Get available tools from MCP servers
   */
  const getAvailableTools = useCallback(
    async (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): Promise<McpTool[]> => {
      return mcpService.getAvailableTools(mcpServers, useDefaultGrafanaMcp);
    },
    [mcpService]
  );

  /**
   * Clear MCP cache and force reconnection to servers
   */
  const clearMcpCache = useCallback(() => {
    mcpService.clearCache();
  }, [mcpService]);

  /**
   * Send message with MCP tools support
   */
  const sendMessageWithTools = useCallback(
    async (
      messages: LlmMessage[],
      onToolResult?: (toolCallId: string, content: string, isError?: boolean) => void,
      mcpServers?: McpServerConfig[],
      useDefaultGrafanaMcp?: boolean
    ): Promise<string> => {
      try {
        const allTools = await mcpService.getAvailableTools(mcpServers, useDefaultGrafanaMcp);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tools = mcpService.convertToolsToOpenAiFormat(allTools) as any;

        const openAiMessages = messages
          .filter((msg) => {
            /**
             * Always include assistant messages (they may have tool_calls)
             */
            if (msg.role === 'assistant') {
              return true;
            }

            /**
             * For other roles, ensure they have valid content
             */
            return msg.content != null && msg.content !== '';
          })
          .map((msg) => {
            if (msg.role === 'tool' && msg.toolCallId) {
              return {
                role: msg.role,
                content: String(msg.content),
                tool_call_id: msg.toolCallId, // eslint-disable-line @typescript-eslint/naming-convention
              };
            }
            return {
              role: msg.role,
              content: String(msg.content),
            };
          });

        let response = await llm.chatCompletions({
          model: llm.Model.BASE,
          messages: openAiMessages,
          tools,
        });

        while (response.choices[0].message.tool_calls) {
          /**
           * Add the assistant message with tool_calls
           */
          const assistantMessage: LlmMessage = {
            role: 'assistant',
            content: response.choices[0].message.content || null,
            toolCallId: undefined,
            /**
             * Store tool_calls in the message
             */
            toolCalls: response.choices[0].message.tool_calls,
          };
          messages.push(assistantMessage);

          for (const toolCall of response.choices[0].message.tool_calls) {
            try {
              const result = await mcpService.executeToolCall(toolCall, mcpServers, useDefaultGrafanaMcp);

              const toolContent = JSON.stringify(result.content || '');

              messages.push({
                role: 'tool',
                content: toolContent,
                toolCallId: toolCall.id, // eslint-disable-line @typescript-eslint/naming-convention
              });

              if (onToolResult) {
                onToolResult(toolCall.id, toolContent, false);
              }
            } catch (toolError) {
              const errorContent = `Error executing ${toolCall.function.name}: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`;

              messages.push({
                role: 'tool',
                content: errorContent,
                toolCallId: toolCall.id, // eslint-disable-line @typescript-eslint/naming-convention
              });

              if (onToolResult) {
                onToolResult(toolCall.id, errorContent, true);
              }
            }
          }

          const updatedOpenAiMessages = messages
            .filter((msg) => {
              /**
               * Always include assistant messages (they may have tool_calls)
               */
              if (msg.role === 'assistant') {
                return true;
              }

              /**
               * For other roles, ensure they have valid content
               */
              return msg.content != null && msg.content !== '';
            })
            .map((msg) => {
              if (msg.role === 'tool' && msg.toolCallId) {
                return {
                  role: msg.role,
                  content: String(msg.content),
                  tool_call_id: msg.toolCallId, // eslint-disable-line @typescript-eslint/naming-convention
                };
              }
              if (msg.role === 'assistant' && msg.toolCalls) {
                return {
                  role: msg.role,
                  content: String(msg.content),
                  tool_calls: msg.toolCalls, // eslint-disable-line @typescript-eslint/naming-convention
                };
              }
              return {
                role: msg.role,
                content: String(msg.content),
              };
            });

          response = await llm.chatCompletions({
            model: llm.Model.BASE,
            messages: updatedOpenAiMessages,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools: tools as any,
          });
        }

        return response.choices[0].message.content || 'No response received';
      } catch (error) {
        const errorMessage = `Failed to use MCP with LLM: ${error instanceof Error ? error.message : 'Unknown error'}`;
        if (addErrorMessage) {
          addErrorMessage(errorMessage);
        }

        throw new Error(`MCP + LLM request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [mcpService, addErrorMessage]
  );

  return {
    sendMessageWithTools,
    checkAvailability,
    getAvailableTools,
    clearMcpCache,
  };
};
