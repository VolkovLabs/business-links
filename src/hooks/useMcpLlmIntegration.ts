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
}

/**
 * MCP LLM Integration Return interface
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
   * Check if MCP and LLM are available
   */
  checkAvailability: () => Promise<{ isAvailable: boolean; error?: string }>;

  /**
   * Get available tools
   */
  getAvailableTools: (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean) => Promise<McpTool[]>;
}

/**
 * Custom hook for MCP + LLM integration with multiple servers
 *
 * Provides functionality for using MCP tools with LLM requests,
 * following the complete agent pattern from Grafana documentation.
 *
 * @returns Object with MCP + LLM integration functions
 */
export const useMcpLlmIntegration = (): UseMcpLlmIntegrationReturn => {
  const mcpService = useMcpService();

  /**
   * Check if MCP and LLM are available
   */
  const checkAvailability = useCallback(async (): Promise<{ isAvailable: boolean; error?: string }> => {
    try {
      // Check if LLM service is available and enabled
      const llmEnabled = await llm.enabled();
      if (!llmEnabled) {
        return { isAvailable: false, error: 'LLM service is not configured or enabled' };
      }

      // Check if MCP service is available and enabled
      const mcpStatus = await mcpService.checkMcpStatus();
      if (!mcpStatus.isAvailable) {
        return { isAvailable: false, error: mcpStatus.error || 'MCP service is not enabled or configured' };
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
   * Get available tools
   */
  const getAvailableTools = useCallback(async (mcpServers?: McpServerConfig[], useDefaultGrafanaMcp?: boolean): Promise<McpTool[]> => {
    return mcpService.getAvailableTools(mcpServers, useDefaultGrafanaMcp);
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
          .filter(msg => {
            if (msg.role === 'assistant') {
              return true;
            }
            return msg.content != null && msg.content !== '';
          })
          .map(msg => {
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

        // Send initial request with tools available
        
        let response = await llm.chatCompletions({
          model: llm.Model.BASE,
          messages: openAiMessages,
          tools,
        });

        // Process any tool calls the LLM wants to make
        while (response.choices[0].message.tool_calls) {
          // Add the LLM's response (with tool calls) to the conversation
          const assistantMessage: LlmMessage = {
            role: 'assistant',
            content: response.choices[0].message.content || '',
            toolCallId: undefined,
          };
          messages.push(assistantMessage);

          // Execute each tool call the LLM requested
          for (const toolCall of response.choices[0].message.tool_calls) {
            try {
              // Use the MCP service to execute the tool call across all servers
              const result = await mcpService.executeToolCall(toolCall, mcpServers, useDefaultGrafanaMcp);

              const toolContent = JSON.stringify(result.content || '');

              // Always add tool response, even if content is empty
              messages.push({
                role: 'tool',
                content: toolContent,
                toolCallId: toolCall.id, // eslint-disable-line @typescript-eslint/naming-convention
              });

              // Call callback if provided
              if (onToolResult) {
                onToolResult(toolCall.id, toolContent, false);
              }
            } catch (toolError) {
              const errorContent = `Error executing ${toolCall.function.name}: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`;

              // eslint-disable-next-line no-console
              console.error(`Tool call failed: ${errorContent}`);

              // Always add error response
              messages.push({
                role: 'tool',
                content: errorContent,
                toolCallId: toolCall.id, // eslint-disable-line @typescript-eslint/naming-convention
              });

              // Call callback if provided
              if (onToolResult) {
                onToolResult(toolCall.id, errorContent, true);
              }
            }
          }

          // Convert updated messages to OpenAI format for the next request
          const updatedOpenAiMessages = messages
            .filter(msg => {
              // Keep all assistant messages
              if (msg.role === 'assistant') {
                return true;
              }
              // Keep all tool messages (they must have responses)
              if (msg.role === 'tool') {
                return true;
              }
              // Filter out other messages with null/undefined content
              return msg.content != null && msg.content !== '';
            })
            .map(msg => {
              if (msg.role === 'tool' && msg.toolCallId) {
                return {
                  role: msg.role,
                  content: String(msg.content || ''), // Ensure content is string, use empty string if null
                  tool_call_id: msg.toolCallId, // eslint-disable-line @typescript-eslint/naming-convention
                };
              }
              if (msg.role === 'assistant') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const messageObj: any = {
                  role: msg.role,
                  content: String(msg.content || ''), // Ensure content is string
                };
                // Only include tool_calls for the most recent assistant message
                if (msg === assistantMessage && response.choices[0].message.tool_calls) {
                  messageObj.tool_calls = response.choices[0].message.tool_calls;
                }
                return messageObj;
              }
              return {
                role: msg.role,
                content: String(msg.content || ''), // Ensure content is string
              };
            });

          // Get the LLM's response incorporating tool call results
          response = await llm.chatCompletions({
            model: llm.Model.BASE,
            messages: updatedOpenAiMessages,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools: tools as any,
          });
        }

        return response.choices[0].message.content || 'No response received';
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to use MCP with LLM:', error);
        throw new Error(`MCP + LLM request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [mcpService]
  );

  return {
    sendMessageWithTools,
    checkAvailability,
    getAvailableTools,
  };
}; 
