import { DataFrame, getDefaultTimeRange, TimeRange } from '@grafana/data';
import { InlineField, InlineFieldRow, RadioButtonGroup, TimeRangeInput } from '@grafana/ui';
import { Slider } from '@volkovlabs/components';
import React, { useState } from 'react';

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

  /**
   * Is Highlight Time Picker
   *
   * @type {boolean}
   */
  isHighlightTimePicker?: boolean;
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
    label: 'Manual / Relative',
    value: TimeConfigType.CUSTOM,
    ariaLabel: TEST_IDS.timePickerEditor.fieldTimeRangeTypeOption.selector(TimeConfigType.CUSTOM),
  },
];

/**
 * Time Picker Editor
 */
export const TimePickerEditor: React.FC<Props> = ({ value, onChange, data, isHighlightTimePicker }) => {
  const [highlightSecondsDiff, setHighlightSecondsDiff] = useState(value.timePickerConfig?.highlightSecondsDiff);

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
              {isHighlightTimePicker && (
                <InlineField
                  label="Time highlight gap"
                  tooltip="Maximum allowed time difference between measurements for highlight."
                  labelWidth={20}
                  grow={true}
                >
                  <Slider
                    value={highlightSecondsDiff}
                    min={1}
                    max={60}
                    step={1}
                    onChange={(size) => {
                      setHighlightSecondsDiff(size);
                    }}
                    onAfterChange={(size) => {
                      onChange({
                        ...value,
                        timePickerConfig: {
                          ...value.timePickerConfig,
                          highlightSecondsDiff: size,
                        },
                      });
                    }}
                    {...TEST_IDS.timePickerEditor.fieldTimePickerDifference.apply()}
                  />
                </InlineField>
              )}
            </>
          )}
          {value.timePickerConfig?.type === TimeConfigType.CUSTOM && (
            <div>
              <InlineField label="Range" grow={true} labelWidth={20}>
                <TimeRangeInput
                  value={value.timePickerConfig.customTimeRange ?? getDefaultTimeRange()}
                  onChange={(timeRange: TimeRange) => {
                    onChange({
                      ...value,
                      timePickerConfig: {
                        ...value.timePickerConfig,
                        customTimeRange: timeRange,
                      },
                    });
                  }}
                  timeZone="browser"
                  isReversed={false}
                  showIcon={true}
                  {...TEST_IDS.timePickerEditor.fieldRelativeTimeRange.apply()}
                />
              </InlineField>
            </div>
          )}
        </FieldsGroup>
      )}
    </>
  );
};
