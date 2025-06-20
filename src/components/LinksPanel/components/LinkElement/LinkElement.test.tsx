import { createTheme } from '@grafana/data';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { AlignContentPositionType, LinkType, VisualLinkType } from '@/types';
import { createLinkConfig, createNestedLinkConfig, createVisualLinkConfig } from '@/utils';

import { LinkElement } from './LinkElement';

/**
 * Mock @grafana/ui
 */
jest.mock('@grafana/ui');

/**
 * Props
 */
type Props = React.ComponentProps<typeof LinkElement>;

/**
 * Mock ResizeObserver
 */
class MockResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  /**
   * Simulate resize observation
   */
  observe() {}

  /**
   * Simulate unobserve
   */
  unobserve() {}

  /**
   * Simulate disconnect
   */
  disconnect() {}

  /**
   * Helper method to trigger resize callback
   */
  trigger(entries: ResizeObserverEntry[]) {
    this.callback(entries, this);
  }
}

/**
 * Mock ResizeObserver globally
 */
const mockResizeObserver = jest.fn().mockImplementation((callback) => new MockResizeObserver(callback));
global.ResizeObserver = mockResizeObserver;

/**
 * Element
 */
describe('LinkElement', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.linkElement, ...TEST_IDS.general, ...TEST_IDS.drawerElement });
  const selectors = getSelectors(screen);

  /**
   * Theme
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

      expect(selectors.buttonDropdown(false, 'TooltipLink')).toBeInTheDocument();
      expect(selectors.tooltipMenu(false, 'TooltipLink')).toBeInTheDocument();
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
        expect(selectors.buttonSingleLink(false, 'Link1')).toHaveStyle('width: 100%');
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
        expect(selectors.buttonEmptyLink(false, 'Link1')).toHaveStyle('width: 100%');
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

        expect(selectors.buttonDropdown(false, 'Dropdown')).toBeInTheDocument();
        expect(selectors.buttonDropdown(false, 'Dropdown')).toHaveStyle('width: 100%');
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

    it('Should not render title attribute when hideTooltipOnHover is true', async () => {
      const linkName = 'SingleLink';
      const nestedLink = createNestedLinkConfig({
        name: linkName,
        url: 'test.com',
        hideTooltipOnHover: true,
      });

      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: linkName,
              links: [nestedLink],
            }),
          })
        )
      );

      const linkButton = selectors.buttonSingleLink(false, linkName);
      expect(linkButton).toBeInTheDocument();
      expect(linkButton).not.toHaveAttribute('title');
    });

    it('Should not render title or tooltip attributes on empty Button when hideTooltipOnHover is true', async () => {
      const linkName = 'EmptyLink';

      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: linkName,
              hideTooltipOnHover: true,
              links: [],
            }),
          })
        )
      );

      const emptyButton = selectors.buttonEmptyLink(false, linkName);
      expect(emptyButton).toBeInTheDocument();
      expect(emptyButton).not.toHaveAttribute('title');
      expect(emptyButton).not.toHaveAttribute('tooltip');
    });
  });

  describe('Dynamic Font Size', () => {
    let mockResizeObserverInstance: MockResizeObserver;
    let observeSpy: jest.MockedFunction<() => void>;

    beforeEach(() => {
      observeSpy = jest.fn();
      mockResizeObserver.mockImplementation((callback) => {
        mockResizeObserverInstance = new MockResizeObserver(callback);
        mockResizeObserverInstance.observe = observeSpy;
        return mockResizeObserverInstance;
      });
    });

    it('Should not create ResizeObserver when dynamicFontSize is false', async () => {
      const nestedLink = createLinkConfig({ name: 'Link1', url: 'test.com' });

      await act(async () =>
        render(
          getComponent({
            dynamicFontSize: false,
            link: createVisualLinkConfig({
              name: 'Link1',
              links: [nestedLink],
            }),
          })
        )
      );

      expect(mockResizeObserver).not.toHaveBeenCalled();
    });

    it('Should create ResizeObserver when dynamicFontSize is true and element exists', async () => {
      const nestedLink = createLinkConfig({ name: 'Link1', url: 'test.com' });

      await act(async () =>
        render(
          getComponent({
            dynamicFontSize: true,
            link: createVisualLinkConfig({
              name: 'Link1',
              links: [nestedLink],
            }),
          })
        )
      );

      expect(mockResizeObserver).toHaveBeenCalled();
      expect(observeSpy).toHaveBeenCalled();
    });

    it('Should set CSS custom property --btn-width on single link when dynamicFontSize is true', async () => {
      const nestedLink = createLinkConfig({ name: 'Link1', url: 'test.com' });

      await act(async () =>
        render(
          getComponent({
            dynamicFontSize: true,
            link: createVisualLinkConfig({
              name: 'Link1',
              links: [nestedLink],
            }),
          })
        )
      );

      /**
       * Wait for useEffect to run and create ResizeObserver
       */
      await act(async () => {
        /**
         * Simulate ResizeObserver callback
         */
        const mockEntry = {
          contentRect: { width: 150 },
        } as ResizeObserverEntry;

        mockResizeObserverInstance.trigger([mockEntry]);
      });

      const linkButton = selectors.buttonSingleLink(false, 'Link1');
      expect(linkButton.parentElement).toHaveStyle('--btn-width: 150px');
    });

    it('Should not set CSS custom property when dynamicFontSize is false', async () => {
      const nestedLink = createLinkConfig({ name: 'Link1', url: 'test.com' });

      await act(async () =>
        render(
          getComponent({
            dynamicFontSize: false,
            link: createVisualLinkConfig({
              name: 'Link1',
              links: [nestedLink],
            }),
          })
        )
      );

      const linkButton = selectors.buttonSingleLink(false, 'Link1');
      expect(linkButton).not.toHaveStyle('--btn-width: 150px');
      expect(linkButton.parentElement).not.toHaveAttribute('style');
    });

    it('Should update linkWidth state when ResizeObserver triggers', async () => {
      const nestedLink = createLinkConfig({ name: 'Link1', url: 'test.com' });

      await act(async () =>
        render(
          getComponent({
            dynamicFontSize: true,
            link: createVisualLinkConfig({
              name: 'Link1',
              links: [nestedLink],
            }),
          })
        )
      );

      /**
       * First resize
       */
      await act(async () => {
        const mockEntry1 = {
          contentRect: { width: 150.7 },
        } as ResizeObserverEntry;

        mockResizeObserverInstance.trigger([mockEntry1]);
      });

      const linkButton1 = selectors.buttonSingleLink(false, 'Link1');
      expect(linkButton1.parentElement).toHaveStyle('--btn-width: 150px');

      /**
       * Second resize
       */
      await act(async () => {
        const mockEntry2 = {
          contentRect: { width: 200.9 },
        } as ResizeObserverEntry;

        mockResizeObserverInstance.trigger([mockEntry2]);
      });

      const linkButton2 = selectors.buttonSingleLink(false, 'Link1');
      expect(linkButton2.parentElement).toHaveStyle('--btn-width: 200px');
    });
  });

  describe('Content Alignment Tests', () => {
    it('Should apply correct alignment class for single link with left alignment', async () => {
      const nestedLink = createLinkConfig({ name: 'Link1', url: 'test.com' });

      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'Link1',
              links: [nestedLink],
              alignContentPosition: AlignContentPositionType.LEFT,
            }),
          })
        )
      );

      const linkButton = selectors.buttonSingleLink(false, 'Link1');
      expect(linkButton).toHaveStyle('justify-content: flex-start');
    });

    it('Should apply correct alignment class for single link with center alignment', async () => {
      const nestedLink = createLinkConfig({
        name: 'Link1',
        url: 'test.com',
        alignContentPosition: AlignContentPositionType.CENTER,
      });

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

      const linkButton = selectors.buttonSingleLink(false, 'Link1');
      expect(linkButton).toHaveStyle('justify-content: center');
    });

    it('Should apply correct alignment class for single link with right alignment', async () => {
      const nestedLink = createLinkConfig({
        name: 'Link1',
        url: 'test.com',
        alignContentPosition: AlignContentPositionType.RIGHT,
      });

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

      const linkButton = selectors.buttonSingleLink(false, 'Link1');
      expect(linkButton).toBeInTheDocument();
      expect(linkButton).toHaveStyle('justify-content: flex-end');
    });

    it('Should apply both grid mode and alignment classes together', async () => {
      const nestedLink = createLinkConfig({
        name: 'Link1',
        url: 'test.com',
        alignContentPosition: AlignContentPositionType.CENTER,
      });

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

      const linkButton = selectors.buttonSingleLink(false, 'Link1');
      expect(linkButton).toHaveStyle('justify-content: center');
    });

    it('Should apply alignment class for dropdown button', async () => {
      const nestedLink1 = createLinkConfig({ name: 'Link1', url: 'test.com' });
      const nestedLink2 = createLinkConfig({ name: 'Link2', url: 'test.com' });

      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'Dropdown',
              links: [nestedLink1, nestedLink2],
              alignContentPosition: AlignContentPositionType.RIGHT,
            }),
          })
        )
      );

      const dropdownButton = selectors.buttonDropdown(false, 'Dropdown');
      expect(dropdownButton).toHaveStyle('justify-content: flex-end');
    });
  });

  it('Should display dropdownLink with custom image if showCustomIcons is true and customIconUrl is not empty', async () => {
    const nestedLink1 = createLinkConfig({
      name: 'Link1',
      url: 'test.com',
      showCustomIcons: true,
      customIconUrl: '/public/link-icon1.png',
    });
    const nestedLink2 = createLinkConfig({
      name: 'Link2',
      url: 'test.com',
      showCustomIcons: true,
      customIconUrl: '/public/link-icon2.png',
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

    fireEvent.click(selectors.dropdown(false, 'Dropdown'));

    expect(selectors.dropdownMenuItem(false, 'Link1')).toBeInTheDocument();
    expect(selectors.dropdownMenuItem(false, 'Link2')).toBeInTheDocument();
  });

  describe('Custom Icon Display', () => {
    it('Should render custom icon in empty link button when showCustomIcons and customIconUrl are provided', async () => {
      const customUrl = '/public/empty-link-icon.png';

      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'EmptyLink',
              links: [],
              showCustomIcons: true,
              customIconUrl: customUrl,
              type: VisualLinkType.LLMAPP,
            }),
          })
        )
      );

      const emptyButton = selectors.buttonEmptyLink(false, 'EmptyLink');
      expect(emptyButton).toBeInTheDocument();

      const img = selectors.customIconImg(false, 'EmptyLink');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', customUrl);
      expect(() => selectors.customIconSvg(false, 'EmptyLink')).toThrow();
    });

    it('Should not render custom icon when customIconUrl is empty string', async () => {
      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'EmptyLink',
              links: [],
              showCustomIcons: true,
              customIconUrl: '',
              type: VisualLinkType.LLMAPP,
            }),
          })
        )
      );

      const emptyButton = selectors.buttonEmptyLink(false, 'EmptyLink');
      expect(emptyButton).toBeInTheDocument();

      expect(() => selectors.customIconImg(false, 'EmptyLink')).toThrow();
    });

    it('Should not render custom icon when showCustomIcons is false', async () => {
      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'EmptyLink',
              links: [],
              showCustomIcons: false,
              customIconUrl: '/public/some-icon.png',
              type: VisualLinkType.LLMAPP,
            }),
          })
        )
      );

      const emptyButton = selectors.buttonEmptyLink(false, 'EmptyLink');
      expect(emptyButton).toBeInTheDocument();

      expect(() => selectors.customIconImg(false, 'EmptyLink')).toThrow();
    });

    it('Should render custom icon in LLM App type button', async () => {
      const customUrl = '/public/llm-icon.png';

      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'Chat',
              type: VisualLinkType.LLMAPP,
              links: [],
              showCustomIcons: true,
              customIconUrl: customUrl,
            }),
          })
        )
      );

      const chatButton = selectors.buttonEmptyLink(false, 'Chat');
      expect(chatButton).toBeInTheDocument();

      const img = selectors.customIconImg(false, 'Chat');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', customUrl);
    });
  });

  describe('Drawer Functionality', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Should handle drawer open/close cycle with subscription cleanup', async () => {
      await act(async () =>
        render(
          getComponent({
            link: createVisualLinkConfig({
              name: 'Chat',
              type: VisualLinkType.LLMAPP,
              links: [],
            }),
          })
        )
      );

      await act(async () => {
        fireEvent.click(selectors.buttonEmptyLink(false, 'Chat'));
      });
      expect(selectors.chatDrawer()).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(selectors.drawerCloseButton());
      });
      expect(() => selectors.chatDrawer(false)).toThrow();
    });

    it('Should open ChatDrawer when LLMAPP dropdown menu item is clicked', async () => {
      const nestedLink1 = createNestedLinkConfig({ name: 'Regular', url: 'test1.com' });
      const nestedLink2 = createNestedLinkConfig({ name: 'Chat', linkType: LinkType.LLMAPP });
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

      fireEvent.click(selectors.dropdown(false, 'Dropdown'));
      expect(selectors.dropdownMenuItem(false, 'Regular')).toBeInTheDocument();
      expect(selectors.dropdownMenuItem(false, 'Chat')).toBeInTheDocument();

      fireEvent.click(selectors.dropdownMenuItem(false, 'Chat'));
      expect(selectors.chatDrawer()).toBeInTheDocument();
    });

    it('Should render custom icon in LLMAPP dropdown menu item', async () => {
      const nestedLink1 = createNestedLinkConfig({
        name: 'Chat',
        linkType: LinkType.LLMAPP,
        showCustomIcons: true,
        customIconUrl: '/public/llm-icon.png',
      });
      const nestedLink2 = createLinkConfig({ name: 'Link1', url: 'test.com' });

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

      fireEvent.click(selectors.dropdown(false, 'Dropdown'));
      const menuItem = selectors.dropdownMenuItem(false, 'Chat');
      expect(menuItem).toBeInTheDocument();
      expect(selectors.customIconImg(false, 'Chat')).toBeInTheDocument();
    });

    it('Should render svg icon in LLMAPP dropdown menu item if showCustomIcons is false', async () => {
      const nestedLink1 = createNestedLinkConfig({
        name: 'Chat',
        linkType: LinkType.LLMAPP,
        showCustomIcons: false,
        icon: 'play',
      });
      const nestedLink2 = createLinkConfig({ name: 'Link1', url: 'test.com' });

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

      fireEvent.click(selectors.dropdown(false, 'Dropdown'));
      const menuItem = selectors.dropdownMenuItem(false, 'Chat');
      expect(menuItem).toBeInTheDocument();
      expect(selectors.customIconSvg(false, 'Chat')).toBeInTheDocument();
    });
  });
});
