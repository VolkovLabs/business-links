import { createToolResultHandler } from './llm';
import { LlmRole } from '@/types';

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
