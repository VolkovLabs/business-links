import { PanelPlugin } from '@grafana/data';

import { GroupsEditor, LinksPanel } from './components';
import { getMigratedOptions } from './migration';
import { PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(LinksPanel)
  .useFieldConfig({})
  .setMigrationHandler(getMigratedOptions)
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
      .addCustomEditor({
        id: 'groups',
        path: 'groups',
        name: '',
        editor: GroupsEditor,
        category: ['Layout'],
        defaultValue: [],
      })
      .addCustomEditor({
        id: 'dropdowns',
        path: 'dropdowns',
        name: '',
        editor: GroupsEditor,
        category: ['Dropdowns'],
        defaultValue: [],
      });

    return builder;
  });
