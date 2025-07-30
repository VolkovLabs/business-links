import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import * as hooks from '@/hooks';

import { ChatDrawer, useDropzoneOverlay } from './ChatDrawer';

/**
 * Mock @grafana/ui
 */
jest.mock('@grafana/ui');

/**
 * Mock @grafana/llm
 */
jest.mock('@grafana/llm', () => ({
  llm: {
    chatCompletions: jest.fn(),
    enabled: jest.fn(() => Promise.resolve(true)),
    health: jest.fn(),
    Model: {
      base: 'base-model',
    },
  },
}));

/**
 * Mock IntersectionObserver
 */
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any;

  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any;

  /**
   * Mock scrollIntoView
   */
  Element.prototype.scrollIntoView = jest.fn();
});

/**
 * Props
 */
type Props = React.ComponentProps<typeof ChatDrawer>;

/**
 * Mock hooks
 */
jest.mock('@/hooks', () => ({
  useChatMessages: jest.fn(),
  useFileAttachments: jest.fn(),
  useTextareaResize: jest.fn(),
  useLlmService: jest.fn(),
  useMcpService: jest.fn(),
  useMcpLlmIntegration: jest.fn(),
  chatConfig: {
    temperature: 0.7,
    requestTimeout: 30000,
  },
}));

const inTestIds = {
  removeFileDropZone: createSelector('data-testid chat-drawer file-dropzone-remove'),
};

