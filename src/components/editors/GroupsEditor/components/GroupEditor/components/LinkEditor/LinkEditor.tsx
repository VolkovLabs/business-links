import { DataFrame, IconName, SelectableValue } from '@grafana/data';
import {
  getAvailableIcons,
  InlineField,
  InlineSwitch,
  Input,
  RadioButtonGroup,
  Select,
  TagsInput,
  TextArea,
} from '@grafana/ui';
import React, { useMemo } from 'react';

import { FieldsGroup } from '@/components';
import { TEST_IDS } from '@/constants';
import {
  AlignContentPositionType,
  ButtonSize,
  DashboardMeta,
  DropdownAlign,
  DropdownType,
  EditorProps,
  HoverMenuPositionType,
  LinkConfig,
  LinkTarget,
  LinkType,
} from '@/types';

import { ContentEditor, TimePickerEditor } from './components';

/**
 * Properties
 */
interface Props extends EditorProps<LinkConfig> {
  /**
   * Dashboards
   *
   * @type {DashboardMeta[]}
   */
  dashboards: DashboardMeta[];

  /**
   * Option id
   *
   * @type {string}
   */
  optionId?: string;

  /**
   * Available dropdowns
   *
   * @type {string[]}
   */
  dropdowns?: string[];

  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];

  /**
   * Is grid mode
   *
   * @type {boolean}
   */
  isGrid?: boolean;
}

/**
 * Link Type Options
 */
export const linkTypeOptions = [
  {
    value: LinkType.SINGLE,
    label: 'Link',
    description: 'A single link with a configured URL.',
  },
  {
    value: LinkType.DASHBOARD,
    label: 'Dashboard',
    description: 'Select the dashboard.',
  },
  {
    value: LinkType.DROPDOWN,
    label: 'Menu',
    description: 'A configured list of nested elements.',
  },
  {
    value: LinkType.TAGS,
    label: 'Tags',
    description: 'Return available dashboards. Includes filtering by tags.',
  },
  {
    value: LinkType.TIMEPICKER,
    label: 'Timepicker',
    description: 'Set time range',
  },
  {
    value: LinkType.HTML,
    label: 'HTML/Handlebars',
    description: 'HTML element with handlebars support.',
  },
  {
    value: LinkType.LLMAPP,
    label: 'Business AI',
    description: 'Open Business AI in a side bar.',
  },
];

/**
 * Link Type Options in dropdown editor
 */
export const linkTypeOptionsInDropdown = [
  {
    value: LinkType.SINGLE,
    label: 'Link',
    description: 'A single link with a configured URL.',
  },
  {
    value: LinkType.DASHBOARD,
    label: 'Dashboard',
    description: 'Select the dashboard.',
  },
  {
    value: LinkType.TAGS,
    label: 'Tags',
    description: 'Return available dashboards. Includes filtering by tags.',
  },
  {
    value: LinkType.TIMEPICKER,
    label: 'Timepicker',
    description: 'Set time range',
  },
  {
    value: LinkType.LLMAPP,
    label: 'Business AI',
    description: 'Open Business AI in a side bar.',
  },
];

/**
 * Hover menu position options
 */
export const hoverMenuPositionOptions = [
  {
    value: HoverMenuPositionType.BOTTOM,
    label: 'Bottom',
  },
  {
    value: HoverMenuPositionType.LEFT,
    label: 'Left',
  },
  {
    value: HoverMenuPositionType.RIGHT,
    label: 'Right',
  },
  {
    value: HoverMenuPositionType.TOP,
    label: 'Top',
  },
];

/**
 * Link Target Options
 */
export const linkTargetOptions = [
  {
    label: 'Same Tab',
    value: LinkTarget.SELF_TAB,
    ariaLabel: TEST_IDS.linkEditor.fieldTargetOption.selector(LinkTarget.SELF_TAB),
  },
  {
    label: 'New Tab',
    value: LinkTarget.NEW_TAB,
    icon: 'external-link-alt',
    ariaLabel: TEST_IDS.linkEditor.fieldTargetOption.selector(LinkTarget.NEW_TAB),
  },
];

/**
 * Dropdown Type Options
 */
export const dropdownTypeOptions = [
  {
    label: 'Dropdown',
    value: DropdownType.DROPDOWN,
    ariaLabel: TEST_IDS.linkEditor.fieldDropdownTypeOption.selector(DropdownType.DROPDOWN),
  },
  {
    label: 'Button Row',
    value: DropdownType.ROW,
    ariaLabel: TEST_IDS.linkEditor.fieldDropdownTypeOption.selector(DropdownType.ROW),
  },
];

