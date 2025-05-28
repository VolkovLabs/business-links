import { FieldType, toDataFrame } from '@grafana/data';
import { act, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { VisualLinkType } from '@/types';
import { createVisualLinkConfig } from '@/utils';

import { ContentElement } from './ContentElement';

/**
 * Props
 */
type Props = React.ComponentProps<typeof ContentElement>;

/**
 * Element
 */
describe('ContentElement', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.contentElement);
  const selectors = getSelectors(screen);

  /**
   * Panel Options
   */
  const defaultVisualLink = createVisualLinkConfig({
    content: 'line 1',
    name: 'Content',
    type: VisualLinkType.HTML,
  });

  const replaceVariables = jest.fn();

  /**
   * Frames
   */
  const frameA = toDataFrame({
    refId: 'A',
    fields: [
      {
        name: 'name',
        type: FieldType.string,
        values: [],
      },
      {
        name: 'value',
        type: FieldType.number,
        values: [],
      },
    ],
  });
  const frameWithIndex = toDataFrame({
    fields: [
      {
        name: 'name',
        type: FieldType.string,
        values: [],
      },
      {
        name: 'value',
        type: FieldType.number,
        values: [],
      },
    ],
  });

  const defaultData = [frameA, frameWithIndex];
  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <ContentElement link={defaultVisualLink} {...(props as any)} replaceVariables={replaceVariables} />;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renders', () => {
    it('Should render element', async () => {
      const replaceVariables = jest.fn();
      await act(async () => render(getComponent({ replaceVariables: replaceVariables, panelData: defaultData })));
      expect(selectors.root(false, defaultVisualLink.name)).toBeInTheDocument();
    });

    it('Should render element with grid styles', async () => {
      const replaceVariables = jest.fn();
      await act(async () =>
        render(getComponent({ replaceVariables: replaceVariables, panelData: defaultData, gridMode: true }))
      );
      expect(selectors.root(false, defaultVisualLink.name)).toBeInTheDocument();
      expect(selectors.root(false, defaultVisualLink.name)).toHaveStyle(`width: 100%`);
    });

    it('Should render error', async () => {
      const replaceVariables = jest.fn();

      const linkMock = {
        ...defaultVisualLink,
        content: 'test {{ variableHelperUndefined __from}}',
      };

      await act(async () =>
        render(
          getComponent({ replaceVariables: replaceVariables, panelData: defaultData, gridMode: true, link: linkMock })
        )
      );
      expect(selectors.alert(false, defaultVisualLink.name)).toBeInTheDocument();
      expect(selectors.alertText()).toBeInTheDocument();
      expect(selectors.alertText()).toHaveTextContent('Missing helper: "variableHelperUndefined"');
    });
  });
});
