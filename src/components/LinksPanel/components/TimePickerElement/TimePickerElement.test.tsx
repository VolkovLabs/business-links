import { locationService } from '@grafana/runtime';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { VisualLinkType } from '@/types';
import { createVisualLinkConfig } from '@/utils';

import { TimePickerElement } from './TimePickerElement';

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
 * Props
 */
type Props = React.ComponentProps<typeof TimePickerElement>;

/**
 * locationService mock
 */
jest.mock('@grafana/runtime', () => ({
  locationService: {
    partial: jest.fn(),
  },
}));

/**
 * Element
 */
describe('TimePickerElement', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.timePickerElement });

  const selectors = getSelectors(screen);

  /**
   * Panel Options
   */
  const defaultVisualLink = createVisualLinkConfig({
    type: VisualLinkType.TIMEPICKER,
    name: 'Picker',
    timeRange: {
      from: 'now-2d',
      to: 'now',
    },
  });

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TimePickerElement link={defaultVisualLink} {...(props as any)} />;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renders', () => {
    it('Should render default button', async () => {
      await act(async () => render(getComponent({})));
      expect(selectors.buttonPicker(false, defaultVisualLink.name)).toBeInTheDocument();
    });

    it('Should change url and call location service', async () => {
      await act(async () => render(getComponent({})));
      expect(selectors.buttonPicker(false, defaultVisualLink.name)).toBeInTheDocument();

      fireEvent.click(selectors.buttonPicker(false, defaultVisualLink.name));

      expect(locationService.partial).toHaveBeenCalledWith(
        {
          from: defaultVisualLink.timeRange?.from,
          to: defaultVisualLink.timeRange?.to,
        },
        true
      );
    });

    it('Should render custom icon when showCustomIcons is true and customIconUrl is non empty', async () => {
      const customUrl = 'https://example.com/icon.png';
      const customLink = {
        ...defaultVisualLink,
        showCustomIcons: true,
        customIconUrl: customUrl,
      };

      await act(async () => render(getComponent({ link: customLink })));

      const btn = selectors.buttonPicker(false, customLink.name);
      expect(btn).toBeInTheDocument();

      const img = btn.querySelector('img')!;
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', customUrl);
    });

    it('Should not render title or tooltip attributes when hideTooltipOnHover is true', async () => {
      const customLink = {
        ...defaultVisualLink,
        hideTooltipOnHover: true,
      };

      await act(async () => render(getComponent({ link: customLink })));

      const linkButton = selectors.buttonPicker(false, customLink.name);

      expect(linkButton).toBeInTheDocument();
      expect(linkButton).not.toHaveAttribute('title');
      expect(linkButton).not.toHaveAttribute('tooltip');
    });

    describe('Grid mode', () => {
      it('Should render default button', async () => {
        await act(async () => render(getComponent({ gridMode: true })));
        expect(selectors.buttonPicker(false, defaultVisualLink.name)).toBeInTheDocument();
        expect(selectors.buttonPicker(false, defaultVisualLink.name)).toHaveStyle(`width: 100%`);
      });
    });
  });

  describe('Dynamic Font Size', () => {
    /**
     * Selectors
     */
    const getSelectors = getJestSelectors({ ...TEST_IDS.timePickerElement });
    const selectors = getSelectors(screen);

    /**
     * Default link
     */
    const defaultVisualLink = createVisualLinkConfig({
      type: VisualLinkType.TIMEPICKER,
      name: 'Picker',
      timeRange: {
        from: 'now-2d',
        to: 'now',
      },
    });

    /**
     * Get Tested Component
     */
    const getComponent = (props: Partial<Props>) => {
      return <TimePickerElement link={defaultVisualLink} {...(props as any)} />;
    };

    let mockResizeObserverInstance: MockResizeObserver;
    let observeSpy: jest.MockedFunction<() => void>;
    let disconnectSpy: jest.MockedFunction<() => void>;

    beforeEach(() => {
      jest.clearAllMocks();

      observeSpy = jest.fn();
      disconnectSpy = jest.fn();

      mockResizeObserver.mockImplementation((callback) => {
        mockResizeObserverInstance = new MockResizeObserver(callback);
        mockResizeObserverInstance.observe = observeSpy;
        mockResizeObserverInstance.disconnect = disconnectSpy;
        return mockResizeObserverInstance;
      });
    });

    describe('ResizeObserver Management', () => {
      it('Should not create ResizeObserver when dynamicFontSize is false', async () => {
        await act(async () => render(getComponent({ dynamicFontSize: false })));

        expect(mockResizeObserver).not.toHaveBeenCalled();
        expect(observeSpy).not.toHaveBeenCalled();
      });

      it('Should not create ResizeObserver when dynamicFontSize is undefined', async () => {
        await act(async () => render(getComponent({})));

        expect(mockResizeObserver).not.toHaveBeenCalled();
        expect(observeSpy).not.toHaveBeenCalled();
      });

      it('Should create ResizeObserver when dynamicFontSize is true', async () => {
        await act(async () => render(getComponent({ dynamicFontSize: true })));

        expect(mockResizeObserver).toHaveBeenCalled();
        expect(observeSpy).toHaveBeenCalled();
      });

      it('Should disconnect ResizeObserver on unmount', async () => {
        const { unmount } = render(getComponent({ dynamicFontSize: true }));

        await act(async () => {
          unmount();
        });

        expect(disconnectSpy).toHaveBeenCalled();
      });

      it('Should recreate ResizeObserver when dynamicFontSize changes from false to true', async () => {
        const { rerender } = render(getComponent({ dynamicFontSize: false }));

        expect(mockResizeObserver).not.toHaveBeenCalled();

        rerender(getComponent({ dynamicFontSize: true }));

        expect(mockResizeObserver).toHaveBeenCalled();
        expect(observeSpy).toHaveBeenCalled();
      });

      it('Should disconnect ResizeObserver when dynamicFontSize changes from true to false', async () => {
        const { rerender } = render(getComponent({ dynamicFontSize: true }));

        expect(mockResizeObserver).toHaveBeenCalled();

        rerender(getComponent({ dynamicFontSize: false }));

        expect(disconnectSpy).toHaveBeenCalled();
      });
    });

    describe('CSS Custom Property --btn-width', () => {
      it('Should not set --btn-width when dynamicFontSize is false', async () => {
        await act(async () => render(getComponent({ dynamicFontSize: false })));

        const button = selectors.buttonPicker(false, defaultVisualLink.name);
        expect(button.parentElement).not.toHaveAttribute('style');
      });

      it('Should not set --btn-width when dynamicFontSize is undefined', async () => {
        await act(async () => render(getComponent({})));

        const button = selectors.buttonPicker(false, defaultVisualLink.name);
        expect(button.parentElement).not.toHaveAttribute('style');
      });

      it('Should set --btn-width when dynamicFontSize is true and ResizeObserver triggers', async () => {
        const { rerender } = render(getComponent({ dynamicFontSize: true }));

        /**
         * Simulate ResizeObserver callback
         */
        await act(async () => {
          const mockEntry = {
            contentRect: { width: 150.7 },
          } as ResizeObserverEntry;

          mockResizeObserverInstance.trigger([mockEntry]);
        });

        /**
         * Re-render to apply state changes
         */
        rerender(getComponent({ dynamicFontSize: true }));

        const button = selectors.buttonPicker(false, defaultVisualLink.name);
        expect(button.parentElement).toHaveStyle('--btn-width: 150px');
      });

      it('Should update --btn-width when ResizeObserver triggers multiple times', async () => {
        const { rerender } = render(getComponent({ dynamicFontSize: true }));

        /**
         * First resize
         */
        await act(async () => {
          const mockEntry1 = {
            contentRect: { width: 100.3 },
          } as ResizeObserverEntry;

          mockResizeObserverInstance.trigger([mockEntry1]);
        });

        rerender(getComponent({ dynamicFontSize: true }));

        const button1 = selectors.buttonPicker(false, defaultVisualLink.name);
        expect(button1.parentElement).toHaveStyle('--btn-width: 100px');

        /**
         * Second resize
         */
        await act(async () => {
          const mockEntry2 = {
            contentRect: { width: 250.9 },
          } as ResizeObserverEntry;

          mockResizeObserverInstance.trigger([mockEntry2]);
        });

        rerender(getComponent({ dynamicFontSize: true }));

        const button2 = selectors.buttonPicker(false, defaultVisualLink.name);
        expect(button2.parentElement).toHaveStyle('--btn-width: 250px');
      });

      it('Should floor width values correctly', async () => {
        const { rerender } = render(getComponent({ dynamicFontSize: true }));

        const testCases = [
          { input: 120.1, expected: '120px' },
          { input: 120.5, expected: '120px' },
          { input: 120.9, expected: '120px' },
          { input: 121.0, expected: '121px' },
          { input: 0.9, expected: '0px' },
        ];

        for (const testCase of testCases) {
          await act(async () => {
            const mockEntry = {
              contentRect: { width: testCase.input },
            } as ResizeObserverEntry;

            mockResizeObserverInstance.trigger([mockEntry]);
          });

          rerender(getComponent({ dynamicFontSize: true }));

          const button = selectors.buttonPicker(false, defaultVisualLink.name);
          expect(button.parentElement).toHaveStyle(`--btn-width: ${testCase.expected}`);
        }
      });

      it('Should handle zero width', async () => {
        const { rerender } = render(getComponent({ dynamicFontSize: true }));

        await act(async () => {
          const mockEntry = {
            contentRect: { width: 0 },
          } as ResizeObserverEntry;

          mockResizeObserverInstance.trigger([mockEntry]);
        });

        rerender(getComponent({ dynamicFontSize: true }));

        const button = selectors.buttonPicker(false, defaultVisualLink.name);
        expect(button.parentElement).toHaveStyle('--btn-width: 0px');
      });

      it('Should handle very large width values', async () => {
        const { rerender } = render(getComponent({ dynamicFontSize: true }));

        await act(async () => {
          const mockEntry = {
            contentRect: { width: 9999.99 },
          } as ResizeObserverEntry;

          mockResizeObserverInstance.trigger([mockEntry]);
        });

        rerender(getComponent({ dynamicFontSize: true }));

        const button = selectors.buttonPicker(false, defaultVisualLink.name);
        expect(button.parentElement).toHaveStyle('--btn-width: 9999px');
      });
    });
  });
});