/**
 * Dropdown align options
 */
export const dropdownAlignOptions = [
  {
    label: 'Left',
    value: DropdownAlign.LEFT,
    ariaLabel: TEST_IDS.linkEditor.fieldDropdownAlignOption.selector(DropdownAlign.LEFT),
  },
  {
    label: 'Right',
    value: DropdownAlign.RIGHT,
    ariaLabel: TEST_IDS.linkEditor.fieldDropdownAlignOption.selector(DropdownAlign.RIGHT),
  },
];

/**
 * Dropdown buttons size options
 */
export const dropdownButtonsSizeOptions = [
  {
    label: 'Small',
    value: ButtonSize.SM,
    ariaLabel: TEST_IDS.linkEditor.fieldDropdownButtonSizeOption.selector(ButtonSize.SM),
  },
  {
    label: 'Medium',
    value: ButtonSize.MD,
    ariaLabel: TEST_IDS.linkEditor.fieldDropdownButtonSizeOption.selector(ButtonSize.MD),
  },
  {
    label: 'Large',
    value: ButtonSize.LG,
    ariaLabel: TEST_IDS.linkEditor.fieldDropdownButtonSizeOption.selector(ButtonSize.LG),
  },
];

/**
 * Align content options
 */
export const alignContentPositionOptions = [
  {
    value: AlignContentPositionType.LEFT,
    label: 'Left',
    icon: 'horizontal-align-left',
    ariaLabel: TEST_IDS.linkEditor.fieldAlignContentOption.selector(AlignContentPositionType.LEFT),
  },
  {
    value: AlignContentPositionType.CENTER,
    label: 'Center',
    icon: 'horizontal-align-center',
    ariaLabel: TEST_IDS.linkEditor.fieldAlignContentOption.selector(AlignContentPositionType.CENTER),
  },
  {
    value: AlignContentPositionType.RIGHT,
    label: 'Right',
    icon: 'horizontal-align-center',
    ariaLabel: TEST_IDS.linkEditor.fieldAlignContentOption.selector(AlignContentPositionType.RIGHT),
  },
];

/**
 * Link Editor
 */
