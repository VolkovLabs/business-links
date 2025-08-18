import { DataFrame, InterpolateFunction } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { GroupConfig, VisualLink, VisualLinkType } from '@/types';

import { AnnotationElement } from '../AnnotationElement';
import { ContentElement } from '../ContentElement';
import { LinkElement } from '../LinkElement';
import { MenuElement } from '../MenuElement';
import { TimePickerElement } from '../TimePickerElement';
import { getStyles } from './LinksLayout.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.linksLayout;

/**
 * Properties
 */
interface Props {
  /**
   * Active group
   */
  activeGroup: GroupConfig | undefined;

  /**
   * Current links
   */
  currentLinks: VisualLink[];

  /**
   * Panel Data
   */
  panelData: DataFrame[];

  /**
   * Replace Variables
   */
  replaceVariables: InterpolateFunction;
}

/**
 * Links Layout
 *
 */
export const LinksLayout: React.FC<Props> = ({ activeGroup, panelData, replaceVariables, currentLinks }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Return
   * TODO: should be updated on Switch construction with elements similar with Form Panel
   */
  return (
    <div className={styles.linksContainer} {...testIds.root.apply()}>
      {!activeGroup?.gridLayout &&
        currentLinks.map((link) => {
          if (link.type === VisualLinkType.TIMEPICKER) {
            return <TimePickerElement key={link.name} link={link} />;
          }
          if (link.type === VisualLinkType.MENU) {
            return <MenuElement key={link.name} link={link} />;
          }
          if (link.type === VisualLinkType.HTML) {
            return (
              <ContentElement key={link.name} link={link} panelData={panelData} replaceVariables={replaceVariables} />
            );
          }
          if (link.type === VisualLinkType.ANNOTATION) {
            return <AnnotationElement key={link.name} link={link} />;
          }
          return <LinkElement key={link.name} link={link} />;
        })}
    </div>
  );
};
