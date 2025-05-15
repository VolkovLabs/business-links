import { FieldType, toDataFrame } from '@grafana/data';
import { act, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { VisualLinkType } from '@/types';
import { createGroupConfig, createLinkConfig, createNestedLinkConfig, createVisualLinkConfig } from '@/utils';

import { ContentElement } from '../ContentElement';
import { LinkElement } from '../LinkElement';
import { TimePickerElement } from '../TimePickerElement';
import { LinksLayout } from './LinksLayout';

/**
 * Props
 */
type Props = React.ComponentProps<typeof LinksLayout>;

/**
 * In Test Ids
 */
const inTestIds = {
  linkElement: createSelector('data-testid link-element'),
  timePickerElement: createSelector('data-testid time-picker-element'),
  contentElement: createSelector('data-testid content-element'),
};

/**
 * Mock Link Element
 */
const LinkElementMock = () => <div {...inTestIds.linkElement.apply()} />;

jest.mock('../LinkElement', () => ({
  LinkElement: jest.fn(),
}));

/**
 * Mock Time Picker Element
 */
const TimePickerMock = () => <div {...inTestIds.timePickerElement.apply()} />;

jest.mock('../TimePickerElement', () => ({
  TimePickerElement: jest.fn(),
}));

/**
 * Mock Content Element
 */
const ContentElementMock = () => <div {...inTestIds.contentElement.apply()} />;

jest.mock('../ContentElement', () => ({
  ContentElement: jest.fn(),
}));

describe('Links layout', () => {
  /**
   * Default
   */
  const nestedLink = createNestedLinkConfig({ name: 'Link1', url: '', isCurrentLink: true });

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

  const getComponent = (props: Props) => {
    return <LinksLayout {...props} />;
  };
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.linksLayout,
    ...inTestIds,
  });

  const selectors = getSelectors(screen);

  beforeEach(() => {
    jest.mocked(LinkElement).mockImplementation(LinkElementMock);
    jest.mocked(TimePickerElement).mockImplementation(TimePickerMock);
    jest.mocked(ContentElement).mockImplementation(ContentElementMock);
  });

  it('Should render Layout', async () => {
    const activeGroup = createGroupConfig({
      items: [createLinkConfig({ name: 'Link1', url: '' })],
    });

    const defaultLink = createVisualLinkConfig({
      name: 'Link1',
      links: [nestedLink],
    });

    const defaultTimePickerLink = createVisualLinkConfig({
      name: 'Link2',
      type: VisualLinkType.TIMEPICKER,
    });

    const defaultContentElement = createVisualLinkConfig({
      name: 'Link3',
      type: VisualLinkType.HTML,
      content: 'line',
    });

    await act(async () =>
      render(
        getComponent({
          currentLinks: [defaultLink, defaultTimePickerLink, defaultContentElement],
          activeGroup: activeGroup,
          panelData: defaultData,
          replaceVariables: replaceVariables,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.timePickerElement()).toBeInTheDocument();
    expect(selectors.contentElement()).toBeInTheDocument();
    expect(selectors.linkElement()).toBeInTheDocument();
  });
});
