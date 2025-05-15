import { formattedValueToString } from '@grafana/data';

import { prepareContentData } from './content';

jest.mock('@grafana/data', () => ({
  ...jest.requireActual('@grafana/data'),
  formattedValueToString: jest.fn(),
}));

describe('prepareContentData', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should return raw values if no unit is defined', () => {
    const frame = {
      fields: [
        {
          name: 'raw',
          type: 'number',
          config: {},
          values: [1, 2],
        },
      ],
    };

    const result = prepareContentData([frame as any]);

    expect(result).toEqual([[{ raw: 1 }, { raw: 2 }]]);
  });

  it('Should format value if unit and display are defined', () => {
    const display = jest.fn((v) => ({ text: `Value: ${v}` }));
    const frame = {
      fields: [
        {
          name: 'temperature',
          type: 'number',
          config: { unit: 'celsius' },
          values: [100, 200],
          display,
        },
      ],
      length: 2,
    };

    prepareContentData([frame as any]);

    expect(display).toHaveBeenCalledWith(100);
    expect(display).toHaveBeenCalledWith(200);
    expect(formattedValueToString).toHaveBeenCalledTimes(2);
  });

  it('Should accumulate multiple fields per row', () => {
    const frame = {
      fields: [
        {
          name: 'first',
          type: 'string',
          config: {},
          values: ['a', 'b'],
        },
        {
          name: 'second',
          type: 'string',
          config: {},
          values: ['x', 'y'],
        },
      ],
      length: 2,
    };

    const result = prepareContentData([frame as any]);

    expect(result).toEqual([
      [
        { first: 'a', second: 'x' },
        { first: 'b', second: 'y' },
      ],
    ]);
  });

  it('Should support multiple frames', () => {
    const frame1 = {
      fields: [
        {
          name: 'aTest',
          type: 'number',
          config: {},
          values: [1],
        },
      ],
      length: 1,
    };

    const frame2 = {
      fields: [
        {
          name: 'bTest',
          type: 'number',
          config: {},
          values: [2],
        },
      ],
      length: 1,
    };

    const result = prepareContentData([frame1 as any, frame2 as any]);

    expect(result).toEqual([[{ aTest: 1 }], [{ bTest: 2 }]]);
  });
});
