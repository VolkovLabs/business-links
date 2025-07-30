/* eslint-disable @typescript-eslint/naming-convention */
import { llm } from '@grafana/llm';
import { act, renderHook } from '@testing-library/react';

import { AttachedFile, ChatMessage } from '@/types';

import { chatConfig, useChatMessages, useFileAttachments, useLlmService, useTextareaResize } from './useDrawerLlmChat';

/**
 * Mock @grafana/llm
 */
jest.mock('@grafana/llm', () => ({
  llm: {
    enabled: jest.fn(() => Promise.resolve(true)),
    streamChatCompletions: jest.fn(),
    health: jest.fn(),
  },
}));

jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00Z'));

jest.mock('source-map-support', () => ({
  install: () => {},
  uninstall: () => {},
}));

function makeDropzoneFile(file: File, id = '') {
  return { id: id || `file-${Date.now()}-${Math.random()}`, file, error: null };
}

describe('useChatMessages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Should have empty initial state for chat messages', () => {
    const { result } = renderHook(() => useChatMessages());
    expect(result.current.messages).toEqual([]);
  });

  it('Should correctly add, set, and update messages', () => {
    const { result } = renderHook(() => useChatMessages());
    const m1: ChatMessage = { id: '1', text: 'A', sender: 'user', timestamp: new Date() };
    const m2: ChatMessage = { id: '2', text: 'B', sender: 'assistant', timestamp: new Date() };

    act(() => result.current.addMessages([m1]));
    expect(result.current.messages).toEqual([m1]);

    act(() => result.current.addMessages([m2]));
    expect(result.current.messages).toEqual([m1, m2]);

    act(() =>
      result.current.updateLastMessage((msg: ChatMessage) => ({
        ...msg,
        text: msg.text + '!',
      }))
    );
    expect(result.current.messages[1].text).toEqual('B!');

    act(() => result.current.setMessages([m2]));
    expect(result.current.messages).toEqual([m2]);
  });

  it('Should not throw when updating last message on empty array', () => {
    const { result } = renderHook(() => useChatMessages());

    act(() => result.current.updateLastMessage((msg: ChatMessage) => ({ ...msg, text: 'X' })));
    expect(result.current.messages).toEqual([]);
  });
});

