import { InlineSwitch, Label, useStyles2 } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { VisualLink } from '@/types/links';

import { getStyles } from './AnnotationElement.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.annotationElement;

/**
 * Properties
 */
interface Props {
  /**
   * Link
   *
   * @type {VisualLink}
   */
  link: VisualLink;

  /**
   * Dynamic font size
   *
   * @type {boolean}
   */
  dynamicFontSize?: boolean;
}

/**
 * Annotation Element
 */
export const AnnotationElement: React.FC<Props> = ({ link, dynamicFontSize = false }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles, { dynamicFontSize });

  /**
   * Return
   */
  return link.annotationLayer ? (
    <div {...testIds.root.apply()} className={styles.annotationItem}>
      <Label {...testIds.label.apply()}>{link.annotationLayer.state.name}</Label>
      <InlineSwitch
        label={link.annotationLayer.state.name}
        value={link.annotationLayer.state.isEnabled}
        onChange={() => {
          /**
           * Set state for annotation
           */
          link.annotationLayer?.setState({
            ...link.annotationLayer.state,
            isEnabled: !link.annotationLayer.state.isEnabled,
          });

          /**
           * need to rerun the layer to update the query and
           * see the annotation on the panel
           */
          link.annotationLayer?.runLayer();
        }}
        {...testIds.enableField.apply()}
      />
    </div>
  ) : (
    <></>
  );
};
