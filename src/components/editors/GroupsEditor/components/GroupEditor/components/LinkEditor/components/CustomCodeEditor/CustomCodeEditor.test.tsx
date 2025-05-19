import { render, screen } from '@testing-library/react';
import { AutosizeCodeEditor } from '@volkovlabs/components';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { CustomCodeEditor } from './CustomCodeEditor';

/**
 * Mock @grafana/ui
 */
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  CodeEditor: jest.fn().mockImplementation(() => null),
}));

/**
 * Mock @volkovlabs/components
 */
jest.mock('@volkovlabs/components', () => ({
  ...jest.requireActual('@volkovlabs/components'),
  AutosizeCodeEditor: jest.fn().mockImplementation(() => null),
}));

/**
 * Mock timers
 */
jest.useFakeTimers();

/**
 * Custom Editor
 */
describe('Custom Editor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.customCodeEditor);
  const selectors = getSelectors(screen);

  const onChange = jest.fn();

  /**
   * Get Tested Component
   * @param restProps
   * @param context
   */
  const getComponent = ({ ...restProps }: any) => {
    return <CustomCodeEditor {...restProps} onChange={onChange} />;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should find component', async () => {
    render(getComponent({}));
    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should make correct suggestions for handlebars', () => {
    let suggestionsResult;

    jest.mocked(AutosizeCodeEditor).mockImplementation(({ getSuggestions }: any) => {
      suggestionsResult = getSuggestions();
      return null;
    });

    render(getComponent({}));

    expect(suggestionsResult).toEqual([]);
  });

  it('Should enable formatting if enabled', () => {
    const runFormatDocument = jest.fn();
    const editor = {
      getAction: jest.fn().mockImplementation(() => ({
        run: runFormatDocument,
      })),
    };

    jest.mocked(AutosizeCodeEditor).mockImplementation(({ onEditorDidMount }: any) => {
      onEditorDidMount(editor);
      return null;
    });

    render(getComponent({}));

    jest.runAllTimers();

    expect(AutosizeCodeEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        monacoOptions: {
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
        },
      }),
      expect.anything()
    );

    expect(editor.getAction).toHaveBeenCalledWith('editor.action.formatDocument');
    expect(runFormatDocument).toHaveBeenCalled();
  });
});
