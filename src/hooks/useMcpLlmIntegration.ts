import { llm } from '@grafana/llm';
import { useCallback } from 'react';

import { LlmMessage, McpLlmIntegration, McpServerConfig, McpTool } from '@/types';

import { useMcpService } from './useMcpService';

/**
 * Custom hook for MCP + LLM integration
 *
 * Provides functionality for integrating MCP tools with LLM chat completions,
 * following the complete agent pattern from Grafana documentation.
 *
 * @param addErrorMessage - Optional function to add error messages to chat
 * @returns Object with MCP + LLM integration functions
 */
export const useMcpLlmIntegration = (addErrorMessage?: (message: string) => void): McpLlmIntegration => {
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

      /**
       * Check MCP Status
       */
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
                // eslint-disable-next-line @typescript-eslint/naming-convention
                tool_call_id: msg.toolCallId,
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
                toolCallId: toolCall.id,
              });

              if (onToolResult) {
                onToolResult(toolCall.id, toolContent, false);
              }
            } catch (toolError) {
              const errorContent = `Error executing ${toolCall.function.name}: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`;

              messages.push({
                role: 'tool',
                content: errorContent,
                toolCallId: toolCall.id,
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
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  tool_call_id: msg.toolCallId,
                };
              }
              if (msg.role === 'assistant' && msg.toolCalls) {
                return {
                  role: msg.role,
                  content: String(msg.content),
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  tool_calls: msg.toolCalls,
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
