import { DataFrame, IconName, SelectableValue, textUtil } from '@grafana/data';
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
import { Slider } from '@volkovlabs/components';
import React, { useMemo, useState } from 'react';

import { FieldsGroup } from '@/components';
import { TEST_IDS } from '@/constants';
import {
  AlignContentPositionType,
  AnnotationLayer,
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

import { ContentEditor, McpServersEditor, TimePickerEditor } from './components';

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

  /**
   * Is Highlight Time Picker
   *
   * @type {boolean}
   */
  isHighlightTimePicker?: boolean;

  /**
   * Available dropdowns
   *
   * @type {AnnotationLayer[]}
   */
  annotationsLayers?: AnnotationLayer[];
}

/**
 * Link Type Option Map
 */
const linkTypeOptionMap = {
  [LinkType.ANNOTATION]: {
    value: LinkType.ANNOTATION,
    label: 'Annotation toggler',
    description: 'Allows to display and hide annotations.',
  },
  [LinkType.SINGLE]: {
    value: LinkType.SINGLE,
    label: 'Link',
    description: 'A single link with a configured URL.',
  },
  [LinkType.DASHBOARD]: {
    value: LinkType.DASHBOARD,
    label: 'Dashboard',
    description: 'Select the dashboard.',
  },
  [LinkType.DROPDOWN]: {
    value: LinkType.DROPDOWN,
    label: 'Menu',
    description: 'A configured list of nested elements.',
  },
  [LinkType.TAGS]: {
    value: LinkType.TAGS,
    label: 'Tags',
    description: 'Return available dashboards. Includes filtering by tags.',
  },
  [LinkType.TIMEPICKER]: {
    value: LinkType.TIMEPICKER,
    label: 'Timepicker',
    description: 'Set time range',
  },
  [LinkType.HTML]: {
    value: LinkType.HTML,
    label: 'HTML/Handlebars',
    description: 'HTML element with handlebars support.',
  },
  [LinkType.LLMAPP]: {
    value: LinkType.LLMAPP,
    label: 'Business AI',
    description: 'Open Business AI in a side bar.',
  },
};

/**
 * Link Type Options
 */
export const linkTypeOptions = [
  linkTypeOptionMap[LinkType.ANNOTATION],
  linkTypeOptionMap[LinkType.LLMAPP],
  linkTypeOptionMap[LinkType.DASHBOARD],
  linkTypeOptionMap[LinkType.HTML],
  linkTypeOptionMap[LinkType.SINGLE],
  linkTypeOptionMap[LinkType.DROPDOWN],
  linkTypeOptionMap[LinkType.TAGS],
  linkTypeOptionMap[LinkType.TIMEPICKER],
];

/**
 * Link Type Options in dropdown editor
 */
