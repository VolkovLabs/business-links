import { cx } from '@emotion/css';
import { Button, LinkButton, useStyles2 } from '@grafana/ui';
import React, { useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { ButtonSize, DropdownAlign, DropdownType, LinkType } from '@/types';
import { VisualLink } from '@/types/links';

import { LinkElement } from '../LinkElement';
import { TimePickerElement } from '../TimePickerElement';
import { getStyles } from './MenuElement.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.menuElement;

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
   * Is link use for grid mode
   *
   * @type {boolean}
   */
  gridMode?: boolean;

  /**
   * Dynamic font size
   *
   * @type {boolean}
   */
  dynamicFontSize?: boolean;
}

/**
 * Menu Element
 */
export const MenuElement: React.FC<Props> = ({ link, gridMode = false, dynamicFontSize = false }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Prepared link for dropdown
   */
  const currentDropdownLink = useMemo(() => {
    /**
     * Nested Links without TIMEPICKER type
     */
    const filteredLinks = link.links.filter((nestedLinks) => {
      return nestedLinks.linkType !== LinkType.TIMEPICKER;
    });

    return {
      ...link,
      links: filteredLinks,
    };
  }, [link]);

  /**
   * Return
   */
  return (
    <>
      {link.dropdownConfig?.type === DropdownType.DROPDOWN && (
        <LinkElement link={currentDropdownLink} gridMode={gridMode} dynamicFontSize={dynamicFontSize} />
      )}
      {link.dropdownConfig?.type === DropdownType.ROW && (
        <div
          className={cx(
            !gridMode ? styles.defaultRow : styles.gridRow,
            link.dropdownConfig?.align === DropdownAlign.RIGHT ? styles.alignRight : styles.alignLeft
          )}
          {...testIds.root.apply()}
        >
          {link.links.map((nestedLink) => {
            if (nestedLink.linkType === LinkType.TIMEPICKER) {
              return (
                <TimePickerElement
                  key={nestedLink.name}
                  link={nestedLink as unknown as VisualLink}
                  buttonSize={gridMode ? link.dropdownConfig?.buttonSize : ButtonSize.MD}
                />
              );
            }

            if (!nestedLink.url) {
              return (
                <Button
                  variant="secondary"
                  className={cx(styles.menuLink)}
                  key={link.name}
                  fill="outline"
                  size={gridMode ? link.dropdownConfig?.buttonSize : ButtonSize.MD}
                  title={link.name}
                  tooltip="Empty URL"
                  {...testIds.defaultButton.apply(nestedLink.name)}
                >
                  {nestedLink.name}
                </Button>
              );
            }

            return (
              <LinkButton
                key={nestedLink.name}
                className={cx(nestedLink.isCurrentLink ? styles.highlight : styles.menuLink)}
                icon={nestedLink.icon}
                href={nestedLink.url}
                title={nestedLink.name}
                target={nestedLink.target}
                size={gridMode ? link.dropdownConfig?.buttonSize : ButtonSize.MD}
                variant="secondary"
                fill="outline"
                {...testIds.link.apply(nestedLink.name)}
              >
                {nestedLink.name}
              </LinkButton>
            );
          })}
        </div>
      )}
    </>
  );
};
