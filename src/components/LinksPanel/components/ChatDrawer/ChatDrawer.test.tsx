import { openai } from '@grafana/llm';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';
import { of } from 'rxjs';

import { TEST_IDS } from '@/constants';
import * as hooks from '@/hooks';

import { ChatDrawer } from './ChatDrawer';
import { getStyles } from './ChatDrawer.styles';

/**
 * Mock @grafana/ui
 */
jest.mock('@grafana/ui');

/**
 * Mock @grafana/llm
 */
jest.mock('@grafana/llm', () => ({
  openai: {
    streamChatCompletions: jest.fn(),
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
  chatConfig: {
    temperature: 0.7,
    requestTimeout: 30000,
  },
}));

/**
 * Chat Drawer Tests
 */
describe('ChatDrawer', () => {
  const getSelectors = getJestSelectors({
    ...TEST_IDS.drawerElement,
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

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useFileAttachments as jest.Mock).mockReturnValue({
      ...defaultUseFileAttachments,
      attachedFiles: [],
    });
    (hooks.useChatMessages as jest.Mock).mockReturnValue(defaultUseChatMessages);
    (hooks.useTextareaResize as jest.Mock).mockReturnValue(defaultUseTextareaResize);
    (hooks.useLlmService as jest.Mock).mockReturnValue(defaultUseLlmService);

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
  });

  describe('Basic Interactions', () => {
    it('Should close drawer and clean up', async () => {
      await act(async () => render(getComponent({})));

      fireEvent.click(selectors.drawerCloseButton());

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockClearAttachedFiles).toHaveBeenCalled();
    });

    it('Should update input value and resize textarea', async () => {
      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      fireEvent.change(textarea, { target: { value: 'Hello world' } });

      expect(textarea).toHaveValue('Hello world');
      expect(mockAdjustTextareaHeight).toHaveBeenCalled();
    });

    it('Should handle keyboard shortcuts (Enter to send, Ctrl+Enter for new line, Escape to clear)', async () => {
      const mockStream = of({ choices: [{ delta: { content: 'Response' } }] });
      (openai.streamChatCompletions as jest.Mock).mockReturnValue(mockStream);

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();

      fireEvent.change(textarea, { target: { value: 'Test message' } });
      
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(mockAddMessages).toHaveBeenCalled();
      });

      mockAddMessages.mockClear();
      mockClearAttachedFiles.mockClear();

      fireEvent.change(textarea, { target: { value: 'New message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(mockAddMessages).not.toHaveBeenCalled();

      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(mockClearAttachedFiles).toHaveBeenCalled();
    });

    it('Should return style object for a theme', () => {
      const theme = {
        spacing: () => '8px',
        colors: {
          text: { secondary: '#888', primary: '#000' },
          primary: { main: '#00f', contrastText: '#fff', border: '#00f', shade: '#009' },
          background: { secondary: '#eee', canvas: '#fff', primary: '#fff' },
          border: { weak: '#ccc', medium: '#bbb' },
        },
        shape: { radius: { default: '4px' } },
        shadows: { z1: '0 1px 3px #0002' },
        typography: {
          bodySmall: { fontSize: '12px' },
          body: { fontSize: '14px' },
          fontWeightMedium: 500,
        },
        isDark: false,
      } as any;

      const styles = getStyles(theme);
      expect(styles).toBeDefined();
      expect(typeof styles).toBe('object');
      expect(styles.container).toBeDefined();
    });
  });

  describe('Message Sending', () => {
    it('Should send message when send button is clicked', async () => {
      const mockStream = of({ choices: [{ delta: { content: 'Response' } }] });
      (openai.streamChatCompletions as jest.Mock).mockReturnValue(mockStream);

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      fireEvent.change(textarea, { target: { value: 'Test message' } });

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

      expect(openai.streamChatCompletions).toHaveBeenCalled();
      expect(mockClearAttachedFiles).toHaveBeenCalled();
    });

    it('Should not send message in various invalid states', async () => {
      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      expect(sendButton).toBeDisabled();

      fireEvent.change(textarea, { target: { value: '   \n\t  ' } });

      const forcedClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      sendButton.dispatchEvent(forcedClick);

      expect(mockAddMessages).not.toHaveBeenCalled();
      expect(openai.streamChatCompletions).not.toHaveBeenCalled();

      const mockStream = {
        pipe: jest.fn().mockReturnValue({
          subscribe: jest.fn().mockReturnValue({
            unsubscribe: jest.fn(),
          }),
        }),
      };
      (openai.streamChatCompletions as jest.Mock).mockReturnValue(mockStream);

      fireEvent.change(textarea, { target: { value: 'First message' } });
      await act(async () => {
        fireEvent.click(sendButton);
      });

      fireEvent.change(textarea, { target: { value: 'Second message' } });

      (openai.streamChatCompletions as jest.Mock).mockClear();

      fireEvent.click(sendButton);

      expect(openai.streamChatCompletions).not.toHaveBeenCalled();
    });

    it('Should handle LLM status check failure', async () => {
      mockCheckLlmStatus.mockResolvedValue({
        canProceed: false,
        error: 'LLM service unavailable',
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      fireEvent.change(textarea, { target: { value: 'Test message' } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockAddMessages).toHaveBeenCalledWith([
        expect.objectContaining({
          sender: 'assistant',
          text: expect.stringContaining('LLM Error: LLM service unavailable'),
        }),
      ]);

      expect(openai.streamChatCompletions).not.toHaveBeenCalled();
    });
  });

  describe('LLM Streaming and Response Handling', () => {
    it('Should handle all response formats in a single test', async () => {
      const testResponses = [
        'String chunk: ',
        { choices: [{ delta: { content: 'Content delta, ' } }] },
        { choices: [{ delta: { text: 'text delta, ' } }] },
        { content: 'direct content, ' },
        { text: 'direct text' },
        null,
        undefined,
        {},
        { choices: [] },
        { choices: [{ delta: null }] },
        { choices: [{ delta: {} }] },
      ];

      const testStream = of(...testResponses);
      (openai.streamChatCompletions as jest.Mock).mockReturnValue(testStream);

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      fireEvent.change(textarea, { target: { value: 'Test message' } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(mockUpdateLastMessage).toHaveBeenCalled();
      });
    });

    it('Should handle request timeout', async () => {
      jest.useFakeTimers();

      const unsubscribeMock = jest.fn();
      const mockStream = {
        pipe: jest.fn().mockReturnValue({
          subscribe: jest.fn().mockReturnValue({
            unsubscribe: unsubscribeMock,
          }),
        }),
      };
      (openai.streamChatCompletions as jest.Mock).mockReturnValue(mockStream);

      const mockUpdateFn = jest.fn();
      mockUpdateLastMessage.mockImplementationOnce((callback) => {
        const result = callback({ id: 'test-msg', text: '', isStreaming: true });
        mockUpdateFn(result);
        return result;
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      fireEvent.change(textarea, { target: { value: 'Test message' } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      act(() => {
        jest.advanceTimersByTime(30001);
      });

      expect(unsubscribeMock).toHaveBeenCalled();
      expect(mockUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Request timeout. The LLM service might be overloaded or misconfigured.',
          isStreaming: false,
        })
      );
    });

    it('Should handle stream completion', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnValue({
          subscribe: jest.fn().mockImplementation(({ complete }) => {
            complete();
            return { unsubscribe: jest.fn() };
          }),
        }),
      };
      (openai.streamChatCompletions as jest.Mock).mockReturnValue(mockStream);

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      fireEvent.change(textarea, { target: { value: 'Test' } });

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
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    expect(hooks.useChatMessages().addMessages).not.toHaveBeenCalled();
    expect(openai.streamChatCompletions).not.toHaveBeenCalled();
  });

  it('Should open file input on attach click', async () => {
    await act(async () => render(<ChatDrawer isOpen onClose={jest.fn()} />));
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click');
    const attachBtn = selectors.attachButton();
    fireEvent.click(attachBtn);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('Should call unsubscribe() on click', async () => {
    const unsubscribeMock = jest.fn();
    const mockStream = {
      pipe: jest.fn().mockReturnValue({
        subscribe: jest.fn().mockReturnValue({ unsubscribe: unsubscribeMock }),
      }),
    };
    (openai.streamChatCompletions as jest.Mock).mockReturnValue(mockStream);

    const onClose = jest.fn();
    await act(async () => render(<ChatDrawer isOpen onClose={onClose} />));

    const textarea = selectors.input();
    fireEvent.change(textarea, { target: { value: 'Test' } });
    await act(async () => {
      fireEvent.click(selectors.sendButton());
    });

    fireEvent.click(selectors.drawerCloseButton());
    expect(unsubscribeMock).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  describe('Error handling', () => {
    it('Should handle stream errors properly', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnValue({
          subscribe: jest.fn().mockImplementation(({ error }) => {
            error(new Error('Stream error'));
            return { unsubscribe: jest.fn() };
          }),
        }),
      };
      (openai.streamChatCompletions as jest.Mock).mockReturnValue(mockStream);

      mockHandleLlmError.mockReturnValue('Formatted error message');

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      fireEvent.change(textarea, { target: { value: 'Test message' } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockHandleLlmError).toHaveBeenCalled();
      expect(mockUpdateLastMessage).toHaveBeenCalledWith(expect.any(Function));
    });

    it('Should handle connection errors in try/catch', async () => {
      (openai.streamChatCompletions as jest.Mock).mockImplementation(() => {
        throw new Error('Connection failed');
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      fireEvent.change(textarea, { target: { value: 'Test message' } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockUpdateLastMessage).toHaveBeenCalledWith(expect.any(Function));

      const updateCallback = mockUpdateLastMessage.mock.calls[0][0];
      const result = updateCallback({ id: 'msg-123', text: '', isStreaming: true });

      expect(result.text).toContain('Connection Error: Connection failed');
      expect(result.isStreaming).toBe(false);
    });

    it('Should handle non-Error objects in catch block', async () => {
      (openai.streamChatCompletions as jest.Mock).mockImplementation(() => {
        throw 'String error';
      });

      await act(async () => render(getComponent({})));

      const textarea = selectors.input();
      const sendButton = selectors.sendButton();

      fireEvent.change(textarea, { target: { value: 'Test message' } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      const updateCallback = mockUpdateLastMessage.mock.calls[0][0];
      const result = updateCallback({ id: 'msg-123', text: '', isStreaming: true });

      expect(result.text).toContain('Failed to connect to LLM service');
    });
  });

  describe('Subscription handling', () => {
    it('Should unsubscribe when component unmounts', async () => {
      const unsubscribeMock = jest.fn();
      const mockStream = {
        pipe: jest.fn().mockReturnValue({
          subscribe: jest.fn().mockReturnValue({ unsubscribe: unsubscribeMock }),
        }),
      };
      (openai.streamChatCompletions as jest.Mock).mockReturnValue(mockStream);
      mockCheckLlmStatus.mockResolvedValue({ canProceed: true });

      const { unmount } = render(getComponent({ isOpen: true }));
      const textarea = selectors.input();
      const sendButton = selectors.sendButton();
      fireEvent.change(textarea, { target: { value: 'Test' } });
      await act(async () => {
        fireEvent.click(sendButton);
      });
      await act(async () => {
        unmount();
      });
      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  it('Should handle file input change and call handleFileAttachment, then reset input value', async () => {
    await act(async () => render(getComponent({})));
    const fileInput = selectors.fileInput();
    const files = [new File(['test'], 'test.txt', { type: 'text/plain' })];
    fireEvent.change(fileInput, { target: { files } });
    expect(mockHandleFileAttachment).toHaveBeenCalledWith(files);
  });

  it('Should call removeAttachedFile when remove button is clicked', async () => {
    const attachedFiles = [{ id: 'file1', name: 'test.txt', size: 123, type: 'text/plain' }];
    (hooks.useFileAttachments as jest.Mock).mockReturnValue({
      ...defaultUseFileAttachments,
      attachedFiles,
    });
    await act(async () => render(getComponent({})));
    const removeButton = selectors.removeButton();
    fireEvent.click(removeButton);
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
    fireEvent.change(textarea, { target: { value: 'Some text' } });
    fireEvent.keyDown(textarea, { key: 'Escape' });
    expect(mockClearAttachedFiles).toHaveBeenCalled();
    expect(textarea).toHaveValue('');
  });

  it('Should call scrollIntoView when messages change', async () => {
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    const messages1 = [{ id: '1', sender: 'user', text: 'Hello', timestamp: new Date() }];
    const messages2 = [...messages1, { id: '2', sender: 'assistant', text: 'World', timestamp: new Date() }];
    (hooks.useChatMessages as jest.Mock).mockReturnValue({
      ...defaultUseChatMessages,
      messages: messages1,
    });
    const { rerender } = render(getComponent({}));
    (hooks.useChatMessages as jest.Mock).mockReturnValue({
      ...defaultUseChatMessages,
      messages: messages2,
    });
    rerender(getComponent({}));
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

  it('Should call fileInputRef.current.click() when attach button is clicked', async () => {
    await act(async () => render(getComponent({})));
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click');
    const attachBtn = selectors.attachButton();
    fireEvent.click(attachBtn);
    expect(clickSpy).toHaveBeenCalled();
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
});
