import { createTheme } from '@grafana/data';
import { act, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ButtonSize, DropdownAlign, DropdownType, LinkType, VisualLinkType } from '@/types';
import { createDropdownConfig, createNestedLinkConfig, createVisualLinkConfig } from '@/utils';

import { LinkElement } from '../LinkElement';
import { TimePickerElement } from '../TimePickerElement';
import { MenuElement } from './MenuElement';

/**
 * Props
 */
type Props = React.ComponentProps<typeof MenuElement>;

/**
 * In Test Ids
 */
const inTestIds = {
  linkElement: createSelector('data-testid link-element'),
  timePickerElement: createSelector('data-testid time-picker-element'),
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
 * Element
 */
describe('MenuElement', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.menuElement,
    ...inTestIds,
  });

  /**
   * Selectors
   */
  const theme = createTheme();

  const selectors = getSelectors(screen);

  /**
   * Panel Options
   */
  const defaultVisualLink = createVisualLinkConfig({
    type: VisualLinkType.MENU,
    name: 'Menu',
    dropdownConfig: createDropdownConfig({
      type: DropdownType.DROPDOWN,
    }),
  });

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <MenuElement link={defaultVisualLink} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(LinkElement).mockImplementation(LinkElementMock);
    jest.mocked(TimePickerElement).mockImplementation(TimePickerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renders', () => {
    it('Should render dropdown element as default', async () => {
      const link1 = createNestedLinkConfig({
        url: 'Test.com',
      });
      const link2 = createNestedLinkConfig({
        linkType: LinkType.TIMEPICKER,
      });
      const defaultLink = {
        ...defaultVisualLink,
        links: [
          link1,
          {
            ...link2,
            linkType: VisualLinkType.TIMEPICKER,
          },
        ],
      } as any;
      await act(async () => render(getComponent({ link: defaultLink })));
      expect(selectors.linkElement()).toBeInTheDocument();
    });

    it('Should render dropdown row', async () => {
      const link1 = createNestedLinkConfig({});
      const link2 = createNestedLinkConfig({
        linkType: LinkType.TIMEPICKER,
      });
      const defaultLink = {
        ...defaultVisualLink,
        dropdownConfig: createDropdownConfig({
          type: DropdownType.ROW,
        }),
        links: [
          link1,
          {
            ...link2,
            linkType: VisualLinkType.TIMEPICKER,
          },
        ],
      } as any;

      await act(async () => render(getComponent({ link: defaultLink })));
      expect(selectors.linkElement(true)).not.toBeInTheDocument();

      expect(selectors.root()).toBeInTheDocument();
    });

    it('Should render dropdown row with timepicker', async () => {
      const link1 = createNestedLinkConfig({});
      const link2 = createNestedLinkConfig({
        linkType: LinkType.TIMEPICKER,
      });
      const defaultLink = {
        ...defaultVisualLink,
        dropdownConfig: createDropdownConfig({
          type: DropdownType.ROW,
        }),
        links: [
          link1,
          {
            ...link2,
            linkType: VisualLinkType.TIMEPICKER,
          },
        ],
      } as any;

      await act(async () => render(getComponent({ link: defaultLink })));
      expect(selectors.linkElement(true)).not.toBeInTheDocument();

      expect(selectors.root()).toBeInTheDocument();
      expect(selectors.timePickerElement()).toBeInTheDocument();

      /**
       * Should render default button without url in row
       */
      expect(selectors.defaultButton(false, 'Link')).toBeInTheDocument();
    });

    it('Should render dropdown row with timepicker and link', async () => {
      const link1 = createNestedLinkConfig({
        name: 'Link-test',
        url: 'test.com',
        isCurrentLink: true,
      });
      const link2 = createNestedLinkConfig({
        linkType: LinkType.TIMEPICKER,
      });
      const defaultLink = {
        ...defaultVisualLink,
        dropdownConfig: createDropdownConfig({
          type: DropdownType.ROW,
          buttonSize: ButtonSize.LG,
        }),
        links: [
          link1,
          {
            ...link2,
            linkType: VisualLinkType.TIMEPICKER,
          },
        ],
      } as any;

      await act(async () => render(getComponent({ link: defaultLink })));
      expect(selectors.linkElement(true)).not.toBeInTheDocument();

      expect(selectors.root()).toBeInTheDocument();
      expect(selectors.timePickerElement()).toBeInTheDocument();

      /**
       * Should render link
       */
      expect(selectors.link(false, 'Link-test')).toBeInTheDocument();
    });

    it('Should render dropdown row with grid styles', async () => {
      const link1 = createNestedLinkConfig({});
      const link2 = createNestedLinkConfig({
        linkType: LinkType.TIMEPICKER,
      });
      const defaultLink = {
        ...defaultVisualLink,
        dropdownConfig: createDropdownConfig({
          type: DropdownType.ROW,
        }),
        links: [
          link1,
          {
            ...link2,
            linkType: VisualLinkType.TIMEPICKER,
          },
        ],
      } as any;

      await act(async () => render(getComponent({ link: defaultLink, gridMode: true })));
      expect(selectors.linkElement(true)).not.toBeInTheDocument();

      expect(selectors.root()).toBeInTheDocument();
      expect(selectors.root()).toHaveStyle(`width: 100%`);
    });

    it('Should render dropdown row with align styles', async () => {
      const link1 = createNestedLinkConfig({});
      const link2 = createNestedLinkConfig({
        linkType: LinkType.TIMEPICKER,
      });
      const defaultLink = {
        ...defaultVisualLink,
        dropdownConfig: createDropdownConfig({
          type: DropdownType.ROW,
          align: DropdownAlign.RIGHT,
        }),
        links: [
          link1,
          {
            ...link2,
            linkType: VisualLinkType.TIMEPICKER,
          },
        ],
      } as any;

      await act(async () => render(getComponent({ link: defaultLink, gridMode: true })));
      expect(selectors.linkElement(true)).not.toBeInTheDocument();

      expect(selectors.root()).toBeInTheDocument();
      expect(selectors.root()).toHaveStyle(`width: 100%`);
      expect(selectors.root()).toHaveStyle(`justify-content: end`);
    });

    it('Should render dropdown row and apply default style to link', async () => {
      const link1 = createNestedLinkConfig({
        name: 'Link-test-2',
        url: 'test.com',
      });
      const link2 = createNestedLinkConfig({
        linkType: LinkType.TIMEPICKER,
      });
      const defaultLink = {
        ...defaultVisualLink,
        dropdownConfig: createDropdownConfig({
          type: DropdownType.ROW,
          align: DropdownAlign.RIGHT,
          buttonSize: ButtonSize.LG,
        }),
        links: [
          link1,
          {
            ...link2,
            linkType: VisualLinkType.TIMEPICKER,
          },
        ],
      } as any;

      await act(async () => render(getComponent({ link: defaultLink, gridMode: true })));

      /**
       * Should render link
       */
      expect(selectors.link(false, 'Link-test-2')).toBeInTheDocument();
      expect(selectors.link(false, 'Link-test-2')).toHaveStyle(` margin: ${theme.spacing(0.5)}`);
    });
  });
});
