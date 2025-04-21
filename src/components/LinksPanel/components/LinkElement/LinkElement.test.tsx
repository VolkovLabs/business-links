import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createLinkConfig, createVisualLinkConfig } from '@/utils';

import { LinkElement } from './LinkElement';

/**
 * Props
 */
type Props = React.ComponentProps<typeof LinkElement>;

/**
 * Element
 */
describe('LinkElement', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.linkElement);
  const selectors = getSelectors(screen);

  /**
   * Panel Options
   */
  const defaultVisualLink = createVisualLinkConfig();

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <LinkElement link={defaultVisualLink} {...(props as any)} />;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renders', () => {
    it('Should render default link button', async () => {
      await act(async () => render(getComponent({})));
      expect(selectors.buttonEmptyLink(false, 'Link1')).toBeInTheDocument();
    });

    it('Should render single link', async () => {
      const nestedLink = createLinkConfig({ name: 'Link1', url: 'test.com' });
      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'Link1',
              links: [nestedLink],
            }),
          })
        )
      );
      expect(selectors.buttonSingleLink(false, 'Link1')).toBeInTheDocument();
    });

    it('Should render dropdown if more that one link', async () => {
      const nestedLink1 = createLinkConfig({ name: 'Link1', url: 'test.com' });
      const nestedLink2 = createLinkConfig({ name: 'Link2', url: 'test.com' });
      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'Dropdown',
              links: [nestedLink1, nestedLink2],
            }),
          })
        )
      );

      expect(selectors.buttonSingleLink(true, 'Link1')).not.toBeInTheDocument();
      expect(selectors.buttonDropdown(false, 'Dropdown')).toBeInTheDocument();
      expect(selectors.dropdown(false, 'Dropdown')).toBeInTheDocument();

      fireEvent.click(selectors.dropdown(false, 'Dropdown'));

      expect(selectors.dropdownMenuItem(false, 'Link1')).toBeInTheDocument();
      expect(selectors.dropdownMenuItem(false, 'Link2')).toBeInTheDocument();
    });

    it('Should render tooltip with button if more that one link and display menu on hover is enable', async () => {
      const nestedLink1 = createLinkConfig({ name: 'Link1', url: 'test.com' });
      const nestedLink2 = createLinkConfig({ name: 'Link2', url: 'test.com' });
      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              showMenuOnHover: true,
              name: 'TooltipLink',
              links: [nestedLink1, nestedLink2],
            }),
          })
        )
      );

      expect(selectors.buttonSingleLink(true, 'Link1')).not.toBeInTheDocument();
      expect(selectors.buttonDropdown(false, 'TooltipLink')).toBeInTheDocument();
      expect(selectors.tooltipMenu(false, 'TooltipLink')).toBeInTheDocument();
    });
  });
});
