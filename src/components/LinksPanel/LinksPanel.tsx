import { PanelProps } from '@grafana/data';
import React, { useState } from 'react';

import { TEST_IDS } from '@/constants';
import { PanelOptions } from '@/types';

/**
 * Properties
 */
type Props = PanelProps<PanelOptions>;

/**
 * Links Panel
 */
export const LinksPanel: React.FC<Props> = ({
  id,
  data,
  width,
  height,
  options,
  eventBus,
  replaceVariables,
  title,
}) => {
  console.log('Links options -> ', options);

  /**
   * State
   */
  const [error, setError] = useState('');

  // /**
  //  * Current group
  //  */
  // const [currentGroup, setCurrentGroup] = useSavedState<string>({
  //   key: `volkovlabs.table.panel.${id}`,
  //   initialValue: options.tables?.[0]?.name || '',
  // });

  // /**
  //  * User Preferences
  //  */
  // const [userPreferences, setUserPreferences] = useSavedState<UserPreferences>({
  //   key: `volkovlabs.table.panel.${id}.user.preferences`,
  //   initialValue: {},
  //   enabled: options.isColumnManagerAvailable && options.saveUserPreference,
  // });

  /**
   * Return
   */
  return <div {...TEST_IDS.panel.root.apply()}>Links panel</div>;
};
