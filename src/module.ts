import { PanelPlugin } from '@grafana/data';

import { LinksPanel } from './components';
import { PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(LinksPanel).useFieldConfig({}).setPanelOptions((builder) => {
  builder.addBooleanSwitch({
    path: 'testOption',
    name: 'Test option',
    description: 'Test option',
  });

  return builder;
});