export const linkTypeOptionsInDropdown = [
  linkTypeOptionMap[LinkType.ANNOTATION],
  linkTypeOptionMap[LinkType.LLMAPP],
  linkTypeOptionMap[LinkType.DASHBOARD],
  linkTypeOptionMap[LinkType.SINGLE],
  linkTypeOptionMap[LinkType.TAGS],
  linkTypeOptionMap[LinkType.TIMEPICKER],
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
export const LinkEditor: React.FC<Props> = ({
  value,
  onChange,
  isGrid,
  data,
  dashboards,
  optionId,
  dropdowns,
  annotationsLayers,
}) => {
  /**
   * Annotations Layers options
   */
  const availableAnnotationsOptions = useMemo(() => {
    return annotationsLayers?.map((layer) => ({
      value: layer.state.name,
      label: layer.state.name,
    }));
  }, [annotationsLayers]);

  /**
   * Errors State
   */
  const [errors, setErrors] = useState({
    url: '',
  });

  const [currentUrl, setCurrentUrl] = useState(value.url);

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

        {value.linkType === LinkType.ANNOTATION && (
          <InlineField label="Annotation" grow={true} labelWidth={20}>
            <Select
              options={availableAnnotationsOptions}
              value={value.annotationKey}
              onChange={(event) => {
                onChange({ ...value, annotationKey: event.value! });
              }}
              {...TEST_IDS.linkEditor.fieldAnnotationLayer.apply()}
            />
          </InlineField>
        )}

        {value.linkType === LinkType.LLMAPP && (
          <>
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

            <InlineField label="AI Assistant Name" grow={true} labelWidth={20}>
              <Input
                value={value.assistantName}
                onChange={(event) => {
                  onChange({
                    ...value,
                    assistantName: event.currentTarget.value,
                  });
                }}
                {...TEST_IDS.linkEditor.fieldAssistantName.apply()}
              />
            </InlineField>

            <InlineField
              label="Set temperature"
              labelWidth={20}
              grow={true}
              tooltip="Set the temperature for the LLM, 0 is the most deterministic, 1 is the most creative."
            >
              <Slider
                value={value.llmTemperature ?? 0.7}
                min={0}
                max={1}
                step={0.1}
                included={true}
                onChange={(temp) => {
                  onChange({
                    ...value,
                    llmTemperature: temp,
                  });
                }}
                {...TEST_IDS.linkEditor.fieldLlmTemperature.apply()}
              />
            </InlineField>

            <InlineField
              label="Use Grafana MCP"
              labelWidth={20}
              tooltip="Enable default Grafana MCP server for enhanced LLM capabilities"
            >
              <InlineSwitch
                value={value.useDefaultGrafanaMcp || false}
                onChange={(event) => {
                  const newValue = {
                    ...value,
                    useDefaultGrafanaMcp: event.currentTarget.checked,
                  };
                  onChange(newValue);
                }}
                {...TEST_IDS.linkEditor.fieldUseDefaultMcp.apply()}
              />
            </InlineField>

            <InlineField
              label="Loading icon"
              labelWidth={20}
              tooltip="Show loading spinner for `tool` message instead of raw messages"
            >
              <InlineSwitch
                value={value.showLoadingForRawMessage || false}
                onChange={(event) => {
                  const newValue = {
                    ...value,
                    showLoadingForRawMessage: event.currentTarget.checked,
                  };
                  onChange(newValue);
                }}
                {...TEST_IDS.linkEditor.fieldShowSpinner.apply()}
              />
            </InlineField>

            <FieldsGroup label="MCP Servers" description="Configure external MCP servers for enhanced LLM capabilities">
              <McpServersEditor
                value={value.mcpServers || []}
                onChange={(mcpServers) => {
                  onChange({
                    ...value,
                    mcpServers,
                  });
                }}
              />
            </FieldsGroup>
          </>
        )}

        {value.linkType === LinkType.SINGLE && (
          <InlineField label="URL" grow={true} labelWidth={20} error={errors.url} invalid={!!errors.url}>
            <Input
              value={currentUrl}
              onChange={(event) => {
                let urlValue = event.currentTarget.value;

                if (errors.url) {
                  setErrors((prev) => ({
                    ...prev,
                    url: '',
                  }));
                }

                if (!!event.currentTarget.value) {
                  urlValue = textUtil.sanitizeUrl(event.currentTarget.value);

                  if (event.currentTarget.value !== urlValue) {
                    setErrors((prev) => ({
                      ...prev,
                      url: 'Wrong text content',
                    }));

                    setCurrentUrl(event.currentTarget.value);

                    return;
                  }
                }

                onChange({
                  ...value,
                  url: urlValue,
                });

                setCurrentUrl(urlValue);
              }}
              {...TEST_IDS.linkEditor.fieldUrl.apply()}
            />
          </InlineField>
        )}

        {value.linkType === LinkType.TAGS && (
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

      {value.linkType !== LinkType.HTML && value.linkType !== LinkType.ANNOTATION && (
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
        value.linkType !== LinkType.DROPDOWN &&
        value.linkType !== LinkType.LLMAPP &&
        value.linkType !== LinkType.ANNOTATION && (
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
