import { FieldConfigProperty, PanelPlugin } from '@grafana/data';

import { GroupsEditor, LinksPanel } from './components';
import { STICKY_OPTIONS } from './constants';
import { getMigratedOptions } from './migration';
import { PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(LinksPanel)
  .useFieldConfig({})
  .setMigrationHandler(getMigratedOptions)
  .setNoPadding()
  .useFieldConfig({
    disableStandardOptions: [
      FieldConfigProperty.Color,
      FieldConfigProperty.Decimals,
      FieldConfigProperty.DisplayName,
      FieldConfigProperty.Filterable,
      FieldConfigProperty.Mappings,
      FieldConfigProperty.NoValue,
      FieldConfigProperty.Thresholds,
      FieldConfigProperty.Links,
      FieldConfigProperty.Unit,
      FieldConfigProperty.Min,
      FieldConfigProperty.Max,
      FieldConfigProperty.FieldMinMax,
    ],
  })
  .setPanelOptions((builder) => {
    /**
     * Options
     */
    builder
      .addBooleanSwitch({
        path: 'groupsSorting',
        name: 'Groups Sorting',
        description: 'Show selected Group first',
        showIf: (config) => config.groups?.length > 1,
      })
      .addRadio({
        path: 'sticky',
        name: 'Sticky position',
        description: 'Links will follow when scrolling.',
        settings: {
          options: STICKY_OPTIONS,
        },
        defaultValue: false,
      })
      .addSliderInput({
        path: 'customPadding',
        name: 'Padding',
        category: ['Layout'],
        defaultValue: 0,
        settings: {
          min: 0,
          max: 20,
        },
      })
      .addCustomEditor({
        id: 'groups',
        path: 'groups',
        name: ' ',
        editor: GroupsEditor,
        category: ['Layout'],
        defaultValue: [],
      })
      .addCustomEditor({
        id: 'dropdowns',
        path: 'dropdowns',
        name: ' ',
        description: 'Set nested list of items',
        editor: GroupsEditor,
        category: ['Menu'],
        defaultValue: [],
      });

    return builder;
  });
