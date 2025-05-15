import { textUtil } from '@grafana/data';
import { config } from '@grafana/runtime';

import { replaceVariablesHelper } from './helpers';
import { generateHtml } from './html';

jest.mock('./helpers', () => ({
  replaceVariablesHelper: jest.fn(),
}));

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: {
    disableSanitizeHtml: false,
  },
}));

/**
 * Mock @grafana/data
 */
jest.mock('@grafana/data', () => ({
  ...jest.requireActual('@grafana/data'),
  textUtil: {
    sanitize: jest.fn((str) => str),
  },
}));

describe('HTML helpers', () => {
  const defaultData = {
    data: [
      [
        {
          test: 'value 1',
        },
      ],
      [
        {
          test2: 'value 2',
        },
      ],
    ],
  };

  const replaceVariables = jest.fn((str: string) => `replaced_${str}`);

  describe('Generate HTML', () => {
    beforeEach(() => {
      jest.mocked(textUtil.sanitize).mockClear();
    });

    it('Should sanitize html', () => {
      const content = `<div></div>`;

      generateHtml({
        data: defaultData,
        content,
        replaceVariables,
      });

      expect(textUtil.sanitize).toHaveBeenCalledWith(content);
    });

    it('Should not sanitize html if disabled', () => {
      const content = `<div></div>`;

      /**
       * Disable sanitizing
       */
      config.disableSanitizeHtml = true;

      generateHtml({
        data: defaultData,
        content,
        replaceVariables,
      } as any);

      expect(textUtil.sanitize).not.toHaveBeenCalled();

      /**
       * Return default value
       */
      config.disableSanitizeHtml = false;
    });
  });

  it('should use helpers replaceVariablesHelper (variable)', async () => {
    const content = 'Variable: {{variable testVar}}';

    await generateHtml({
      data: defaultData,
      content,
      replaceVariables,
    });

    expect(replaceVariablesHelper).toHaveBeenCalled();
  });

  it('should use helpers replaceVariables (variableValue)', async () => {
    const content = 'Variable: {{variableValue testVar}}';

    await generateHtml({
      data: defaultData,
      content,
      replaceVariables,
    });

    expect(replaceVariables).toHaveBeenCalled();
  });
});
