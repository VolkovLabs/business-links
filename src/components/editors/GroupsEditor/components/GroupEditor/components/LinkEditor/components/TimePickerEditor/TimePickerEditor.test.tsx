import { FieldType, toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { LinkType, TimeConfigType } from '@/types';
import { createLinkConfig, createTimeConfig } from '@/utils';

import { TimePickerEditor } from './TimePickerEditor';

type Props = React.ComponentProps<typeof TimePickerEditor>;

const inTestIds = {
  fieldPicker: createSelector('data-testid field-picker'),
};

describe('LinkEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.timePickerEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Change
   */
  const onChange = jest.fn();

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

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <TimePickerEditor
        value={createLinkConfig({
          linkType: LinkType.TIMEPICKER,
          timePickerConfig: createTimeConfig(),
        })}
        onChange={onChange}
        data={[frameA, frameWithIndex]}
        {...(props as any)}
      />
    );
  };

  it('Should allow to change Time Range Type', () => {
    render(getComponent({}));

    expect(selectors.fieldTimeRangeType()).toBeInTheDocument();
    fireEvent.click(selectors.fieldTimeRangeTypeOption(false, TimeConfigType.MANUAL));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePickerConfig: expect.objectContaining({
          type: TimeConfigType.MANUAL,
        }),
      })
    );
  });

  it('Should allow to change Time Range Type if type is undefined', () => {
    render(
      getComponent({
        value: createLinkConfig({
          linkType: LinkType.TIMEPICKER,
          timePickerConfig: createTimeConfig({
            type: undefined,
          }),
        }),
      })
    );

    expect(selectors.fieldTimeRangeType()).toBeInTheDocument();
    fireEvent.click(selectors.fieldTimeRangeTypeOption(false, TimeConfigType.MANUAL));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePickerConfig: expect.objectContaining({
          type: TimeConfigType.MANUAL,
        }),
      })
    );
  });

  it('Should allow to change From field', () => {
    render(
      getComponent({
        value: createLinkConfig({
          linkType: LinkType.TIMEPICKER,
          timePickerConfig: createTimeConfig({
            type: TimeConfigType.FIELD,
          }),
        }),
      })
    );

    expect(selectors.fieldFromPicker()).toBeInTheDocument();
    expect(selectors.fieldFromPicker()).toHaveValue('');

    fireEvent.change(selectors.fieldFromPicker(), { target: { values: 'A:name' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePickerConfig: expect.objectContaining({
          fieldFrom: { name: 'name', source: 'A' },
        }),
      })
    );
  });

  it('Should allow to change To field', () => {
    render(
      getComponent({
        value: createLinkConfig({
          linkType: LinkType.TIMEPICKER,
          timePickerConfig: createTimeConfig({
            type: TimeConfigType.FIELD,
          }),
        }),
      })
    );

    expect(selectors.fieldToPicker()).toBeInTheDocument();
    expect(selectors.fieldToPicker()).toHaveValue('');

    fireEvent.change(selectors.fieldToPicker(), { target: { values: 'A:name' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePickerConfig: expect.objectContaining({
          fieldTo: { name: 'name', source: 'A' },
        }),
      })
    );
  });

  it('Should allow to change From Date', () => {
    render(
      getComponent({
        value: createLinkConfig({
          linkType: LinkType.TIMEPICKER,
          timePickerConfig: createTimeConfig({
            type: TimeConfigType.MANUAL,
          }),
        }),
      })
    );

    expect(selectors.fieldFromDateTimePicker()).toBeInTheDocument();

    const newDateString = new Date('2023-05-12').toISOString();
    fireEvent.change(selectors.fieldFromDateTimePicker(), { target: { value: newDateString } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePickerConfig: expect.objectContaining({
          manualTimeRange: expect.objectContaining({
            from: 1683849600000,
          }),
        }),
      })
    );
  });

  it('Should allow to change To Date', () => {
    render(
      getComponent({
        value: createLinkConfig({
          linkType: LinkType.TIMEPICKER,
          timePickerConfig: createTimeConfig({
            type: TimeConfigType.MANUAL,
          }),
        }),
      })
    );

    expect(selectors.fieldToDateTimePicker()).toBeInTheDocument();

    const newDateString = new Date('2023-05-17').toISOString();
    fireEvent.change(selectors.fieldToDateTimePicker(), { target: { value: newDateString } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePickerConfig: expect.objectContaining({
          manualTimeRange: expect.objectContaining({
            to: 1684281600000,
          }),
        }),
      })
    );
  });

  it('Should allow clear To Date', () => {
    render(
      getComponent({
        value: createLinkConfig({
          linkType: LinkType.TIMEPICKER,
          timePickerConfig: createTimeConfig({
            type: TimeConfigType.MANUAL,
            manualTimeRange: {
              to: 1684281600000,
            },
          }),
        }),
      })
    );

    expect(selectors.fieldToDateTimePicker()).toBeInTheDocument();

    fireEvent.change(selectors.fieldToDateTimePicker(), { target: { value: 'clear' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePickerConfig: expect.objectContaining({
          manualTimeRange: expect.objectContaining({
            to: 0,
          }),
        }),
      })
    );
  });

  it('Should allow clear From Date', () => {
    render(
      getComponent({
        value: createLinkConfig({
          linkType: LinkType.TIMEPICKER,
          timePickerConfig: createTimeConfig({
            type: TimeConfigType.MANUAL,
            manualTimeRange: {
              from: 1684281600000,
            },
          }),
        }),
      })
    );

    expect(selectors.fieldFromDateTimePicker()).toBeInTheDocument();

    fireEvent.change(selectors.fieldFromDateTimePicker(), { target: { value: 'clear' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePickerConfig: expect.objectContaining({
          manualTimeRange: expect.objectContaining({
            from: 0,
          }),
        }),
      })
    );
  });

  it('Should allow change Relative Range', () => {
    render(
      getComponent({
        value: createLinkConfig({
          linkType: LinkType.TIMEPICKER,
          timePickerConfig: createTimeConfig({
            type: TimeConfigType.RELATIVE,
            manualTimeRange: {
              from: 1684281600000,
            },
          }),
        }),
      })
    );

    expect(selectors.fieldRelativeTimeRange()).toBeInTheDocument();

    fireEvent.change(selectors.fieldRelativeTimeRange(), {
      target: {
        value: JSON.stringify({
          from: 6000,
          to: 0,
        }),
      },
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timePickerConfig: expect.objectContaining({
          relativeTimeRange: expect.objectContaining({
            from: 6000,
            to: 0,
          }),
        }),
      })
    );
  });
});
