import { createToolResultHandler } from './llm';

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
        sender: 'tool',
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
        sender: 'tool',
        text: 'Error: Something went wrong',
        isStreaming: false,
        timestamp: expect.anything(),
      }),
    ]);
  });
});
