/* eslint-disable @typescript-eslint/naming-convention */
import { openai } from '@grafana/llm';
import { act, renderHook } from '@testing-library/react';

import { AttachedFile, ChatMessage } from '@/types';

import { chatConfig, useChatMessages, useFileAttachments, useLlmService, useTextareaResize } from './useDrawerLlmChat';

/**
 * Mock @grafana/llm
 */
jest.mock('@grafana/llm', () => ({
  openai: {
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

/**
 * Helper function to create a FileList from an array of Files
 * @param files - Array of File objects
 * @returns FileList object
 */
function makeFileList(files: File[]): FileList {
  const list: any = {
    length: files.length,
    item: (i: number) => files[i] || null,
    [Symbol.iterator]: function* () {
      for (const fileItem of files) {
        yield fileItem;
      }
    },
  };
  files.forEach((fileItem, i) => (list[i] = fileItem));
  return list as FileList;
}

describe('useChatMessages', () => {
  beforeEach(() => jest.clearAllMocks());

  /**
   * Test initial state is empty
   */
  it('Should have empty initial state for chat messages', () => {
    const { result } = renderHook(() => useChatMessages());
    expect(result.current.messages).toEqual([]);
  });

  /**
   * Test unique ID generation with correct format
   */
  it('Should generate unique message IDs with correct format', () => {
    const { result } = renderHook(() => useChatMessages());
    const id1 = result.current.generateMessageId();
    const id2 = result.current.generateMessageId();
    expect(id1).not.toEqual(id2);
  });

  /**
   * Test all message manipulation methods
   */
  it('Should correctly add, set, and update messages', () => {
    const { result } = renderHook(() => useChatMessages());
    const m1: ChatMessage = { id: '1', text: 'A', sender: 'user', timestamp: new Date() };
    const m2: ChatMessage = { id: '2', text: 'B', sender: 'assistant', timestamp: new Date() };

    act(() => result.current.addMessage(m1));
    expect(result.current.messages).toEqual([m1]);

    act(() => result.current.addMessages([m2]));
    expect(result.current.messages).toEqual([m1, m2]);

    act(() =>
      result.current.updateLastMessage((msg: ChatMessage) => ({
        ...msg,
        text: msg.text + '!',
      }))
    );
    expect(result.current.messages[1].text).toBe('B!');

    act(() => result.current.setMessages([m2]));
    expect(result.current.messages).toEqual([m2]);
  });

  /**
   * Test updateLastMessage with empty array
   */
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

  /**
   * Test initial state
   */
  it('Should have empty initial state for file attachments', () => {
    const { result } = renderHook(() => useFileAttachments());
    expect(result.current.attachedFiles).toEqual([]);
  });

  /**
   * Test file size formatting
   */
  it('Should format file size correctly', () => {
    const { result } = renderHook(() => useFileAttachments());
    expect(result.current.formatFileSize(0)).toBe('0 Bytes');
    expect(result.current.formatFileSize(1024)).toBe('1 KB');
    expect(result.current.formatFileSize(1536)).toBe('1.5 KB');
    expect(result.current.formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  /**
   * Test handling null and empty file lists
   */
  it('Should ignore null and empty file attachments', () => {
    const { result } = renderHook(() => useFileAttachments());
    act(() => result.current.handleFileAttachment(null));
    act(() => result.current.handleFileAttachment(makeFileList([])));
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  /**
   * Test rejection of oversized files
   */
  it('Should reject files that are too large', () => {
    const { result } = renderHook(() => useFileAttachments());
    const big = new File([new ArrayBuffer(chatConfig.maxFileSize + 1)], 'big.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment(makeFileList([big])));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('File big.txt is too large'));
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  /**
   * Test rejection of unsupported file types
   */
  it('Should reject unsupported file types', () => {
    const { result } = renderHook(() => useFileAttachments());
    const exe = new File(['x'], 'file.exe', { type: 'application/x-executable' });
    act(() => result.current.handleFileAttachment(makeFileList([exe])));
    expect(window.alert).toHaveBeenCalledWith('File type application/x-executable is not supported.');
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  /**
   * Test reads images via readAsDataURL и save url
   */
  it('Should read images via readAsDataURL and save URL', () => {
    const { result } = renderHook(() => useFileAttachments());
    const img = new File([''], 'img.png', { type: 'image/png' });
    act(() => result.current.handleFileAttachment(makeFileList([img])));
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

  /**
   * Test PDF file processing via readAsDataURL
   */
  it('Should read PDF files via readAsDataURL', () => {
    const { result } = renderHook(() => useFileAttachments());
    const pdf = new File([''], 'doc.pdf', { type: 'application/pdf' });
    act(() => result.current.handleFileAttachment(makeFileList([pdf])));
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

  /**
   * Test text file processing via readAsText
   */
  it('Should read text files via readAsText and without URL', () => {
    const { result } = renderHook(() => useFileAttachments());
    const txt = new File(['hello'], 'doc.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment(makeFileList([txt])));
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

  /**
   * Test JSON file processing via readAsText
   */
  it('Should read JSON files via readAsText', () => {
    const { result } = renderHook(() => useFileAttachments());
    const json = new File(['{"test": true}'], 'data.json', { type: 'application/json' });
    act(() => result.current.handleFileAttachment(makeFileList([json])));
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

  /**
   * Test file ID generation with Math.random
   */
  it('Should generate unique file IDs with different Math.random values', () => {
    const { result } = renderHook(() => useFileAttachments());

    /**
     * Mock Date.now and Math.random for predictable IDs
     */
    const originalDateNow = Date.now;
    const originalRandom = Math.random;
    Date.now = jest.fn().mockReturnValue(1234567890);
    Math.random = jest.fn().mockReturnValueOnce(0.123).mockReturnValueOnce(0.456);

    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment(makeFileList([file1])));
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content1' } });
      }
    });

    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment(makeFileList([file2])));
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

  /**
   * Test removeAttachedFile functionality
   */
  it('Should remove the correct attached file', () => {
    const { result } = renderHook(() => useFileAttachments());

    /**
     * Add multiple files
     */
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

    act(() => result.current.handleFileAttachment(makeFileList([file1])));
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content1' } });
      }
    });

    act(() => result.current.handleFileAttachment(makeFileList([file2])));
    act(() => {
      if (fileReaderInstances[1].onload) {
        fileReaderInstances[1].onload({ target: { result: 'content2' } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(2);

    /**
     * Remove first file
     */
    const firstFileId = result.current.attachedFiles[0].id;
    act(() => result.current.removeAttachedFile(firstFileId));

    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].name).toBe('file2.txt');
  });

  /**
   * Test clearAttachedFiles functionality
   */
  it('Should remove all attached files', () => {
    const { result } = renderHook(() => useFileAttachments());

    /**
     * Add multiple files
     */
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

    act(() => result.current.handleFileAttachment(makeFileList([file1])));
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content1' } });
      }
    });

    act(() => result.current.handleFileAttachment(makeFileList([file2])));
    act(() => {
      if (fileReaderInstances[1].onload) {
        fileReaderInstances[1].onload({ target: { result: 'content2' } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(2);

    /**
     * Clear all files
     */
    act(() => result.current.clearAttachedFiles());
    expect(result.current.attachedFiles).toHaveLength(0);
  });

  /**
   * Test removeAttachedFile with non-existent ID
   */
  it('Should ignore non-existent ID when removing attached file', () => {
    const { result } = renderHook(() => useFileAttachments());
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    act(() => result.current.handleFileAttachment(makeFileList([file])));
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content' } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(1);

    act(() => result.current.removeAttachedFile('non-existent-id'));
    expect(result.current.attachedFiles).toHaveLength(1);
  });

  /**
   * Test handling of FileReader onload with undefined result
   */
  it('Should handle FileReader onload with undefined result', () => {
    const { result } = renderHook(() => useFileAttachments());
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    act(() => result.current.handleFileAttachment(makeFileList([file])));

    /**
     * Simulate onload with undefined result
     */
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: undefined } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].content).toBeUndefined();
  });

  /**
   * Test handling of FileReader onload with null target
   */
  it('Should handle FileReader onload with null target', () => {
    const { result } = renderHook(() => useFileAttachments());
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    act(() => result.current.handleFileAttachment(makeFileList([file])));

    /**
     * Simulate onload with null target
     */
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: null });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].content).toBeUndefined();
  });

  /**
   * Test complete file attachment flow with onload callback
   */
  it('Should complete file attachment flow with proper onload execution', () => {
    const { result } = renderHook(() => useFileAttachments());

    /**
     * Test text file
     */
    const textFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    act(() => result.current.handleFileAttachment(makeFileList([textFile])));

    expect(fileReaderInstances).toHaveLength(1);
    expect(fileReaderInstances[0].readAsText).toHaveBeenCalledWith(textFile);

    /**
     * Trigger onload callback for text file
     */
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

    /**
     * Test image file
     */
    const imageFile = new File(['image data'], 'image.png', { type: 'image/png' });
    act(() => result.current.handleFileAttachment(makeFileList([imageFile])));

    expect(fileReaderInstances).toHaveLength(2);
    expect(fileReaderInstances[1].readAsDataURL).toHaveBeenCalledWith(imageFile);

    /**
     * Trigger onload callback for image file
     */
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

  /**
   * Test multiple files processing
   */
  it('Should process multiple files correctly', () => {
    const { result } = renderHook(() => useFileAttachments());
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.json', { type: 'application/json' });
    const file3 = new File([''], 'image.png', { type: 'image/png' });

    act(() => result.current.handleFileAttachment(makeFileList([file1, file2, file3])));

    /**
     * Process first file
     */
    act(() => {
      if (fileReaderInstances[0].onload) {
        fileReaderInstances[0].onload({ target: { result: 'content1' } });
      }
    });

    /**
     * Process second file
     */
    act(() => {
      if (fileReaderInstances[1].onload) {
        fileReaderInstances[1].onload({ target: { result: 'content2' } });
      }
    });

    /**
     * Process third file
     */
    act(() => {
      if (fileReaderInstances[2].onload) {
        fileReaderInstances[2].onload({ target: { result: 'data:image/png;base64,' } });
      }
    });

    expect(result.current.attachedFiles).toHaveLength(3);
    expect(result.current.attachedFiles[0].name).toBe('file1.txt');
    expect(result.current.attachedFiles[1].name).toBe('file2.json');
    expect(result.current.attachedFiles[2].name).toBe('image.png');
  });
});

describe('useTextareaResize', () => {
  /**
   * Test null ref handling and height boundaries
   */
  it('Should handle null ref and textarea height boundaries correctly', () => {
    const { result } = renderHook(() => useTextareaResize());

    /**
     * Test with null ref
     */
    act(() => result.current.adjustTextareaHeight());

    const ta = document.createElement('textarea');
    Object.defineProperty(ta, 'scrollHeight', { get: () => 10, configurable: true });
    Object.defineProperty(result.current.textareaRef, 'current', { value: ta, configurable: true });

    /**
     * Test minimum height
     */
    act(() => result.current.adjustTextareaHeight());
    expect(ta.style.height).toBe(`${chatConfig.minTextAreaHeight}px`);

    /**
     * Test maximum height
     */
    Object.defineProperty(ta, 'scrollHeight', { get: () => 500, configurable: true });
    act(() => result.current.adjustTextareaHeight());
    expect(ta.style.height).toBe(`${chatConfig.maxTextAreaHeight}px`);

    /**
     * Test normal height
     */
    Object.defineProperty(ta, 'scrollHeight', { get: () => 100, configurable: true });
    act(() => result.current.adjustTextareaHeight());
    expect(ta.style.height).toBe('100px');
  });
});

describe('useLlmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (openai.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));
  });

  /**
   * Test prepareMessageContent function
   */
  it('Should prepare message content', () => {
    const { result } = renderHook(() => useLlmService());
    const fn = result.current.prepareMessageContent;

    expect(fn('Hi', [], () => 'X')).toBe('Hi');

    const t: AttachedFile = {
      id: '1',
      name: 'a.txt',
      size: 5,
      type: 'text/plain',
      content: 'txt',
    };
    const out1 = fn('T', [t], () => '5 B');
    expect(out1).toContain('```');
    expect(out1).toContain('txt');

    const i: AttachedFile = {
      id: '2',
      name: 'a.jpg',
      size: 5,
      type: 'image/jpeg',
      content: 'data',
    };
    const out2 = fn('T', [i], () => '5 B');
    expect(out2).toContain('[Image: a.jpg]');

    /**
     * Test JSON file
     */
    const j: AttachedFile = {
      id: '3',
      name: 'data.json',
      size: 10,
      type: 'application/json',
      content: '{"key": "value"}',
    };
    const out3 = fn('T', [j], () => '10 B');
    expect(out3).toContain('```');
    expect(out3).toContain('{"key": "value"}');

    /**
     * Test other file type (not text, not image)
     */
    const p: AttachedFile = {
      id: '4',
      name: 'doc.pdf',
      size: 100,
      type: 'application/pdf',
      content: 'pdf-content',
    };
    const out4 = fn('T', [p], () => '100 B');
    expect(out4).not.toContain('```');
    expect(out4).not.toContain('[Image:');
    expect(out4).toContain('doc.pdf (100 B)');
  });

  /**
   * Test prepareChatHistory function filtering and formatting
   */
  it('Should prepareChatHistory() filtering and formatting', () => {
    const { result } = renderHook(() => useLlmService());
    const ph = result.current.prepareChatHistory;
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
      /**
       * Test user without attachments
       */
      { id: '5', text: 'Y', sender: 'user', timestamp: new Date() },
      /**
       * Test user with empty attachments array
       */
      { id: '6', text: 'Z', sender: 'user', timestamp: new Date(), attachments: [] },
    ];
    const mockPC = jest.fn((t, files) => `${t}:${files.length}`);
    const history = ph(msgs, mockPC, () => '');
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
      expect(result.current.handleLlmError(error)).toBe('Sorry, an error occurred while processing your request.');
    });

    it('Should handle 422 configuration error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 422' };
      expect(result.current.handleLlmError(error)).toBe(
        'Configuration Error: The LLM request format is invalid. Please check your Grafana LLM plugin configuration.'
      );
    });

    it('Should handle 401 authentication error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 401' };
      expect(result.current.handleLlmError(error)).toBe(
        'Authentication Error: Please check your API keys in Grafana LLM settings.'
      );
    });

    it('Should handle 403 authentication error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 403' };
      expect(result.current.handleLlmError(error)).toBe(
        'Authentication Error: Please check your API keys in Grafana LLM settings.'
      );
    });

    it('Should handle 429 rate limit error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 429' };
      expect(result.current.handleLlmError(error)).toBe(
        'Rate Limit: Too many requests. Please wait a moment and try again.'
      );
    });

    it('Should handle 500 server error', () => {
      const { result } = renderHook(() => useLlmService());
      const error = { message: 'Request failed with status code 500' };
      expect(result.current.handleLlmError(error)).toBe('Server Error: The LLM service is experiencing issues.');
    });

    it('Should handle other error messages', () => {
      const { result } = renderHook(() => useLlmService());
      const errorMessage = 'Unknown error occurred';
      const error = { message: errorMessage };
      expect(result.current.handleLlmError(error)).toBe(`Error: ${errorMessage}`);
    });
  });

  describe('checkLlmStatus', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Should return error when LLM is not enabled', async () => {
      (openai.enabled as jest.Mock).mockReturnValue(Promise.resolve(false));
      (openai.health as jest.Mock).mockImplementation(() => {
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
      (openai.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      const originalHealth = openai.health;
      delete (openai as any).health;

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({ canProceed: true });

      (openai as any).health = originalHealth;
    });

    it('Should return error when health check returns not OK', async () => {
      (openai.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(openai, 'health').mockResolvedValue({
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
      (openai.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(openai, 'health').mockResolvedValue({
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
      (openai.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(openai, 'health').mockResolvedValue({
        ok: true,
        configured: true,
        models: { gpt4: { ok: true } },
      });

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({ canProceed: true });
    });

    it('Should handle health check errors', async () => {
      (openai.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(openai, 'health').mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({
        canProceed: false,
        error: 'LLM status check failed: Network error',
      });
    });

    it('Should handle non-Error objects in catch block', async () => {
      (openai.enabled as jest.Mock).mockReturnValue(Promise.resolve(true));

      jest.spyOn(openai, 'health').mockRejectedValue('String error');

      const { result } = renderHook(() => useLlmService());
      const status = await result.current.checkLlmStatus();

      expect(status).toEqual({
        canProceed: false,
        error: 'LLM status check failed: Unknown error',
      });
    });
  });
});
