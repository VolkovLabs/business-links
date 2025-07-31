import { cx } from '@emotion/css';
import { Button, Dropdown, Icon, LinkButton, MenuItem, Tooltip, useStyles2 } from '@grafana/ui';
import React, { useCallback, useEffect, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { ButtonSize, LinkType } from '@/types';
import { VisualLink, VisualLinkType } from '@/types/links';

import { ChatDrawer } from '../ChatDrawer/ChatDrawer';
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

  /**
   * Dynamic font size
   *
   * @type {boolean}
   */
  dynamicFontSize?: boolean;
}

/**
 * Links Element
 */
export const LinkElement: React.FC<Props> = ({ link, buttonSize, gridMode = false, dynamicFontSize = false }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles, { dynamicFontSize });

  /**
   * States
   */
  const [linkWidth, setLinkWidth] = useState(0);
  const [linkEl, setLinkEl] = useState<HTMLElement | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  /**
   * Get link ref
   */
  const btnRef = useCallback((node: HTMLElement | null) => {
    setLinkEl(node);
  }, []);

  /**
   * Handle drawer close
   */
  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (!dynamicFontSize || !linkEl) {
      return;
    }

    /**
     * Track link element width changes
     */
    const resize = new ResizeObserver(([entry]) => {
      setLinkWidth(Math.floor(entry.contentRect.width));
    });
    resize.observe(linkEl);

    return () => resize.disconnect();
  }, [dynamicFontSize, linkEl]);

  /**
   * Mapping of content alignment positions to their corresponding styles.
   */
  const alignClassMap = {
    center: styles.alignLinkContentCenter,
    left: styles.alignLinkContentLeft,
    right: styles.alignLinkContentRight,
  } as const;

  if (link.links.length > 1) {
    /**
     * Menu links
     */
    const menuLinks = link.links.map((dropdownLink) => {
      if (dropdownLink.showCustomIcons && dropdownLink.customIconUrl && dropdownLink.linkType !== LinkType.LLMAPP) {
        return (
          <a
            key={`${dropdownLink.url}-${dropdownLink.name}`}
            href={dropdownLink.url}
            target={dropdownLink.target}
            rel="noopener noreferrer"
            className={cx(dropdownLink.isCurrentLink ? styles.currentMenuItem : styles.menuItem)}
            {...testIds.dropdownMenuItem.apply(dropdownLink.name)}
          >
            <div className={styles.menuItemWrapper}>
              <img
                src={dropdownLink.customIconUrl}
                alt=""
                className={styles.customIcon}
                {...testIds.customIconImg.apply(dropdownLink.name)}
              />
              <span className={styles.menuItemText}>{dropdownLink.name}</span>
            </div>
          </a>
        );
      }

      if (dropdownLink.linkType === LinkType.LLMAPP) {
        return (
          <div
            key={`${dropdownLink.url}-${dropdownLink.name}`}
            className={cx(dropdownLink.isCurrentLink ? styles.currentMenuItem : styles.menuItem)}
            onClick={() => setDrawerOpen(true)}
            {...testIds.dropdownMenuItem.apply(dropdownLink.name)}
          >
            <div className={styles.menuItemWrapper}>
              {dropdownLink.showCustomIcons && dropdownLink.customIconUrl && !!dropdownLink.customIconUrl.length && (
                <img
                  src={dropdownLink.customIconUrl}
                  alt=""
                  className={styles.customIcon}
                  {...testIds.customIconImg.apply(dropdownLink.name)}
                />
              )}
              {dropdownLink.icon && !dropdownLink.showCustomIcons && (
                <Icon
                  title={dropdownLink.icon}
                  size="sm"
                  name={dropdownLink.icon}
                  {...testIds.customIconSvg.apply(dropdownLink.name)}
                />
              )}
              <span className={styles.menuItemText}>{dropdownLink.name}</span>
            </div>
          </div>
        );
      }

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
          className={cx(
            styles.link,
            gridMode && styles.linkGridMode,
            link.alignContentPosition && alignClassMap[link.alignContentPosition]
          )}
          size={buttonSize}
          icon={!link.showCustomIcons ? link.icon : undefined}
          fill="outline"
          {...testIds.buttonDropdown.apply(link.name)}
        >
          {link.showCustomIcons && link.customIconUrl && !!link.customIconUrl.length && (
            <img
              src={link.customIconUrl}
              alt=""
              className={styles.customIcon}
              {...testIds.customIconImg.apply(link.name)}
            />
          )}
          {link.name}
        </Button>
      );
    };

    if (link.showMenuOnHover) {
      return (
        <>
          <div
            ref={btnRef}
            style={dynamicFontSize ? ({ '--btn-width': `${linkWidth}px` } as React.CSSProperties) : undefined}
          >
            <Tooltip
              content={<div className={styles.menu}>{menuLinks}</div>}
              theme="info"
              placement={link.hoverMenuPosition ? link.hoverMenuPosition : 'bottom'}
              interactive
              {...testIds.tooltipMenu.apply(link.name)}
            >
              {dropdownButton()}
            </Tooltip>
          </div>

          <ChatDrawer
            isOpen={isDrawerOpen}
            onClose={handleDrawerClose}
            initialPrompt={link.contextPrompt}
            assistantName={link.assistantName}
            llmTemperature={link.llmTemperature}
            useDefaultGrafanaMcp={link.useDefaultGrafanaMcp}
            mcpServers={link.mcpServers}
          />
        </>
      );
    }

    return (
      <>
        <div
          ref={btnRef}
          style={dynamicFontSize ? ({ '--btn-width': `${linkWidth}px` } as React.CSSProperties) : undefined}
        >
          <Dropdown
            key={link.name}
            overlay={<div className={styles.menu}>{menuLinks}</div>}
            {...testIds.dropdown.apply(link.name)}
          >
            {dropdownButton()}
          </Dropdown>
        </div>

        <ChatDrawer
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          initialPrompt={link.contextPrompt}
          assistantName={link.assistantName}
          llmTemperature={link.llmTemperature}
          useDefaultGrafanaMcp={link.useDefaultGrafanaMcp}
          mcpServers={link.mcpServers}
        />
      </>
    );
  }

  /**
   * One link available
   */
  if (link.links.length === 1) {
    const currentLink = link.links[0];

    if (currentLink.url) {
      return (
        <div
          ref={btnRef}
          style={dynamicFontSize ? ({ '--btn-width': `${linkWidth}px` } as React.CSSProperties) : undefined}
        >
          <LinkButton
            key={currentLink.url}
            className={cx(
              currentLink.isCurrentLink ? styles.currentDashboard : styles.link,
              gridMode && styles.linkGridMode,
              currentLink.alignContentPosition && alignClassMap[currentLink.alignContentPosition]
            )}
            icon={!currentLink.showCustomIcons ? currentLink.icon : undefined}
            href={currentLink.url}
            title={!currentLink.hideTooltipOnHover ? currentLink.name : undefined}
            target={currentLink.target}
            variant="secondary"
            fill="outline"
            size={buttonSize}
            {...testIds.buttonSingleLink.apply(link.name)}
          >
            {currentLink.showCustomIcons && currentLink.customIconUrl && !!currentLink.customIconUrl.length && (
              <img
                src={currentLink.customIconUrl}
                alt=""
                className={styles.customIcon}
                {...testIds.customIconImg.apply(link.name)}
              />
            )}
            {currentLink.name}
          </LinkButton>
        </div>
      );
    }
  }

  /**
   * LLM App type
   */
  if (link.links.length === 0 && link.type === VisualLinkType.LLMAPP) {
    return (
      <>
        <div
          ref={btnRef}
          style={dynamicFontSize ? ({ '--btn-width': `${linkWidth}px` } as React.CSSProperties) : undefined}
        >
          <Button
            variant="secondary"
            className={cx(
              styles.link,
              gridMode && styles.linkGridMode,
              link.alignContentPosition && alignClassMap[link.alignContentPosition]
            )}
            fill="outline"
            size={buttonSize}
            icon={!link.showCustomIcons ? link.icon : undefined}
            title={!link.hideTooltipOnHover ? link.name : undefined}
            onClick={() => setDrawerOpen(true)}
            {...testIds.buttonEmptyLink.apply(link.name)}
          >
            {link.showCustomIcons && link.customIconUrl && !!link.customIconUrl.length && (
              <img
                src={link.customIconUrl}
                alt=""
                className={styles.customIcon}
                {...testIds.customIconImg.apply(link.name)}
              />
            )}
            {link.name}
          </Button>
        </div>

        <ChatDrawer
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          initialPrompt={link.contextPrompt}
          assistantName={link.assistantName}
          llmTemperature={link.llmTemperature}
          useDefaultGrafanaMcp={link.useDefaultGrafanaMcp}
          mcpServers={link.mcpServers}
        />
      </>
    );
  }

  /**
   * Default empty link
   */
  return (
    <div
      ref={btnRef}
      style={dynamicFontSize ? ({ '--btn-width': `${linkWidth}px` } as React.CSSProperties) : undefined}
    >
      <Button
        variant="secondary"
        className={cx(
          styles.link,
          gridMode && styles.linkGridMode,
          link.alignContentPosition && alignClassMap[link.alignContentPosition]
        )}
        key={link.name}
        fill="outline"
        size={buttonSize}
        title={!link.hideTooltipOnHover ? link.name : undefined}
        tooltip={!link.hideTooltipOnHover ? 'Empty URL' : undefined}
        {...testIds.buttonEmptyLink.apply(link.name)}
      >
        {link.name}
      </Button>
    </div>
  );
};
