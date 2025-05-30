import { locationService } from '@grafana/runtime';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { VisualLinkType } from '@/types';
import { createVisualLinkConfig } from '@/utils';

import { TimePickerElement } from './TimePickerElement';

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

    describe('Grid mode', () => {
      it('Should render default button', async () => {
        await act(async () => render(getComponent({ gridMode: true })));
        expect(selectors.buttonPicker(false, defaultVisualLink.name)).toBeInTheDocument();
        expect(selectors.buttonPicker(false, defaultVisualLink.name)).toHaveStyle(`width: 100%`);
      });
    });
  });
});
