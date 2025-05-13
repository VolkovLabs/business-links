import { DataFrame, DateTime, dateTime, getDefaultRelativeTimeRange, RelativeTimeRange } from '@grafana/data';
import { DateTimePicker, InlineField, InlineFieldRow, RadioButtonGroup, RelativeTimeRangePicker } from '@grafana/ui';
import React from 'react';

import { FieldPicker, FieldsGroup } from '@/components';
import { TEST_IDS } from '@/constants';
import { EditorProps, LinkConfig, LinkType, TimeConfigType } from '@/types';

/**
 * Properties
 */
interface Props extends EditorProps<LinkConfig> {
  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];
}

/**
 * Time Picker type options
 */
export const timePickerTypeOptions = [
  {
    label: 'Field',
    value: TimeConfigType.FIELD,
    ariaLabel: TEST_IDS.timePickerEditor.fieldTimeRangeTypeOption.selector(TimeConfigType.FIELD),
  },
  {
    label: 'Manual',
    value: TimeConfigType.MANUAL,
    ariaLabel: TEST_IDS.timePickerEditor.fieldTimeRangeTypeOption.selector(TimeConfigType.MANUAL),
  },
  {
    label: 'Relative',
    value: TimeConfigType.RELATIVE,
    ariaLabel: TEST_IDS.timePickerEditor.fieldTimeRangeTypeOption.selector(TimeConfigType.RELATIVE),
  },
];

/**
 * Time Picker Editor
 */
export const TimePickerEditor: React.FC<Props> = ({ value, onChange, data }) => {
  return (
    <>
      {value.linkType === LinkType.TIMEPICKER && (
        <FieldsGroup label="Settings">
          <InlineField
            grow={true}
            label="Time range type"
            labelWidth={20}
            {...TEST_IDS.timePickerEditor.fieldTimeRangeType.apply()}
          >
            <RadioButtonGroup
              value={value.timePickerConfig?.type ?? TimeConfigType.FIELD}
              onChange={(eventValue) => {
                onChange({
                  ...value,
                  timePickerConfig: {
                    ...value.timePickerConfig,
                    type: eventValue,
                  },
                });
              }}
              options={timePickerTypeOptions}
            />
          </InlineField>
          {(value.timePickerConfig?.type === TimeConfigType.FIELD || !value.timePickerConfig?.type) && (
            <>
              <InlineField label="Set 'from' time" grow={true} labelWidth={20}>
                <FieldPicker
                  isClearable={true}
                  value={value.timePickerConfig?.fieldFrom}
                  onChange={(field) => {
                    onChange({
                      ...value,
                      timePickerConfig: {
                        ...value.timePickerConfig,
                        fieldFrom: field,
                      },
                    });
                  }}
                  data={data}
                  {...TEST_IDS.timePickerEditor.fieldFromPicker.apply()}
                />
              </InlineField>
              <InlineFieldRow>
                <InlineField label="Set 'to' time" grow={true} labelWidth={20}>
                  <FieldPicker
                    isClearable={true}
                    value={value.timePickerConfig?.fieldTo}
                    onChange={(field) => {
                      onChange({
                        ...value,
                        timePickerConfig: {
                          ...value.timePickerConfig,
                          fieldTo: field,
                        },
                      });
                    }}
                    data={data}
                    {...TEST_IDS.timePickerEditor.fieldToPicker.apply()}
                  />
                </InlineField>
              </InlineFieldRow>
            </>
          )}
          {value.timePickerConfig?.type === TimeConfigType.MANUAL && (
            <>
              <InlineField label="Set 'from' time" grow={true} labelWidth={20}>
                <DateTimePicker
                  clearable={true}
                  date={
                    value.timePickerConfig.manualTimeRange?.from
                      ? dateTime(value.timePickerConfig.manualTimeRange.from)
                      : undefined
                  }
                  onChange={(dateTime?: DateTime) => {
                    if (dateTime) {
                      onChange({
                        ...value,
                        timePickerConfig: {
                          ...value.timePickerConfig,
                          manualTimeRange: {
                            ...value.timePickerConfig?.manualTimeRange,
                            from: dateTime.valueOf(),
                          },
                        },
                      });

                      return;
                    }

                    onChange({
                      ...value,
                      timePickerConfig: {
                        ...value.timePickerConfig,
                        manualTimeRange: {
                          ...value.timePickerConfig?.manualTimeRange,
                          from: 0,
                        },
                      },
                    });
                  }}
                  {...TEST_IDS.timePickerEditor.fieldFromDateTimePicker.apply()}
                />
              </InlineField>
              <InlineField label="Set 'to' time" grow={true} labelWidth={20}>
                <DateTimePicker
                  clearable={true}
                  date={
                    value.timePickerConfig.manualTimeRange?.to
                      ? dateTime(value.timePickerConfig.manualTimeRange.to)
                      : undefined
                  }
                  onChange={(dateTime?: DateTime) => {
                    if (dateTime) {
                      onChange({
                        ...value,
                        timePickerConfig: {
                          ...value.timePickerConfig,
                          manualTimeRange: {
                            ...value.timePickerConfig?.manualTimeRange,
                            to: dateTime.valueOf(),
                          },
                        },
                      });

                      return;
                    }

                    onChange({
                      ...value,
                      timePickerConfig: {
                        ...value.timePickerConfig,
                        manualTimeRange: {
                          ...value.timePickerConfig?.manualTimeRange,
                          to: 0,
                        },
                      },
                    });
                  }}
                  {...TEST_IDS.timePickerEditor.fieldToDateTimePicker.apply()}
                />
              </InlineField>
            </>
          )}
          {value.timePickerConfig?.type === TimeConfigType.RELATIVE && (
            <InlineField label="Range" grow={true} labelWidth={20}>
              <RelativeTimeRangePicker
                timeRange={value.timePickerConfig?.relativeTimeRange ?? getDefaultRelativeTimeRange()}
                onChange={(timeRange: RelativeTimeRange) => {
                  onChange({
                    ...value,
                    timePickerConfig: {
                      ...value.timePickerConfig,
                      relativeTimeRange: timeRange,
                    },
                  });
                }}
                {...TEST_IDS.timePickerEditor.fieldRelativeTimeRange.apply()}
              />
            </InlineField>
          )}
        </FieldsGroup>
      )}
    </>
  );
};
