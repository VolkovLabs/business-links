import { PanelPlugin } from '@grafana/data';

import { GroupsEditor, LinksPanel } from './components';
import { PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(LinksPanel).useFieldConfig({}).setPanelOptions((builder) => {
  /**
   * Options
   */
  builder
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
