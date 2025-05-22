import { cx } from '@emotion/css';
import { Button, Dropdown, LinkButton, MenuItem, Tooltip, useStyles2 } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ButtonSize } from '@/types';
import { VisualLink } from '@/types/links';

import { getStyles } from './LinkElement.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.linkElement;

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
   * Button size
   *
   * @type {ButtonSize}
   */
  buttonSize?: ButtonSize;
}

/**
 * Links Element
 */
export const LinkElement: React.FC<Props> = ({ link, buttonSize, gridMode = false }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  if (link.links.length > 1) {
    /**
     * Menu links
     */
    const menuLinks = link.links.map((dropdownLink) => {
      return (
        <MenuItem
          key={`${dropdownLink.url}-${dropdownLink.name}`}
          label={dropdownLink.name}
          url={dropdownLink.url}
          target={dropdownLink.target}
          className={dropdownLink.isCurrentLink ? styles.currentMenuItem : styles.menuItem}
          icon={dropdownLink.icon}
          {...testIds.dropdownMenuItem.apply(dropdownLink.name)}
        />
      );
    });

    const dropdownButton = () => {
      return (
        <Button
          variant="secondary"
          className={cx(styles.link, gridMode && styles.linkGridMode)}
          size={buttonSize}
          icon={link.icon}
          fill="outline"
          {...testIds.buttonDropdown.apply(link.name)}
        >
          {link.name}
        </Button>
      );
    };
    if (link.showMenuOnHover) {
      return (
        <Tooltip
          content={<div className={styles.menu}>{menuLinks}</div>}
          theme="info"
          placement={link.hoverMenuPosition ? link.hoverMenuPosition : 'bottom'}
          interactive
          {...testIds.tooltipMenu.apply(link.name)}
        >
          {dropdownButton()}
        </Tooltip>
      );
    }

    return (
      <Dropdown
        key={link.name}
        overlay={<div className={styles.menu}>{menuLinks}</div>}
        {...testIds.dropdown.apply(link.name)}
      >
        {dropdownButton()}
      </Dropdown>
    );
  }

  /**
   * One link available
   */
  if (link.links.length === 1) {
    const currentLink = link.links[0];

    if (currentLink.url) {
      return (
        <LinkButton
          key={currentLink.url}
          className={cx(
            currentLink.isCurrentLink ? styles.currentDashboard : styles.link,
            gridMode && styles.linkGridMode
          )}
          icon={currentLink.icon}
          href={currentLink.url}
          title={currentLink.name}
          target={currentLink.target}
          variant="secondary"
          fill="outline"
          size={buttonSize}
          {...testIds.buttonSingleLink.apply(link.name)}
        >
          {currentLink.name}
        </LinkButton>
      );
    }
  }

  /**
   * Return
   */
  return (
    <Button
      variant="secondary"
      className={cx(styles.link, gridMode && styles.linkGridMode)}
      key={link.name}
      fill="outline"
      size={buttonSize}
      title={link.name}
      tooltip="Empty URL"
      {...testIds.buttonEmptyLink.apply(link.name)}
    >
      {link.name}
    </Button>
  );
};
