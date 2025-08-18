import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { VisualLinkType } from '@/types';
import { createVisualLinkConfig } from '@/utils';

import { AnnotationElement } from './AnnotationElement';

/**
 * Props
 */
type Props = React.ComponentProps<typeof AnnotationElement>;

/**
 * Element
 */
describe('Annotation Element', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.annotationElement });

  const selectors = getSelectors(screen);

  /**
   * Panel Options
   */
  const defaultVisualLink = createVisualLinkConfig({
    type: VisualLinkType.ANNOTATION,
    name: 'Picker',
    annotationLayer: undefined,
  });

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <AnnotationElement link={defaultVisualLink} {...(props as any)} />;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renders', () => {
    it('Should not render if no layer ', async () => {
      await act(async () => render(getComponent({})));
      expect(selectors.root(true)).not.toBeInTheDocument();
    });

    it('Should render main elements ', async () => {
      const setState = jest.fn();
      const runLayer = jest.fn();

      await act(async () =>
        render(
          getComponent({
            link: {
              ...defaultVisualLink,
              annotationLayer: {
                state: {
                  name: 'annotation-1',
                  key: 'annotation - 1',
                  isEnabled: true,
                  isHidden: false,
                },
                setState: setState,
                runLayer: runLayer,
              },
            },
            dynamicFontSize: true,
          })
        )
      );
      expect(selectors.root()).toBeInTheDocument();
      expect(selectors.label()).toBeInTheDocument();
      expect(selectors.enableField()).toBeInTheDocument();
    });

    it('Should render call change state and run layer on change ', async () => {
      const setState = jest.fn();
      const runLayer = jest.fn();

      await act(async () =>
        render(
          getComponent({
            link: {
              ...defaultVisualLink,
              annotationLayer: {
                state: {
                  name: 'annotation-1',
                  key: 'annotation - 1',
                  isEnabled: true,
                  isHidden: false,
                },
                setState: setState,
                runLayer: runLayer,
              },
            },
          })
        )
      );
      expect(selectors.root()).toBeInTheDocument();
      expect(selectors.label()).toBeInTheDocument();
      expect(selectors.enableField()).toBeInTheDocument();

      fireEvent.click(selectors.enableField());

      expect(setState).toHaveBeenCalled();
      expect(runLayer).toHaveBeenCalled();
    });
  });
});
