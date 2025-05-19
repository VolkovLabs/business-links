import React, { useCallback } from 'react';

import { FieldsGroup } from '@/components';
import { EditorProps, LinkConfig } from '@/types';

import { CustomCodeEditor } from '../CustomCodeEditor';

/**
 * Properties
 */
type Props = EditorProps<LinkConfig>;

/**
 * Content Editor
 */
export const ContentEditor: React.FC<Props> = ({ value, onChange }) => {
  const onChangeContent = useCallback(
    (currentContent: string) => {
      onChange({
        ...value,
        htmlConfig: {
          ...value.htmlConfig,
          content: currentContent,
        },
      });
    },
    [onChange, value]
  );

  return (
    <FieldsGroup label="Content editor">
      <CustomCodeEditor value={value.htmlConfig?.content ?? ''} onChange={onChangeContent} />
    </FieldsGroup>
  );
};