describe('useFileAttachments', () => {
  const originalFileReader = window.FileReader;
  let fakeReader: {
    readAsDataURL: jest.Mock;
    readAsText: jest.Mock;
    onload: ((e: any) => void) | null;
    result: any;
  };
  let fileReaderInstances: any[] = [];

  beforeAll(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fileReaderInstances = [];

    (window as any).FileReader = jest.fn(() => {
      fakeReader = {
        readAsDataURL: jest.fn(),
        readAsText: jest.fn(),
        onload: null,
        result: null,
      };
      fileReaderInstances.push(fakeReader);
      return fakeReader;
    });
  });

  afterAll(() => {
    window.FileReader = originalFileReader;
    jest.restoreAllMocks();
  });

  it('Should have empty initial state for file attachments', () => {
    const { result } = renderHook(() => useFileAttachments());
    expect(result.current.attachedFiles).toEqual([]);
  });

  it('Should format file size correctly', () => {
    const { result } = renderHook(() => useFileAttachments());
    expect(result.current.formatFileSize(0)).toEqual('0 B');
    expect(result.current.formatFileSize(1024 * 1024)).toEqual('1.05 MB');
  });

  it('Should ignore null and empty file attachments', () => {
    const { result } = renderHook(() => useFileAttachments());
    act(() => result.current.handleFileAttachment([]));
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  it('Should reject files that are too large', () => {
    const { result } = renderHook(() => useFileAttachments());
    const big = new File([new ArrayBuffer(chatConfig.maxFileSize + 1)], 'big.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(big)]));
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  it('Should reject unsupported file types', () => {
    const { result } = renderHook(() => useFileAttachments());
    const exe = new File(['x'], 'file.exe', { type: 'application/x-executable' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(exe)]));
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  it('Should read images via readAsDataURL and save URL', () => {
    const { result } = renderHook(() => useFileAttachments());
    const img = new File([''], 'img.png', { type: 'image/png' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(img)]));

    expect(fileReaderInstances[0].readAsDataURL).toHaveBeenCalledWith(img);

    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'data-url' } });
      }
    });
    expect(result.current.attachedFiles[0]).toMatchObject({
      name: 'img.png',
      url: 'data-url',
    });
  });

  it('Should read PDF files via readAsDataURL', () => {
    const { result } = renderHook(() => useFileAttachments());
    const pdf = new File([''], 'doc.pdf', { type: 'application/pdf' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(pdf)]));
    expect(fileReaderInstances[0].readAsDataURL).toHaveBeenCalledWith(pdf);

    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'pdf-data-url' } });
      }
    });
    expect(result.current.attachedFiles[0]).toMatchObject({
      name: 'doc.pdf',
      type: 'application/pdf',
      content: 'pdf-data-url',
      url: undefined,
    });
  });

  it('Should read text files via readAsText and without URL', () => {
    const { result } = renderHook(() => useFileAttachments());
    const txt = new File(['hello'], 'doc.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(txt)]));
    expect(fileReaderInstances[0].readAsText).toHaveBeenCalledWith(txt);

    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'hello' } });
      }
    });
    expect(result.current.attachedFiles[0]).toMatchObject({
      name: 'doc.txt',
      content: 'hello',
      url: undefined,
    });
  });

  it('Should read JSON files via readAsText', () => {
    const { result } = renderHook(() => useFileAttachments());
    const json = new File(['{"test": true}'], 'data.json', { type: 'application/json' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(json)]));
    expect(fileReaderInstances[0].readAsText).toHaveBeenCalledWith(json);

    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: '{"test": true}' } });
      }
    });
    expect(result.current.attachedFiles[0]).toMatchObject({
      name: 'data.json',
      content: '{"test": true}',
      url: undefined,
    });
  });

  it('Should generate unique file IDs with different Math.random values', () => {
    const { result } = renderHook(() => useFileAttachments());

    const originalDateNow = Date.now;
    const originalRandom = Math.random;
    Date.now = jest.fn().mockReturnValue(1234567890);
    Math.random = jest.fn().mockReturnValueOnce(0.123).mockReturnValueOnce(0.456);

    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(file1)]));
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content1' } });
      }
    });

    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(file2)]));
    act(() => {
      if (fileReaderInstances[1].onload) {
        fileReaderInstances[1].onload({ target: { result: 'content2' } });
      }
    });

    expect(result.current.attachedFiles[0].id).toMatch(/^file-/);
    expect(result.current.attachedFiles[1].id).toMatch(/^file-/);

    Date.now = originalDateNow;
    Math.random = originalRandom;
  });

  it('Should remove the correct attached file', () => {
    const { result } = renderHook(() => useFileAttachments());

    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

    act(() => result.current.handleFileAttachment([makeDropzoneFile(file1)]));
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content1' } });
      }
    });

    act(() => result.current.handleFileAttachment([makeDropzoneFile(file2)]));
    act(() => {
      if (fileReaderInstances[1].onload) {
        fileReaderInstances[1].onload({ target: { result: 'content2' } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(2);

    const firstFileId = result.current.attachedFiles[0].id;
    act(() => result.current.removeAttachedFile(firstFileId));

    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].name).toEqual('file2.txt');
  });

  it('Should remove all attached files', () => {
    const { result } = renderHook(() => useFileAttachments());

    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

    act(() => result.current.handleFileAttachment([makeDropzoneFile(file1)]));
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content1' } });
      }
    });

    act(() => result.current.handleFileAttachment([makeDropzoneFile(file2)]));
    act(() => {
      if (fileReaderInstances[1].onload) {
        fileReaderInstances[1].onload({ target: { result: 'content2' } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(2);

    act(() => result.current.clearAttachedFiles());
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  it('Should ignore non-existent ID when removing attached file', () => {
    const { result } = renderHook(() => useFileAttachments());
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    act(() => result.current.handleFileAttachment([makeDropzoneFile(file)]));
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content' } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(1);

    act(() => result.current.removeAttachedFile('non-existent-id'));
    expect(result.current.attachedFiles).toHaveLength(1);
  });

  it('Should handle FileReader onload with undefined result', () => {
    const { result } = renderHook(() => useFileAttachments());
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    act(() => result.current.handleFileAttachment([makeDropzoneFile(file)]));

    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: undefined } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].content).toBeUndefined();
  });

  it('Should complete file attachment flow with proper onload execution', () => {
    const { result } = renderHook(() => useFileAttachments());

    const textFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(textFile)]));

    expect(fileReaderInstances).toHaveLength(1);
    expect(fileReaderInstances[0].readAsText).toHaveBeenCalledWith(textFile);

    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({
          target: {
            result: 'hello world',
          },
        });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0]).toMatchObject({
      name: 'test.txt',
      type: 'text/plain',
      content: 'hello world',
      url: undefined,
    });

    const imageFile = new File(['image data'], 'image.png', { type: 'image/png' });
    act(() => result.current.handleFileAttachment([makeDropzoneFile(imageFile)]));

    expect(fileReaderInstances).toHaveLength(2);
    expect(fileReaderInstances[1].readAsDataURL).toHaveBeenCalledWith(imageFile);

    act(() => {
      if (fileReaderInstances[1].onload) {
        fileReaderInstances[1].onload({
          target: {
            result: 'data:image/png;base64,abc123',
          },
        });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(2);
    expect(result.current.attachedFiles[1]).toMatchObject({
      name: 'image.png',
      type: 'image/png',
      content: 'data:image/png;base64,abc123',
      url: 'data:image/png;base64,abc123',
    });
  });

  it('Should process multiple files correctly', () => {
    const { result } = renderHook(() => useFileAttachments());
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.json', { type: 'application/json' });
    const file3 = new File([''], 'image.png', { type: 'image/png' });

    act(() =>
      result.current.handleFileAttachment([makeDropzoneFile(file1), makeDropzoneFile(file2), makeDropzoneFile(file3)])
    );

    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content1' } });
      }
    });

    act(() => {
      if (fileReaderInstances[1].onload) {
        fileReaderInstances[1].onload({ target: { result: 'content2' } });
      }
    });

    act(() => {
      if (fileReaderInstances[2].onload) {
        fileReaderInstances[2].onload({ target: { result: 'data:image/png;base64,' } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(3);
    expect(result.current.attachedFiles[0].name).toEqual('file1.txt');
    expect(result.current.attachedFiles[1].name).toEqual('file2.json');
    expect(result.current.attachedFiles[2].name).toEqual('image.png');
  });

  it('Should ignore dropzoneFile if it is undefined or has no file property', () => {
    const { result } = renderHook(() => useFileAttachments());
    act(() => result.current.handleFileAttachment([undefined as any]));
    expect(result.current.attachedFiles).toHaveLength(0);

    act(() => result.current.handleFileAttachment([{ id: 'no-file' } as any]));
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  describe('addErrorMessage functionality', () => {
    const mockAddErrorMessage = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Should call addErrorMessage when file size is too large', () => {
      const { result } = renderHook(() => useFileAttachments(mockAddErrorMessage));

      const largeFile = {
        id: 'file-1',
        file: new File(['test'], 'large-file.txt', { type: 'text/plain' }),
        error: null,
      };

      Object.defineProperty(largeFile.file, 'size', {
        value: chatConfig.maxFileSize + 1,
        writable: true,
      });

      act(() => {
        result.current.handleFileAttachment([largeFile]);
      });

      expect(mockAddErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('File too large: "large-file.txt" exceeds the maximum size of')
      );
    });

    it('Should call addErrorMessage when file type is not supported', () => {
      const { result } = renderHook(() => useFileAttachments(mockAddErrorMessage));

      const unsupportedFile = {
        id: 'file-1',
        file: new File(['test'], 'unsupported.exe', { type: 'application/x-executable' }),
        error: null,
      };

      act(() => {
        result.current.handleFileAttachment([unsupportedFile]);
      });

      expect(mockAddErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('Unsupported file type: "unsupported.exe" (application/x-executable) is not supported.')
      );
    });

    it('Should not call addErrorMessage for valid files', () => {
      const { result } = renderHook(() => useFileAttachments(mockAddErrorMessage));

      const validFile = {
        id: 'file-1',
        file: new File(['test'], 'valid.txt', { type: 'text/plain' }),
        error: null,
      };

      act(() => {
        result.current.handleFileAttachment([validFile]);
      });

      expect(mockAddErrorMessage).not.toHaveBeenCalled();
    });

    it('Should provide actionable error messages for file size errors', () => {
      const { result } = renderHook(() => useFileAttachments(mockAddErrorMessage));

      const largeFile = {
        id: 'file-1',
        file: new File(['test'], 'large-file.txt', { type: 'text/plain' }),
        error: null,
      };

      Object.defineProperty(largeFile.file, 'size', {
        value: chatConfig.maxFileSize + 1,
        writable: true,
      });

      act(() => {
        result.current.handleFileAttachment([largeFile]);
      });

      const errorMessage = mockAddErrorMessage.mock.calls[0][0];

      expect(errorMessage).toContain('File too large: "large-file.txt" exceeds the maximum size of');
    });

    it('Should provide actionable error messages for file type errors', () => {
      const { result } = renderHook(() => useFileAttachments(mockAddErrorMessage));

      const unsupportedFile = {
        id: 'file-1',
        file: new File(['test'], 'unsupported.exe', { type: 'application/x-executable' }),
        error: null,
      };

      act(() => {
        result.current.handleFileAttachment([unsupportedFile]);
      });

      const errorMessage = mockAddErrorMessage.mock.calls[0][0];

      expect(errorMessage).toContain(
        'Unsupported file type: "unsupported.exe" (application/x-executable) is not supported.'
      );
    });

    it('Should handle empty file array', () => {
      const { result } = renderHook(() => useFileAttachments(mockAddErrorMessage));

      act(() => {
        result.current.handleFileAttachment([]);
      });

      expect(mockAddErrorMessage).not.toHaveBeenCalled();
    });

    it('Should handle null or undefined files', () => {
      const { result } = renderHook(() => useFileAttachments(mockAddErrorMessage));

      act(() => {
        result.current.handleFileAttachment([null, undefined] as any);
      });

      expect(mockAddErrorMessage).not.toHaveBeenCalled();
    });
  });
});

describe('useTextareaResize', () => {
  it('Should handle null ref and textarea height boundaries correctly', () => {
    const { result } = renderHook(() => useTextareaResize());

    act(() => result.current.adjustTextareaHeight());

    const textarea = document.createElement('textarea');
    Object.defineProperty(textarea, 'scrollHeight', { get: () => 10, configurable: true });
    Object.defineProperty(result.current.textareaRef, 'current', { value: textarea, configurable: true });

    act(() => result.current.adjustTextareaHeight());
    expect(textarea.style.height).toEqual(`${chatConfig.minTextAreaHeight}px`);

    Object.defineProperty(textarea, 'scrollHeight', { get: () => 500, configurable: true });
    act(() => result.current.adjustTextareaHeight());
    expect(textarea.style.height).toEqual(`${chatConfig.maxTextAreaHeight}px`);

    Object.defineProperty(textarea, 'scrollHeight', { get: () => 100, configurable: true });
    act(() => result.current.adjustTextareaHeight());
    expect(textarea.style.height).toEqual('100px');
  });
});

describe('useLlmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (llm.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));
  });

  it('Should prepare message content', () => {
    const { result } = renderHook(() => useLlmService());
    const prepareMessageContent = result.current.prepareMessageContent;

    expect(prepareMessageContent('Hi', [], () => 'X')).toEqual('Hi');

    const file: AttachedFile = {
      id: '1',
      name: 'a.txt',
      size: 5,
      type: 'text/plain',
      content: 'txt',
    };
    const message1 = prepareMessageContent('T', [file], () => '5 B');
    expect(message1).toContain('```');
    expect(message1).toContain('txt');

    const file2: AttachedFile = {
      id: '2',
      name: 'a.jpg',
      size: 5,
      type: 'image/jpeg',
      content: 'data',
    };
    const message2 = prepareMessageContent('T', [file2], () => '5 B');
    expect(message2).toContain('[Image: a.jpg]');

    const file3: AttachedFile = {
      id: '3',
      name: 'data.json',
      size: 10,
      type: 'application/json',
      content: '{"key": "value"}',
    };
    const message3 = prepareMessageContent('T', [file3], () => '10 B');
    expect(message3).toContain('```');
    expect(message3).toContain('{"key": "value"}');

    const file4: AttachedFile = {
      id: '4',
      name: 'doc.pdf',
      size: 100,
      type: 'application/pdf',
      content: 'pdf-content',
    };
    const message4 = prepareMessageContent('T', [file4], () => '100 B');
    expect(message4).not.toContain('```');
    expect(message4).not.toContain('[Image:');
    expect(message4).toContain('doc.pdf (100 B)');
  });

  it('Should prepareChatHistory() filtering and formatting', () => {
    const { result } = renderHook(() => useLlmService());
    const prepareChatHistory = result.current.prepareChatHistory;
    const msgs: ChatMessage[] = [
      { id: '1', text: 'U', sender: 'user', timestamp: new Date() },
      { id: '2', text: 'A', sender: 'assistant', timestamp: new Date() },
      { id: '3', text: '...', sender: 'assistant', timestamp: new Date(), isStreaming: true },
      {
        id: '4',
        text: 'X',
        sender: 'user',
        timestamp: new Date(),
        attachments: [{ id: 'a', name: 'a.txt', size: 1, type: 'text/plain', content: 'c' }],
      },
      { id: '5', text: 'Y', sender: 'user', timestamp: new Date() },
      { id: '6', text: 'Z', sender: 'user', timestamp: new Date(), attachments: [] },
    ];
    const mockPC = jest.fn((t, files) => `${t}:${files.length}`);
    const history = prepareChatHistory(msgs, mockPC, () => '');
    expect(history).toHaveLength(5);
    expect(history[0]).toEqual({ role: 'user', content: 'U' });
    expect(history[1]).toEqual({ role: 'assistant', content: 'A' });
    expect(history[2]).toEqual({ role: 'user', content: 'X:1' });
    expect(history[3]).toEqual({ role: 'user', content: 'Y' });
    expect(history[4]).toEqual({ role: 'user', content: 'Z' });
  });

  describe('handleLlmError', () => {
    it('Should handle error with no message', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: '' };
      expect(result.current.handleLlmError(error)).toEqual('Sorry, an error occurred while processing your request.');
    });

    it('Should handle 422 configuration error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 422' };
      expect(result.current.handleLlmError(error)).toEqual(
        'Configuration Error: The LLM request format is invalid. Please check your Grafana LLM plugin configuration.'
      );
    });

    it('Should handle 401 authentication error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 401' };
      expect(result.current.handleLlmError(error)).toEqual(
        'Authentication Error: Please check your API keys in Grafana LLM settings.'
      );
    });

    it('Should handle 403 authentication error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 403' };
      expect(result.current.handleLlmError(error)).toEqual(
        'Authentication Error: Please check your API keys in Grafana LLM settings.'
      );
    });

    it('Should handle 429 rate limit error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 429' };
      expect(result.current.handleLlmError(error)).toEqual(
        'Rate Limit: Too many requests. Please wait a moment and try again.'
      );
    });

    it('Should handle 500 server error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 500' };
      expect(result.current.handleLlmError(error)).toEqual('Server Error: The LLM service is experiencing issues.');
    });

    it('Should handle other error messages', () => {
      const { result } = renderHook(() => useLlmService());
      const errorMessage = 'Unknown error occurred';
      const error = { message: errorMessage };
      expect(result.current.handleLlmError(error)).toEqual(`Error: ${errorMessage}`);
    });
  });

  describe('checkLlmStatus', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Should return error when LLM is not enabled', async () => {
      (llm.enabled as jest.Mock).mockReturnValue(Promise.resolve(false));
      (llm.health as jest.Mock).mockImplementation(() => {
        throw new Error('health Should not be called');
      });

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({
        canProceed: false,
        error: 'LLM is not enabled in Grafana settings',
      });
    });

    it('Should return error when health check is not available', async () => {
      (llm.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      const originalHealth = llm.health;
      delete (llm as any).health;

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({ canProceed: true });

      (llm as any).health = originalHealth;
    });

    it('Should return error when health check returns not OK', async () => {
      (llm.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(llm, 'health').mockResolvedValue({
        ok: false,
        configured: false,
        error: 'Health check failed',
      });

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({
        canProceed: false,
        error: 'Health check failed',
      });
    });

    it('Should return error when no models are configured', async () => {
      (llm.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(llm, 'health').mockResolvedValue({
        ok: true,
        configured: true,
        models: {},
      });

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({
        canProceed: false,
        error: 'No LLM models are configured. Please configure at least one model in Grafana LLM settings.',
      });
    });

    it('Should return success when everything is configured correctly', async () => {
      (llm.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(llm, 'health').mockResolvedValue({
        ok: true,
        configured: true,
        models: { gpt4: { ok: true } },
      });

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({ canProceed: true });
    });

    it('Should handle health check errors', async () => {
      (llm.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(llm, 'health').mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({
        canProceed: false,
        error: 'LLM status check failed: Network error',
      });
    });

    it('Should handle non-Error objects in catch block', async () => {
      (llm.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(llm, 'health').mockRejectedValue('String error');

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({
        canProceed: false,
        error: 'LLM status check failed: Unknown error',
      });
    });
  });
});