export const LinkEditor: React.FC<Props> = ({ value, onChange, isGrid, data, dashboards, optionId, dropdowns }) => {
  /**
   * Icon Options
   */
  const iconOptions = useMemo((): Array<SelectableValue<string>> => {
    return getAvailableIcons()
      .sort((a, b) => a.localeCompare(b))
      .map((icon) => {
        return {
          value: icon,
          label: icon,
          icon: icon,
        };
      });
  }, []);

  /**
   * Available dashboard Options
   */
  const availableDashboardOptions = useMemo(() => {
    return dashboards.map((dashboard) => ({
      value: dashboard.url,
      label: dashboard.title,
    }));
  }, [dashboards]);

  /**
   * Available dropdowns options
   */
  const availableDropdownsOptions = useMemo(() => {
    return dropdowns?.map((dropdown) => ({
      value: dropdown,
      label: dropdown,
    }));
  }, [dropdowns]);

  return (
    <div {...TEST_IDS.linkEditor.root.apply(value.name)}>
      <FieldsGroup label="Link">
        <InlineField label="Type" grow={true} labelWidth={20}>
          <Select
            options={optionId === 'groups' ? linkTypeOptions : linkTypeOptionsInDropdown}
            value={value.linkType}
            isMulti={false}
            onChange={(event) => {
              if (event) {
                onChange({ ...value, linkType: event.value! });
              }
            }}
            {...TEST_IDS.linkEditor.fieldLinkType.apply()}
          />
        </InlineField>

        {value.linkType === LinkType.LLMAPP && (
          <InlineField label="Initial Context" grow={true} labelWidth={20}>
            <TextArea
              cols={30}
              placeholder="Provide your context prompt for Business AI"
              value={value.contextPrompt}
              onChange={(event) => {
                onChange({
                  ...value,
                  contextPrompt: event.currentTarget.value,
                });
              }}
              {...TEST_IDS.linkEditor.fieldContextPrompt.apply()}
            />
          </InlineField>
        )}

        {value.linkType === LinkType.SINGLE && (
          <InlineField label="URL" grow={true} labelWidth={20}>
            <Input
              value={value.url}
              onChange={(event) => {
                onChange({
                  ...value,
                  url: event.currentTarget.value,
                });
              }}
              {...TEST_IDS.linkEditor.fieldUrl.apply()}
            />
          </InlineField>
        )}

        {value.linkType === LinkType.TAGS && (
          <>
            <InlineField label="With Tags" grow={true} labelWidth={20}>
              <TagsInput
                tags={value.tags}
                width={40}
                onChange={(cookies) =>
                  onChange({
                    ...value,
                    tags: cookies,
                  })
                }
                {...TEST_IDS.linkEditor.fieldTags.apply()}
              />
            </InlineField>
          </>
        )}

        {value.linkType === LinkType.DASHBOARD && (
          <InlineField label="Dashboard" grow={true} labelWidth={20}>
            <Select
              options={availableDashboardOptions}
              value={value.dashboardUrl}
              onChange={(event) => {
                onChange({ ...value, dashboardUrl: event.value! });
              }}
              {...TEST_IDS.linkEditor.fieldDashboard.apply()}
            />
          </InlineField>
        )}

        {value.linkType === LinkType.DROPDOWN && optionId === 'groups' && (
          <>
            <InlineField label="Menu" grow={true} labelWidth={20}>
              <Select
                options={availableDropdownsOptions}
                value={value.dropdownName}
                onChange={(event) => {
                  onChange({ ...value, dropdownName: event.value! });
                }}
                {...TEST_IDS.linkEditor.fieldDropdown.apply()}
              />
            </InlineField>
          </>
        )}

        {value.linkType === LinkType.TIMEPICKER && <TimePickerEditor value={value} data={data} onChange={onChange} />}
        {value.linkType === LinkType.HTML && <ContentEditor value={value} onChange={onChange} />}

        {optionId === 'groups' && value.linkType === LinkType.DROPDOWN && (
          <InlineField grow={true} label="Menu Type" labelWidth={20} {...TEST_IDS.linkEditor.fieldDropdownType.apply()}>
            <RadioButtonGroup
              value={value.dropdownConfig?.type}
              onChange={(eventValue) => {
                onChange({
                  ...value,
                  dropdownConfig: {
                    ...value.dropdownConfig,
                    type: eventValue,
                  },
                });
              }}
              options={dropdownTypeOptions}
            />
          </InlineField>
        )}

        {optionId === 'groups' &&
          value.linkType === LinkType.DROPDOWN &&
          value.dropdownConfig?.type === DropdownType.ROW &&
          isGrid && (
            <>
              <InlineField
                grow={true}
                label="Align"
                labelWidth={20}
                {...TEST_IDS.linkEditor.fieldDropdownAlign.apply()}
              >
                <RadioButtonGroup
                  value={value.dropdownConfig?.align}
                  onChange={(eventValue) => {
                    onChange({
                      ...value,
                      dropdownConfig: {
                        ...value.dropdownConfig,
                        align: eventValue,
                      },
                    });
                  }}
                  options={dropdownAlignOptions}
                />
              </InlineField>
              <InlineField
                grow={true}
                label="Buttons size"
                labelWidth={20}
                {...TEST_IDS.linkEditor.fieldDropdownButtonSize.apply()}
              >
                <RadioButtonGroup
                  value={value.dropdownConfig?.buttonSize}
                  onChange={(eventValue) => {
                    onChange({
                      ...value,
                      dropdownConfig: {
                        ...value.dropdownConfig,
                        buttonSize: eventValue,
                      },
                    });
                  }}
                  options={dropdownButtonsSizeOptions}
                />
              </InlineField>
            </>
          )}

        {optionId === 'groups' &&
          (value.linkType === LinkType.TAGS ||
            (value.linkType === LinkType.DROPDOWN && value.dropdownConfig?.type !== DropdownType.ROW)) && (
            <InlineField label="Show menu on hover" grow={true} labelWidth={20}>
              <InlineSwitch
                value={value.showMenuOnHover}
                onChange={(event) => {
                  onChange({
                    ...value,
                    showMenuOnHover: event.currentTarget.checked,
                  });
                }}
                {...TEST_IDS.linkEditor.fieldShowMenu.apply()}
              />
            </InlineField>
          )}

        {optionId === 'groups' &&
          (value.linkType === LinkType.TAGS || value.linkType === LinkType.DROPDOWN) &&
          value.showMenuOnHover && (
            <InlineField label="Menu position" grow={true} labelWidth={20} tooltip={'Bottom position by default'}>
              <Select
                options={hoverMenuPositionOptions}
                value={value.hoverMenuPosition ?? HoverMenuPositionType.BOTTOM}
                onChange={(event) => {
                  onChange({ ...value, hoverMenuPosition: event.value! });
                }}
                {...TEST_IDS.linkEditor.fieldHoverPosition.apply()}
              />
            </InlineField>
          )}
      </FieldsGroup>

      {value.linkType !== LinkType.HTML && (
        <FieldsGroup label="Configuration">
          <InlineField label="Use custom icon" grow={true} labelWidth={20}>
            <InlineSwitch
              value={value.showCustomIcons}
              onChange={(event) => {
                onChange({
                  ...value,
                  showCustomIcons: event.currentTarget.checked,
                });
              }}
              {...TEST_IDS.linkEditor.fieldShowCustomIcon.apply()}
            />
          </InlineField>
          {value.showCustomIcons ? (
            <InlineField label="Custom icon URL" grow={true} labelWidth={20}>
              <Input
                value={value.customIconUrl}
                onChange={(event) => {
                  onChange({
                    ...value,
                    customIconUrl: event.currentTarget.value,
                  });
                }}
                {...TEST_IDS.linkEditor.fieldCustomIconUrl.apply()}
              />
            </InlineField>
          ) : (
            <InlineField label="Native icon" grow labelWidth={20}>
              <Select
                options={iconOptions}
                isClearable
                onChange={(event) => {
                  onChange({
                    ...value,
                    icon: event?.value as IconName | undefined,
                  });
                }}
                {...TEST_IDS.linkEditor.fieldIcon.apply()}
                value={value.icon}
              />
            </InlineField>
          )}

          {value.linkType !== LinkType.DROPDOWN &&
            value.linkType !== LinkType.TIMEPICKER &&
            value.linkType !== LinkType.LLMAPP && (
              <InlineField grow={true} label="Open in" labelWidth={20} {...TEST_IDS.linkEditor.fieldTarget.apply()}>
                <RadioButtonGroup
                  value={value.target}
                  onChange={(eventValue) => {
                    onChange({
                      ...value,
                      target: eventValue,
                    });
                  }}
                  options={linkTargetOptions}
                />
              </InlineField>
            )}

          {optionId === 'groups' && (
            <InlineField
              label="Align content"
              grow={true}
              labelWidth={20}
              tooltip={'Default to left alignment'}
              {...TEST_IDS.linkEditor.fieldAlignContent.apply()}
            >
              <RadioButtonGroup
                options={alignContentPositionOptions}
                value={value.alignContentPosition ?? AlignContentPositionType.LEFT}
                onChange={(eventValue) => {
                  onChange({ ...value, alignContentPosition: eventValue });
                }}
              />
            </InlineField>
          )}

          <InlineField label="Hide tooltip on hover" grow={true} labelWidth={20}>
            <InlineSwitch
              value={value.hideTooltipOnHover}
              onChange={(event) => {
                onChange({
                  ...value,
                  hideTooltipOnHover: event.currentTarget.checked,
                });
              }}
              {...TEST_IDS.linkEditor.fieldHideTooltipOnHover.apply()}
            />
          </InlineField>
        </FieldsGroup>
      )}

      {value.linkType !== LinkType.TIMEPICKER &&
        value.linkType !== LinkType.HTML &&
        value.linkType !== LinkType.DROPDOWN && (
          <FieldsGroup label="Include">
            <InlineField
              label="Support kiosk mode"
              tooltip="Allow link to support kiosk mode when kiosk mode is enabled"
              grow={true}
              labelWidth={32}
            >
              <InlineSwitch
                value={value.includeKioskMode}
                onChange={(event) => {
                  onChange({
                    ...value,
                    includeKioskMode: event.currentTarget.checked,
                  });
                }}
                {...TEST_IDS.linkEditor.fieldIncludeKioskMode.apply()}
              />
            </InlineField>
            <InlineField label="Current time range" grow={true} labelWidth={32}>
              <InlineSwitch
                value={value.includeTimeRange}
                onChange={(event) => {
                  onChange({
                    ...value,
                    includeTimeRange: event.currentTarget.checked,
                  });
                }}
                {...TEST_IDS.linkEditor.fieldIncludeTimeRange.apply()}
              />
            </InlineField>
            <InlineField label="Current template variable values" grow={true} labelWidth={32}>
              <InlineSwitch
                value={value.includeVariables}
                onChange={(event) => {
                  onChange({
                    ...value,
                    includeVariables: event.currentTarget.checked,
                  });
                }}
                {...TEST_IDS.linkEditor.fieldIncludeVariables.apply()}
              />
            </InlineField>
          </FieldsGroup>
        )}
    </div>
  );
};