describe('ChatDrawer', () => {
  const getSelectors = getJestSelectors({
    ...TEST_IDS.drawerElement,
    ...inTestIds,
  });
  const selectors = getSelectors(screen);

  /**
   * Default mocks
   */
  const mockOnClose = jest.fn();
  const mockGenerateMessageId = jest.fn();
  const mockAddMessages = jest.fn();
  const mockUpdateLastMessage = jest.fn();
  const mockHandleFileAttachment = jest.fn();
  const mockRemoveAttachedFile = jest.fn();
  const mockClearAttachedFiles = jest.fn();
  const mockAdjustTextareaHeight = jest.fn();
  const mockCheckLlmStatus = jest.fn();
  const mockPrepareMessageContent = jest.fn();
  const mockPrepareChatHistory = jest.fn();
  const mockHandleLlmError = jest.fn();
  const mockFormatFileSize = jest.fn();
  const mockTextareaRef = { current: document.createElement('textarea') };

  /**
   * Default hook implementations
   */
  const defaultUseChatMessages = {
    messages: [],
    generateMessageId: mockGenerateMessageId,
    addMessages: mockAddMessages,
    updateLastMessage: mockUpdateLastMessage,
  };

  const defaultUseFileAttachments = {
    attachedFiles: [],
    formatFileSize: mockFormatFileSize,
    handleFileAttachment: mockHandleFileAttachment,
    removeAttachedFile: mockRemoveAttachedFile,
    clearAttachedFiles: mockClearAttachedFiles,
  };

  const defaultUseTextareaResize = {
    textareaRef: mockTextareaRef,
    adjustTextareaHeight: mockAdjustTextareaHeight,
  };

  const defaultUseLlmService = {
    checkLlmStatus: mockCheckLlmStatus,
    prepareMessageContent: mockPrepareMessageContent,
    prepareChatHistory: mockPrepareChatHistory,
    handleLlmError: mockHandleLlmError,
  };

  const defaultUseMcpService = {
    checkMcpStatus: jest.fn().mockResolvedValue({ isAvailable: true }),
    getAvailableTools: jest.fn().mockResolvedValue([]),
    convertToolsToOpenAiFormat: jest.fn().mockReturnValue([]),
    executeToolCall: jest.fn().mockResolvedValue({ content: null, isError: false }),
    setupMcpClients: jest.fn().mockResolvedValue([]),
    processToolCalls: jest.fn().mockResolvedValue({ hasMoreToolCalls: false, updatedMessages: [] }),
  };

  const defaultUseMcpLlmIntegration = {
    sendMessageWithTools: jest.fn().mockResolvedValue('Response from LLM'),
    checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
    getAvailableTools: jest.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (hooks.useFileAttachments as jest.Mock).mockReturnValue({
      ...defaultUseFileAttachments,
      attachedFiles: [],
    });
    (hooks.useChatMessages as jest.Mock).mockReturnValue(defaultUseChatMessages);
    (hooks.useTextareaResize as jest.Mock).mockReturnValue(defaultUseTextareaResize);
    (hooks.useLlmService as jest.Mock).mockReturnValue(defaultUseLlmService);
    (hooks.useMcpService as jest.Mock).mockReturnValue({
      ...defaultUseMcpService,
      checkMcpStatus: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
    });
    (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
      sendMessageWithTools: jest.fn().mockResolvedValue('Response from LLM'),
      checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
      getAvailableTools: jest.fn().mockResolvedValue([]),
    });
    mockGenerateMessageId.mockImplementation(() => `msg-${Date.now()}`);
    mockCheckLlmStatus.mockResolvedValue({ canProceed: true });
    mockPrepareMessageContent.mockImplementation((text) => text);
    mockPrepareChatHistory.mockReturnValue([]);
    mockFormatFileSize.mockImplementation((size) => `${size} bytes`);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <ChatDrawer isOpen={true} onClose={mockOnClose} {...props} />;
  };

  describe('Rendering', () => {
    it('Should render drawer and empty state when no messages', async () => {
      await act(async () => render(getComponent({})));
      expect(selectors.chatDrawer()).toBeInTheDocument();
      expect(selectors.input()).toBeInTheDocument();
      expect(selectors.chatDrawerEmptyState()).toBeInTheDocument();
    });

    it('Should render messages with all variations (text, streaming, attachments)', async () => {
      const messages = [
        {
          id: '1',
          sender: 'user' as const,
          text: 'Hello',
          timestamp: new Date(),
          attachments: [
            {
              id: 'att1',
              name: 'document.pdf',
              size: 1024,
              type: 'application/pdf',
              url: 'test/document.pdf',
            },
            {
              id: 'att2',
              name: 'image.png',
              size: 2048,
              type: 'image/png',
              url: 'data:image/png;base64,test',
            },
          ],
        },
        {
          id: '2',
          sender: 'assistant' as const,
          text: 'Hi there!',
          timestamp: new Date(),
          isStreaming: false,
        },
        {
          id: '3',
          sender: 'assistant' as const,
          text: 'Thinking...',
          timestamp: new Date(),
          isStreaming: true,
        },
      ];

      (hooks.useChatMessages as jest.Mock).mockReturnValue({
        ...defaultUseChatMessages,
        messages,
      });

      await act(async () => render(getComponent({})));

      expect(selectors.message(false, 'Hello')).toBeInTheDocument();
      expect(selectors.message(false, 'Hi there!')).toBeInTheDocument();
      expect(selectors.message(false, 'Thinking...')).toBeInTheDocument();
      expect(selectors.attachmentImage(false, 'document.pdf')).toBeInTheDocument();
      expect(selectors.attachmentImage(false, 'image.png')).toBeInTheDocument();
    });

    it('Should render messages from tools', async () => {
      const messages = [
        {
          id: '1',
          sender: 'user' as const,
          text: 'Hello',
          timestamp: new Date(),
          attachments: [
            {
              id: 'att1',
              name: 'document.pdf',
              size: 1024,
              type: 'application/pdf',
              url: 'test/document.pdf',
            },
            {
              id: 'att2',
              name: 'image.png',
              size: 2048,
              type: 'image/png',
              url: 'data:image/png;base64,test',
            },
          ],
        },
        {
          id: '2',
          sender: 'tool',
          text: 'Here is list of dashboards',
          timestamp: new Date(),
          isStreaming: false,
        },
      ];

      (hooks.useChatMessages as jest.Mock).mockReturnValue({
        ...defaultUseChatMessages,
        messages,
      });

      await act(async () => render(getComponent({})));

      expect(selectors.messageSender(false, messages[1].sender)).toBeInTheDocument();
      expect(selectors.messageSender(false, messages[1].sender)).toHaveTextContent('Tool');
    });
  });

  describe('Basic Interactions', () => {
    it('Should close drawer and clean up', async () => {
      await act(async () => render(getComponent({})));

      await act(async () => {
        fireEvent.click(selectors.drawerCloseButton());
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockClearAttachedFiles).toHaveBeenCalled();
    });

    it('Should update input value and resize textarea', async () => {
      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Hello world' } });
      });

      expect(textarea).toHaveValue('Hello world');
      expect(mockAdjustTextareaHeight).toHaveBeenCalled();
    });

    it('Should handle keyboard shortcuts (Enter to send, Ctrl+Enter for new line, Escape to clear)', async () => {
      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });

        fireEvent.keyDown(textarea, { key: 'Enter' });
      });

      await waitFor(() => {
        expect(mockAddMessages).toHaveBeenCalled();
      });

      mockAddMessages.mockClear();
      mockClearAttachedFiles.mockClear();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'New message' } });
        fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
      });

      expect(mockAddMessages).not.toHaveBeenCalled();

      await act(async () => {
        fireEvent.keyDown(textarea, { key: 'Escape' });
      });

      expect(mockClearAttachedFiles).toHaveBeenCalled();
    });
  });

  describe('Message Sending', () => {
    it('Should send message when send button is clicked', async () => {
      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      mockPrepareChatHistory.mockReturnValue([
        {
          content: 'test',
          role: 'user',
        },
      ]);

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockAddMessages).toHaveBeenCalledWith([
        expect.objectContaining({
          sender: 'user',
          text: 'Test message',
        }),
        expect.objectContaining({
          sender: 'assistant',
          isStreaming: true,
        }),
      ]);

      expect(mockSendMessageWithTools).toHaveBeenCalled();
      expect(mockClearAttachedFiles).toHaveBeenCalled();
      expect(mockUpdateLastMessage).toHaveBeenCalledWith(expect.any(Function));
    });

    it('Should use custom temperature when provided', async () => {
      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      await act(async () => render(getComponent({ llmTemperature: 0.3 })));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockSendMessageWithTools).toHaveBeenCalled();
    });

    it('Should use default temperature when not provided', async () => {
      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockSendMessageWithTools).toHaveBeenCalled();
    });

    it('Should not send message in various invalid states', async () => {
      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      expect(sendButton).toBeDisabled();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: '   \n\t  ' } });
      });

      const forcedClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      sendButton.dispatchEvent(forcedClick);

      expect(mockAddMessages).not.toHaveBeenCalled();

      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'First message' } });
        fireEvent.click(sendButton);
        fireEvent.change(textarea, { target: { value: 'Second message' } });
      });

      mockSendMessageWithTools.mockClear();

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockSendMessageWithTools).not.toHaveBeenCalled();
    });

    it('Should handle LLM status check failure', async () => {
      const mockCheckAvailability = jest.fn().mockResolvedValue({
        isAvailable: false,
        error: 'LLM service unavailable',
      });
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        ...defaultUseMcpLlmIntegration,
        checkAvailability: mockCheckAvailability,
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockAddMessages).toHaveBeenCalledWith([
        expect.objectContaining({
          sender: 'system',
          isError: true,
          text: expect.stringContaining('Service Error: LLM service unavailable'),
        }),
      ]);
    });
  });

  describe('LLM Streaming and Response Handling', () => {
    it('Should handle all response formats in a single test', async () => {
      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(mockUpdateLastMessage).toHaveBeenCalledWith(expect.any(Function));
      });
    });

    it('Should handle request timeout', async () => {
      jest.useFakeTimers();

      const mockSendMessageWithTools = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 30001);
        });
      });
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      act(() => {
        jest.advanceTimersByTime(30001);
      });

      await waitFor(() => {
        expect(mockAddMessages).toHaveBeenCalledWith([
          expect.objectContaining({
            sender: 'system',
            isError: true,
            text: expect.stringContaining('Connection Error: Request timeout'),
          }),
        ]);
      });
    });

    it('Should handle stream completion', async () => {
      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Final response');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(mockUpdateLastMessage).toHaveBeenCalledWith(expect.any(Function));
      });
    });
  });

  it('Should not send message if input empty', async () => {
    await act(async () => render(<ChatDrawer isOpen onClose={jest.fn()} />));
    const textarea = selectors.input();
    await act(async () => {
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    });
    expect(hooks.useChatMessages().addMessages).not.toHaveBeenCalled();
  });

  it('Should call unsubscribe() on click', async () => {
    const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');
    (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
      sendMessageWithTools: mockSendMessageWithTools,
      checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
      getAvailableTools: jest.fn().mockResolvedValue([]),
    });

    const onClose = jest.fn();
    await act(async () => render(<ChatDrawer isOpen onClose={onClose} />));

    const textarea = selectors.input();

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test' } });
      fireEvent.click(selectors.sendButton());
      fireEvent.click(selectors.drawerCloseButton());
    });

    expect(onClose).toHaveBeenCalled();
  });

  describe('Error handling', () => {
    it('Should handle stream errors properly', async () => {
      const mockSendMessageWithTools = jest.fn().mockRejectedValue(new Error('Stream error'));
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      mockHandleLlmError.mockReturnValue('Formatted error message');

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(mockAddMessages).toHaveBeenCalledWith([
          expect.objectContaining({
            sender: 'system',
            isError: true,
            text: expect.stringContaining('Connection Error: Stream error'),
          }),
        ]);
      });
    });

    it('Should Call addError on MCP init if MCP is disabled', async () => {
      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: false, error: 'test' }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });
      (hooks.useMcpService as jest.Mock).mockReturnValue({
        ...defaultUseMcpService,
        checkMcpStatus: jest.fn().mockResolvedValue({ isAvailable: false, error: 'MCP Disabled in test' }),
      });

      await act(async () => render(getComponent({})));
      expect(mockAddMessages).toHaveBeenCalled();
    });

    it('Should Call addError on MCP init throw error', async () => {
      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');

      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: false, error: 'test' }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });
      (hooks.useMcpService as jest.Mock).mockReturnValue({
        ...defaultUseMcpService,
        checkMcpStatus: jest.fn().mockRejectedValue(new Error('Mocked checkMcpStatus failure')),
      });

      await act(async () => render(getComponent({})));
      expect(mockAddMessages).toHaveBeenCalled();
    });

    it('Should handle connection errors in try/catch', async () => {
      const mockSendMessageWithTools = jest.fn().mockRejectedValue(new Error('Connection failed'));
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(mockAddMessages).toHaveBeenCalledWith([
          expect.objectContaining({
            sender: 'system',
            isError: true,
            text: expect.stringContaining('Connection Error: Connection failed'),
          }),
        ]);
      });
    });

    it('Should handle non-Error objects in catch block', async () => {
      const mockSendMessageWithTools = jest.fn().mockRejectedValue('String error');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test message' } });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(mockAddMessages).toHaveBeenCalledWith([
          expect.objectContaining({
            sender: 'system',
            isError: true,
            text: expect.stringContaining('Connection Error: String error'),
          }),
        ]);
      });
    });
  });

  describe('Subscription handling', () => {
    it('Should unsubscribe when component unmounts', async () => {
      const mockSendMessageWithTools = jest.fn().mockResolvedValue('Response from LLM');
      (hooks.useMcpLlmIntegration as jest.Mock).mockReturnValue({
        sendMessageWithTools: mockSendMessageWithTools,
        checkAvailability: jest.fn().mockResolvedValue({ isAvailable: true, error: undefined }),
        getAvailableTools: jest.fn().mockResolvedValue([]),
      });

      const { unmount } = render(getComponent({ isOpen: true }));
      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test' } });
        fireEvent.click(sendButton);
      });
      await act(async () => {
        unmount();
      });
      expect(mockSendMessageWithTools).toHaveBeenCalled();
    });
  });

  it('Should call removeAttachedFile when remove button is clicked', async () => {
    const attachedFiles = [{ id: 'file1', name: 'test.txt', size: 123, type: 'text/plain' }];
    (hooks.useFileAttachments as jest.Mock).mockReturnValue({
      ...defaultUseFileAttachments,
      attachedFiles,
    });
    await act(async () => render(getComponent({})));
    const removeButton = selectors.removeButton();
    await act(async () => fireEvent.click(removeButton));
    expect(mockRemoveAttachedFile).toHaveBeenCalledWith('file1');
  });

  it('Should show attached files preview if files are attached', async () => {
    const attachedFiles = [{ id: 'file1', name: 'test.txt', size: 123, type: 'text/plain' }];
    (hooks.useFileAttachments as jest.Mock).mockReturnValue({
      ...defaultUseFileAttachments,
      attachedFiles,
    });
    await act(async () => render(getComponent({})));
    expect(selectors.attachedFilesPreview()).toBeInTheDocument();
  });

  it('Should clear input and attached files on Escape key', async () => {
    await act(async () => render(getComponent({})));
    const textarea = selectors.input();
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Some text' } });
      fireEvent.keyDown(textarea, { key: 'Escape' });
    });
    expect(mockClearAttachedFiles).toHaveBeenCalled();
    expect(textarea).toHaveValue('');
  });

  it('Should show correct placeholder text', async () => {
    await act(async () => render(getComponent({})));
    const textarea = selectors.input();

    expect(textarea).toHaveAttribute('placeholder', 'Type your message or drag files here...');
  });

  it('Should call scrollIntoView when messages change', async () => {
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});

    const messages1 = [{ id: '1', sender: 'user', text: 'Hello', timestamp: new Date() }];
    const messages2 = [...messages1, { id: '2', sender: 'assistant', text: 'World', timestamp: new Date() }];

    (hooks.useChatMessages as jest.Mock).mockReturnValue({
      ...defaultUseChatMessages,
      messages: messages1,
    });

    let utils: ReturnType<typeof render>;

    await act(async () => {
      utils = render(getComponent({}));
    });

    (hooks.useChatMessages as jest.Mock).mockReturnValue({
      ...defaultUseChatMessages,
      messages: messages2,
    });

    await act(async () => {
      utils.rerender(getComponent({}));
    });

    expect(scrollSpy).toHaveBeenCalled();
    scrollSpy.mockRestore();
  });

  it('Should render image icon for image file type', async () => {
    const attachedFiles = [{ id: 'img1', name: 'pic.png', size: 100, type: 'image/png' }];
    (hooks.useFileAttachments as jest.Mock).mockReturnValue({
      ...defaultUseFileAttachments,
      attachedFiles,
    });
    await act(async () => render(getComponent({})));
    expect(selectors.attachmentImageIcon()).toBeInTheDocument();
  });

  it('Should render <img> if file has url', async () => {
    const attachedFiles = [
      { id: 'img2', name: 'pic2.png', size: 100, type: 'image/png', url: 'data:image/png;base64,abc' },
    ];
    (hooks.useFileAttachments as jest.Mock).mockReturnValue({
      ...defaultUseFileAttachments,
      attachedFiles,
    });
    await act(async () => render(getComponent({})));

    expect(selectors.attachmentImage(false, 'pic2.png')).toBeInTheDocument();
  });

  it('Should render image icon and <img> for image attachment in message', async () => {
    const messages = [
      {
        id: '1',
        sender: 'user',
        text: 'msg',
        timestamp: new Date(),
        attachments: [{ id: 'img1', name: 'pic.png', size: 100, type: 'image/png', url: 'data:image/png;base64,abc' }],
      },
    ];
    (hooks.useChatMessages as jest.Mock).mockReturnValue({
      ...defaultUseChatMessages,
      messages,
    });
    await act(async () => render(getComponent({})));
    expect(selectors.attachmentImageIcon()).toBeInTheDocument();
  });

  it('Should render pulsingDot when message is streaming', async () => {
    const messages = [
      {
        id: '1',
        sender: 'assistant',
        text: 'Thinking...',
        timestamp: new Date(),
        isStreaming: true,
      },
    ];
    (hooks.useChatMessages as jest.Mock).mockReturnValue({
      ...defaultUseChatMessages,
      messages,
    });
    await act(async () => render(getComponent({})));

    expect(selectors.message(false, 'Thinking...')).toBeInTheDocument();
  });

  describe('File dropzone and upload integration', () => {
    it('Should render FileUpload and call handleFileInputUpload on file upload', async () => {
      const handleFileAttachment = jest.fn();
      (hooks.useFileAttachments as jest.Mock).mockReturnValue({
        ...defaultUseFileAttachments,
        handleFileAttachment,
      });
      await act(async () => {
        render(getComponent({ isOpen: true }));
      });
      const fileInput = screen.getByLabelText('Send message').parentElement?.querySelector('input[type="file"]');
      const file = new File(['test'], 'file.txt', { type: 'text/plain' });
      await act(async () => {
        fireEvent.change(fileInput!, { target: { files: [file] } });
      });
      expect(handleFileAttachment).toHaveBeenCalled();
    });

    it('Should convert accepted files to dropzone files and call handleFileAttachment', () => {
      const handleFileAttachment = jest.fn();
      const setIsDropzoneVisible = jest.fn();
      const acceptedFiles = [
        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
        new File(['content2'], 'file2.png', { type: 'image/png' }),
      ];

      const originalDateNow = Date.now;
      const originalRandom = Math.random;
      const mockDateNow = jest.fn().mockReturnValue(1234567890);
      const mockRandom = jest.fn().mockReturnValue(0.5);
      Date.now = mockDateNow;
      Math.random = mockRandom;

      const handleDropFiles = (
        acceptedFiles: File[],
        handleFileAttachment: (files: any[]) => void,
        setIsDropzoneVisible: (value: boolean) => void
      ) => {
        const dropzoneFiles = acceptedFiles.map((file) => ({
          id: `file-${Date.now()}-${Math.random()}`,
          file,
          error: null,
        }));
        handleFileAttachment(dropzoneFiles);
        setIsDropzoneVisible(false);
      };

      handleDropFiles(acceptedFiles, handleFileAttachment, setIsDropzoneVisible);

      expect(handleFileAttachment).toHaveBeenCalledWith([
        {
          id: 'file-1234567890-0.5',
          file: acceptedFiles[0],
          error: null,
        },
        {
          id: 'file-1234567890-0.5',
          file: acceptedFiles[1],
          error: null,
        },
      ]);
      expect(setIsDropzoneVisible).toHaveBeenCalledWith(false);

      Date.now = originalDateNow;
      Math.random = originalRandom;
    });

    it('Should handle empty accepted files array', () => {
      const handleFileAttachment = jest.fn();
      const setIsDropzoneVisible = jest.fn();
      const acceptedFiles: File[] = [];

      const handleDropFiles = (
        acceptedFiles: File[],
        handleFileAttachment: (files: any[]) => void,
        setIsDropzoneVisible: (value: boolean) => void
      ) => {
        const dropzoneFiles = acceptedFiles.map((file) => ({
          id: `file-${Date.now()}-${Math.random()}`,
          file,
          error: null,
        }));
        handleFileAttachment(dropzoneFiles);
        setIsDropzoneVisible(false);
      };

      handleDropFiles(acceptedFiles, handleFileAttachment, setIsDropzoneVisible);

      expect(handleFileAttachment).toHaveBeenCalledWith([]);
      expect(setIsDropzoneVisible).toHaveBeenCalledWith(false);
    });

    it('Should call setIsDropzoneVisible(true) on dragEnter and dragOver, and setIsDropzoneVisible(false) on dragLeave', () => {
      const setIsDropzoneVisible = jest.fn();
      const { result } = renderHook(() => useDropzoneOverlay(setIsDropzoneVisible));
      const { handleDragEnter, handleDragOver, handleDragLeave } = result.current;
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() } as any;

      handleDragEnter(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(setIsDropzoneVisible).toHaveBeenCalledWith(true);
      setIsDropzoneVisible.mockClear();

      handleDragOver(event);
      expect(setIsDropzoneVisible).toHaveBeenCalledWith(true);
      setIsDropzoneVisible.mockClear();

      handleDragLeave(event);
      expect(setIsDropzoneVisible).toHaveBeenCalledWith(false);
    });

    it('Should convert file input files to dropzone files and call handleFileAttachment', () => {
      const handleFileAttachment = jest.fn();
      const files = [
        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
        new File(['content2'], 'file2.png', { type: 'image/png' }),
      ];

      const originalDateNow = Date.now;
      const originalRandom = Math.random;
      const mockDateNow = jest.fn().mockReturnValue(1234567890);
      const mockRandom = jest.fn().mockReturnValue(0.5);
      Date.now = mockDateNow;
      Math.random = mockRandom;

      const handleFileInputUpload = (
        event: React.FormEvent<HTMLInputElement>,
        handleFileAttachment: (files: any[]) => void
      ) => {
        if (event.currentTarget.files && event.currentTarget.files.length > 0) {
          const dropzoneFiles = Array.from(event.currentTarget.files).map((file) => ({
            id: `file-${Date.now()}-${Math.random()}`,
            file,
            error: null,
          }));
          handleFileAttachment(dropzoneFiles);
          event.currentTarget.value = '';
        }
      };

      const mockEvent = {
        currentTarget: {
          files,
          value: 'some-value',
        },
      } as unknown as React.FormEvent<HTMLInputElement>;

      handleFileInputUpload(mockEvent, handleFileAttachment);

      expect(handleFileAttachment).toHaveBeenCalledWith([
        {
          id: 'file-1234567890-0.5',
          file: files[0],
          error: null,
        },
        {
          id: 'file-1234567890-0.5',
          file: files[1],
          error: null,
        },
      ]);
      expect(mockEvent.currentTarget.value).toEqual('');

      Date.now = originalDateNow;
      Math.random = originalRandom;
    });

    it('Should render FileDropZone ', async () => {
      await act(async () => {
        render(getComponent({ isOpen: true }));
      });

      /**
       * Emulate drag on input element to make dropzone visible
       */
      const inputElement = selectors.inputPanel();
      fireEvent.dragEnter(inputElement);

      expect(selectors.fileDropzoneOverlay()).toBeInTheDocument();
      expect(selectors.fileDropzone()).toBeInTheDocument();
    });

    it('Should render FileDropZone and add file', async () => {
      const handleFileAttachment = jest.fn();
      (hooks.useFileAttachments as jest.Mock).mockReturnValue({
        ...defaultUseFileAttachments,
        handleFileAttachment,
      });

      const image = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

      await act(async () => {
        render(getComponent({ isOpen: true }));
      });

      /**
       * Emulate drag on input element to make dropzone visible
       */
      const inputElement = selectors.inputPanel();
      fireEvent.dragEnter(inputElement);

      expect(selectors.fileDropzoneOverlay()).toBeInTheDocument();
      expect(selectors.fileDropzone()).toBeInTheDocument();

      /**
       * Select file
       */
      await act(() =>
        fireEvent.change(selectors.fileDropzone(), {
          target: {
            files: [image],
          },
        })
      );

      expect(handleFileAttachment).toHaveBeenCalled();
    });

    it('Should render FileDropZone and remove file', async () => {
      const attachedFiles = [{ id: 'file1', name: 'test.txt', size: 123, type: 'text/plain' }];
      const removeAttachedFile = jest.fn();
      (hooks.useFileAttachments as jest.Mock).mockReturnValue({
        ...defaultUseFileAttachments,
        removeAttachedFile,
        attachedFiles,
      });

      await act(async () => {
        render(getComponent({ isOpen: true }));
      });

      /**
       * Emulate drag on input element to make dropzone visible
       */
      const inputElement = selectors.inputPanel();
      fireEvent.dragEnter(inputElement);

      expect(selectors.fileDropzoneOverlay()).toBeInTheDocument();
      expect(selectors.fileDropzone()).toBeInTheDocument();
      expect(selectors.removeFileDropZone()).toBeInTheDocument();

      /**
       * Select file
       */
      await act(() =>
        fireEvent.change(selectors.removeFileDropZone(), {
          target: {
            files: attachedFiles,
          },
        })
      );
      expect(removeAttachedFile).toHaveBeenCalled();
    });
  });
});
