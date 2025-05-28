import { createTheme } from '@grafana/data';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { HoverMenuPositionType } from '@/types';
import { createLinkConfig, createNestedLinkConfig, createVisualLinkConfig } from '@/utils';

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
  const getSelectors = getJestSelectors({ ...TEST_IDS.linkElement, ...TEST_IDS.general });

  const selectors = getSelectors(screen);

  /**
   * Selectors
   */
  const theme = createTheme();

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

    it('Should render tooltip with correct menu position if not specified', async () => {
      const nestedLink1 = createLinkConfig({ name: 'Link1', url: 'test.com' });
      const nestedLink2 = createLinkConfig({ name: 'Link2', url: 'test.com' });
      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              showMenuOnHover: true,
              name: 'TooltipLink',
              hoverMenuPosition: undefined,
              links: [nestedLink1, nestedLink2],
            }),
          })
        )
      );

      expect(selectors.buttonSingleLink(true, 'Link1')).not.toBeInTheDocument();
      expect(selectors.buttonDropdown(false, 'TooltipLink')).toBeInTheDocument();
      expect(selectors.tooltipMenu(false, 'TooltipLink')).toBeInTheDocument();
      expect(selectors.tooltipPosition()).toBeInTheDocument();
      expect(selectors.tooltipPosition()).toHaveTextContent('bottom');
    });

    it('Should render tooltip with correct menu position from link option', async () => {
      const nestedLink1 = createLinkConfig({ name: 'Link1', url: 'test.com' });
      const nestedLink2 = createLinkConfig({ name: 'Link2', url: 'test.com' });
      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              showMenuOnHover: true,
              name: 'TooltipLink',
              hoverMenuPosition: HoverMenuPositionType.LEFT,
              links: [nestedLink1, nestedLink2],
            }),
          })
        )
      );

      expect(selectors.buttonSingleLink(true, 'Link1')).not.toBeInTheDocument();
      expect(selectors.buttonDropdown(false, 'TooltipLink')).toBeInTheDocument();
      expect(selectors.tooltipMenu(false, 'TooltipLink')).toBeInTheDocument();
      expect(selectors.tooltipPosition()).toBeInTheDocument();
      expect(selectors.tooltipPosition()).toHaveTextContent(HoverMenuPositionType.LEFT);
    });

    it('Should render dropdown with Highlight current link', async () => {
      const nestedLink1 = createNestedLinkConfig({ name: 'Link1', url: 'test.com', isCurrentLink: true });
      const nestedLink2 = createNestedLinkConfig();
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

      /**
       * Current ds link styles
       */
      expect(selectors.dropdownMenuItem(false, 'Link1')).toHaveStyle(
        `background-color: ${theme.colors.warning.borderTransparent}`
      );

      expect(selectors.dropdownMenuItem(false, 'Link')).toBeInTheDocument();
      expect(selectors.dropdownMenuItem(false, 'Link')).toHaveStyle(
        `background-color: ${theme.colors.background.primary}`
      );
    });

    it('Should render single link with current style', async () => {
      const nestedLink = createNestedLinkConfig({ name: 'Link1', url: 'test.com', isCurrentLink: true });
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
      expect(selectors.buttonSingleLink(false, 'Link1')).toHaveStyle(
        `background-color: ${theme.colors.warning.borderTransparent}`
      );
    });

    describe('Grid mode', () => {
      it('Should Apply grid style for link', async () => {
        const nestedLink = createNestedLinkConfig({ name: 'Link1', url: 'test.com', isCurrentLink: true });
        await act(async () =>
          render(
            getComponent({
              gridMode: true,
              link: createVisualLinkConfig({
                name: 'Link1',
                links: [nestedLink],
              }),
            })
          )
        );
        expect(selectors.buttonSingleLink(false, 'Link1')).toBeInTheDocument();
        expect(selectors.buttonSingleLink(false, 'Link1')).toHaveStyle(
          `background-color: ${theme.colors.warning.borderTransparent}`
        );
        expect(selectors.buttonSingleLink(false, 'Link1')).toHaveStyle(`width: 100%`);
      });

      it('Should Apply grid style for empty link', async () => {
        const nestedLink = createNestedLinkConfig({ name: 'Link1', url: '', isCurrentLink: true });
        await act(async () =>
          render(
            getComponent({
              gridMode: true,
              link: createVisualLinkConfig({
                name: 'Link1',
                links: [nestedLink],
              }),
            })
          )
        );
        expect(selectors.buttonEmptyLink(false, 'Link1')).toBeInTheDocument();
        expect(selectors.buttonEmptyLink(false, 'Link1')).toHaveStyle(`width: 100%`);
      });

      it('Should Apply grid style for dropdown type links', async () => {
        const nestedLink1 = createLinkConfig({ name: 'Link1', url: 'test.com' });
        const nestedLink2 = createLinkConfig({ name: 'Link2', url: 'test.com' });
        await act(async () =>
          render(
            getComponent({
              gridMode: true,
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
        expect(selectors.buttonDropdown(false, 'Dropdown')).toHaveStyle(`width: 100%`);
      });

      it('Should render dropdown links with custom images', async () => {
        const nestedLink1 = createNestedLinkConfig({
          name: 'Link1',
          url: 'test1.com',
          isCurrentLink: true,
          showCustomIcons: true,
          customIconUrl: '/public/icon1.png',
        });
        const nestedLink2 = createNestedLinkConfig({
          name: 'Link2',
          url: 'test2.com',
          isCurrentLink: true,
          showCustomIcons: true,
          customIconUrl: '/public/icon2.png',
        });
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

        const menuItem1 = selectors.dropdownMenuItem(false, 'Link1');
        const menuItem2 = selectors.dropdownMenuItem(false, 'Link2');
        expect(menuItem1).toBeInTheDocument();
        expect(menuItem2).toBeInTheDocument();

        const img1 = menuItem1.querySelector('img')!;
        expect(img1).toHaveAttribute('src', '/public/icon1.png');

        const img2 = menuItem2.querySelector('img')!;
        expect(img2).toHaveAttribute('src', '/public/icon2.png');
      });
    });

    it('Should render custom icon inside dropdown button when showCustomIcons is true and customIconUrl non empty', async () => {
      const customUrl = '/public/dropdown-icon.png';
      const nestedLink1 = createNestedLinkConfig({ name: 'Link1', url: 'test1.com' });
      const nestedLink2 = createNestedLinkConfig({ name: 'Link2', url: 'test2.com' });

      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'Dropdown',
              links: [nestedLink1, nestedLink2],
              showCustomIcons: true,
              customIconUrl: customUrl,
            }),
          })
        )
      );

      const btn = selectors.buttonDropdown(false, 'Dropdown');
      expect(btn).toBeInTheDocument();

      const img = btn.querySelector('img')!;
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', customUrl);

      expect(btn.querySelector('svg')).toBeNull();
    });

    it('Should render custom icon inside single LinkButton when showCustomIcons is true and customIconUrl non empty', async () => {
      const nestedLink = createNestedLinkConfig({
        name: 'Link1',
        url: 'test1.com',
        showCustomIcons: true,
        customIconUrl: '/public/icon.png',
      });

      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'Link',
              links: [nestedLink],
            }),
          })
        )
      );

      const btn = selectors.buttonSingleLink(false, 'Link');
      expect(btn).toBeInTheDocument();

      const img = btn.querySelector('img')!;
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/public/icon.png');

      expect(btn.querySelector('svg')).toBeNull();
    });
  });
});
