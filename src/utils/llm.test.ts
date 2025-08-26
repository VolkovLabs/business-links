import { createToolResultHandler, filterTemporaryAnswers } from './llm';
import { ChatMessage, LlmRole } from '@/types';
import { createChatMessage } from './test';

describe('createToolResultHandler', () => {
  const mockAddMessages = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should create non-error tool message and call addMessages', () => {
    const handler = createToolResultHandler(mockAddMessages);
    handler('tool-call-id', 'Successful result');

    expect(mockAddMessages).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.anything(),
        isError: undefined,
        sender: LlmRole.TOOL,
        text: 'Tool Result: Successful result',
        isStreaming: false,
        timestamp: expect.anything(),
      }),
    ]);
  });

  it('Should create error tool message and call addMessages', () => {
    const handler = createToolResultHandler(mockAddMessages);
    handler('tool-call-id', 'Something went wrong', true);
    expect(mockAddMessages).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.anything(),
        isError: true,
        sender: LlmRole.TOOL,
        text: 'Error: Something went wrong',
        isStreaming: false,
        timestamp: expect.anything(),
        isTemporaryAnswer: false,
      }),
    ]);
  });

  it('Should create error tool message with temporary field', () => {
    const handler = createToolResultHandler(mockAddMessages);
    handler('tool-call-id', 'Something went wrong', true, false);
    expect(mockAddMessages).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.anything(),
        isError: true,
        sender: LlmRole.TOOL,
        text: 'Error: Something went wrong',
        isStreaming: false,
        timestamp: expect.anything(),
        isTemporaryAnswer: false,
      }),
    ]);
  });

  it('Should create error tool message with temporary field if undefined', () => {
    const handler = createToolResultHandler(mockAddMessages);
    handler('tool-call-id', 'Something went wrong', true, undefined);
    expect(mockAddMessages).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.anything(),
        isError: true,
        sender: LlmRole.TOOL,
        text: 'Error: Something went wrong',
        isStreaming: false,
        timestamp: expect.anything(),
        isTemporaryAnswer: false,
      }),
    ]);
  });

  it('Should create error tool message with temporary field if null', () => {
    const handler = createToolResultHandler(mockAddMessages);
    handler('tool-call-id', 'Something went wrong', true, null as unknown as undefined);
    expect(mockAddMessages).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.anything(),
        isError: true,
        sender: LlmRole.TOOL,
        text: 'Error: Something went wrong',
        isStreaming: false,
        timestamp: expect.anything(),
        isTemporaryAnswer: false,
      }),
    ]);
  });

  it('Should create error tool message with temporary field if true', () => {
    const handler = createToolResultHandler(mockAddMessages);
    handler('tool-call-id', 'Something went wrong', true, true);
    expect(mockAddMessages).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.anything(),
        isError: true,
        sender: LlmRole.TOOL,
        text: 'Error: Something went wrong',
        isStreaming: false,
        timestamp: expect.anything(),
        isTemporaryAnswer: true,
      }),
    ]);
  });
});

describe('filterTemporaryAnswers', () => {
  it('Should return empty array unchanged', () => {
    const input: ChatMessage[] = [];
    const result = filterTemporaryAnswers(input);
    expect(result).toEqual([]);
  });

  it('Should not filter array if last message is temporary', () => {
    const input = [
      createChatMessage({ id: '1', sender: LlmRole.USER, text: 'Hello' }),
      createChatMessage({ id: '2', sender: LlmRole.TOOL, text: 'Intermediate result', isTemporaryAnswer: true }),
    ];

    const result = filterTemporaryAnswers(input);
    expect(result).toEqual(input);
    expect(result).toHaveLength(2);
  });

  it('Should remove temporary messages if last message is NOT temporary', () => {
    const input = [
      createChatMessage({ id: '1', sender: LlmRole.USER, text: 'Request' }),
      createChatMessage({ id: '2', sender: LlmRole.TOOL, text: 'Intermediate result', isTemporaryAnswer: true }),
      createChatMessage({ id: '3', sender: LlmRole.TOOL, text: 'Intermediate result', isTemporaryAnswer: true }),
      createChatMessage({ id: '4', sender: LlmRole.ASSISTANT, text: 'Final result', isTemporaryAnswer: false }),
    ];

    const result = filterTemporaryAnswers(input);

    expect(result).toHaveLength(2);
    expect(result[0].id).toEqual('1');
    expect(result[1].id).toEqual('4');
    expect(result.some((msg) => msg.isTemporaryAnswer === true)).toBe(false);
  });

  it('Should not change array if there are no temporary messages', () => {
    const input = [
      createChatMessage({ id: '1', sender: LlmRole.USER, text: 'Request' }),
      createChatMessage({ id: '2', sender: LlmRole.TOOL, text: 'result', isTemporaryAnswer: false }),
      createChatMessage({ id: '3', sender: LlmRole.TOOL, text: 'result', isTemporaryAnswer: false }),
      createChatMessage({ id: '4', sender: LlmRole.ASSISTANT, text: 'Final result', isTemporaryAnswer: false }),
    ];

    const result = filterTemporaryAnswers(input);
    expect(result).toEqual(input);
    expect(result).toHaveLength(4);
  });

  it('Should remove temporary messages if last message has no isTemporaryAnswer field', () => {
    const input = [
      createChatMessage({}),
      createChatMessage({ id: '2', sender: LlmRole.TOOL, text: 'result', isTemporaryAnswer: true }),
      createChatMessage({ id: '3', sender: LlmRole.TOOL, text: 'result', isTemporaryAnswer: true }),
      createChatMessage({ id: '4', sender: LlmRole.ASSISTANT, text: 'Final result' }),
    ];

    const result = filterTemporaryAnswers(input);

    expect(result).toHaveLength(2);
    expect(result[0].id).toEqual('message-id');
    expect(result[1].id).toEqual('4');
  });

  it('Should keep single temporary message', () => {
    const input = [createChatMessage({ id: '4', sender: LlmRole.TOOL, text: 'Final result', isTemporaryAnswer: true })];

    const result = filterTemporaryAnswers(input);
    expect(result).toEqual(input);
    expect(result).toHaveLength(1);
  });

  it('Should handle mixed isTemporaryAnswer values correctly', () => {
    const input = [
      createChatMessage(),
      createChatMessage({ id: '2', sender: LlmRole.TOOL, text: 'result', isTemporaryAnswer: false }),
      createChatMessage({ id: '3', sender: LlmRole.TOOL, text: 'Temporary Result', isTemporaryAnswer: true }),
      createChatMessage({ id: '4', sender: LlmRole.ASSISTANT, text: 'Final answer', isTemporaryAnswer: false }),
    ];

    const result = filterTemporaryAnswers(input);

    expect(result).toHaveLength(3);
    expect(result.map((msg) => msg.id)).toEqual(['message-id', '2', '4']);
    expect(result.some((msg) => msg.isTemporaryAnswer === true)).toBe(false);
  });
});
