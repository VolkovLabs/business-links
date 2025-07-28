import React, { useCallback, useState } from 'react';
import { useMcpService, useMcpLlmIntegration } from '@/hooks';
import { ChatMessage } from '@/types';

/**
 * Example component showing how to use the new error handling functionality
 */
export const ErrorHandlingExample: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /**
   * Function to add error messages to chat
   */
  const addErrorMessage = useCallback((errorText: string) => {
    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      sender: 'system',
      text: errorText,
      timestamp: new Date(),
      isStreaming: false,
      isError: true,
    };
    setMessages(prev => [...prev, errorMessage]);
  }, []);

  // Pass addErrorMessage to both hooks
  const mcpService = useMcpService(addErrorMessage);
  const mcpLlmIntegration = useMcpLlmIntegration(addErrorMessage);

  /**
   * Example function to test MCP connection
   */
  const testMcpConnection = async () => {
    try {
      // This will show errors in chat if connection fails
      const clients = await mcpService.setupMcpClients([
        { name: 'Test Server', url: 'http://invalid-url:3000', enabled: true }
      ]);
      console.log('Connected clients:', clients.length);
    } catch (error) {
      // Errors are already handled by addErrorMessage
      console.log('Connection test completed');
    }
  };

  /**
   * Example function to test tool execution
   */
  const testToolExecution = async () => {
    try {
      const tools = await mcpService.getAvailableTools();
      console.log('Available tools:', tools.length);
    } catch (error) {
      // Errors are already handled by addErrorMessage
      console.log('Tool test completed');
    }
  };

  return (
    <div>
      <h2>Error Handling Example</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testMcpConnection}>
          Test MCP Connection (will show errors in chat)
        </button>
        <button onClick={testToolExecution} style={{ marginLeft: '10px' }}>
          Test Tool Execution (will show errors in chat)
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'auto' }}>
        <h3>Chat Messages:</h3>
        {messages.length === 0 ? (
          <p>No messages yet. Click the buttons above to test error handling.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: '10px',
                padding: '8px',
                backgroundColor: message.isError ? '#ffebee' : '#f5f5f5',
                borderLeft: message.isError ? '4px solid #f44336' : '4px solid #4caf50',
              }}
            >
              <strong>{message.sender}:</strong> {message.text}
              <br />
              <small>{message.timestamp.toLocaleTimeString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ErrorHandlingExample; 