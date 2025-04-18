import { IconName, SelectableValue } from '@grafana/data';
import { getAvailableIcons, InlineField, InlineSwitch, Input, RadioButtonGroup, Select, TagsInput } from '@grafana/ui';
import React, { useMemo } from 'react';

import { FieldsGroup } from '@/components';
import { TEST_IDS } from '@/constants';
import { DashboardMeta, EditorProps, LinkConfig, LinkTarget, LinkType } from '@/types';

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
    value: LinkType.TAGS,
    label: 'Tags',
    description: 'Return available dashboards. Includes filtering by tags.',
  },
  {
    value: LinkType.DROPDOWN,
    label: 'Dropdown',
    description: 'A configured list of links.',
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
 * Link Editor
 */
export const LinkEditor: React.FC<Props> = ({ value, onChange, dashboards, optionId, dropdowns }) => {
  /**
   * Icon Options
   */
  const iconOptions = useMemo((): Array<SelectableValue<string>> => {
    return getAvailableIcons().map((icon) => {
      return {
        value: icon,
        label: icon,
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
    <>
      <FieldsGroup label="Link">
        <InlineField label="Link Type" grow={true} labelWidth={12}>
          <Select
            options={optionId === 'groups' ? linkTypeOptions : linkTypeOptionsInDropdown}
            value={value.linkType}
            isMulti={false}
            onChange={(event) => {
              onChange({ ...value, linkType: event.value! });
            }}
            {...TEST_IDS.linkEditor.fieldLinkType.apply()}
          />
        </InlineField>

        {value.linkType === LinkType.SINGLE && (
          <InlineField label="URL" grow={true} labelWidth={12}>
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
          <InlineField label="With Tags" grow={true} labelWidth={12}>
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
          <InlineField label="Dashboard" grow={true} labelWidth={12}>
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
          <InlineField label="Dropdown" grow={true} labelWidth={12}>
            <Select
              options={availableDropdownsOptions}
              value={value.dropdownName}
              onChange={(event) => {
                onChange({ ...value, dropdownName: event.value! });
              }}
              {...TEST_IDS.linkEditor.fieldDropdown.apply()}
            />
          </InlineField>
        )}
      </FieldsGroup>
      <FieldsGroup label="Configuration">
        <InlineField label="Icon" grow labelWidth={12}>
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
        <InlineField grow={true} label="Open in" labelWidth={12} {...TEST_IDS.linkEditor.fieldTarget.apply()}>
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
      </FieldsGroup>

      <FieldsGroup label="Include">
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
    </>
  );
};
