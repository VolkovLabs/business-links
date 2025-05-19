import { CodeEditorSuggestionItem } from '@grafana/ui';
import { AutosizeCodeEditor } from '@volkovlabs/components';
/**
 * Monaco
 */
import type * as monacoType from 'monaco-editor/esm/vs/editor/editor.api';
import React, { useCallback } from 'react';

import { TEST_IDS } from '@/constants';
import { CodeLanguage } from '@/types';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   */
  value: string;

  /**
   * On change
   */
  onChange: (value: string) => void;
}

/**
 * Custom Code Editor
 */
export const CustomCodeEditor: React.FC<Props> = ({ value, onChange }) => {
  /**
   * Format On Mount
   */
  const onEditorMount = useCallback((editor: monacoType.editor.IStandaloneCodeEditor) => {
    setTimeout(() => {
      editor.getAction('editor.action.formatDocument').run();
    }, 100);
  }, []);

  /**
   * Suggestions
   * May be expanded in the future
   */
  const getSuggestions = useCallback((): CodeEditorSuggestionItem[] => {
    return [];
  }, []);

  return (
    <div {...TEST_IDS.customCodeEditor.root.apply()}>
      <AutosizeCodeEditor
        language={CodeLanguage.HANDLEBARS}
        showLineNumbers={true}
        showMiniMap={value?.length > 100}
        value={value}
        onBlur={onChange}
        onSave={onChange}
        monacoOptions={{ formatOnPaste: true, formatOnType: true, scrollBeyondLastLine: false }}
        onEditorDidMount={onEditorMount}
        getSuggestions={getSuggestions}
      />
    </div>
  );
};
