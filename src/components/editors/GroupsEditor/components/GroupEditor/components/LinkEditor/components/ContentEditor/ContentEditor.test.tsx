import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { CustomCodeEditor } from '../CustomCodeEditor';
import { ContentEditor } from './ContentEditor';

type Props = React.ComponentProps<typeof ContentEditor>;

const inTestIds = {
  customCodeEditor: createSelector('data-testid custom-code-editor'),
};

/**
 * Mock CustomCodeEditor
 */
const CustomCodeEditorMock = ({ value, onChange }: any) => {
  return (
    <input
      {...inTestIds.customCodeEditor.apply()}
      onChange={() => {
        onChange(value);
      }}
    />
  );
};

jest.mock('../CustomCodeEditor', () => ({
  CustomCodeEditor: jest.fn(),
}));

describe('LinkEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <ContentEditor onChange={onChange} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(CustomCodeEditor).mockImplementation(CustomCodeEditorMock);
  });

  it('Should find component', async () => {
    render(getComponent({ value: {} as any }));
    expect(selectors.customCodeEditor()).toBeInTheDocument();
  });

  it('Should call onChange', async () => {
    const onChange = jest.fn();

    render(getComponent({ value: {} as any, onChange: onChange }));
    expect(selectors.customCodeEditor()).toBeInTheDocument();

    fireEvent.change(selectors.customCodeEditor(), { target: { value: 'Line' } });

    expect(onChange).toHaveBeenCalled();
  });
});
