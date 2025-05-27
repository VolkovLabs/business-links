import { Locator } from '@playwright/test';
import { DashboardPage, expect, Panel, PanelEditPage } from '@grafana/plugin-e2e';
import { TEST_IDS } from '../../src/constants';
import { getLocatorSelectors, LocatorSelectors } from './selectors';

const getLinksLayoutSelectors = getLocatorSelectors(TEST_IDS.linksLayout);
const getGridLayoutSelectors = getLocatorSelectors(TEST_IDS.gridLayout);

const getLinkElementSelectors = getLocatorSelectors(TEST_IDS.linkElement);
const getHTMLElementSelectors = getLocatorSelectors(TEST_IDS.contentElement);
const getTimePickerElementSelectors = getLocatorSelectors(TEST_IDS.timePickerElement);

/**
 * Links Element Helper
 */
class LinkElementHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.linkElement>;

  constructor(public readonly locator: Locator) {
    this.selectors = this.getSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Link Element: ${msg}`;
  }

  private getSelectors(locator: Locator) {
    return getLinkElementSelectors(locator);
  }
}

/**
 * Time Picker Element Helper
 */
class TimePickerElementHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.timePickerElement>;
  public elementName: string;
  constructor(
    public readonly locator: Locator,
    name: string
  ) {
    this.selectors = this.getSelectors(locator);
    this.elementName = name;
  }

  private getMsg(msg: string): string {
    return `Time Picker Element: ${msg}`;
  }

  private getSelectors(locator: Locator) {
    return getTimePickerElementSelectors(locator);
  }

  public get() {
    return this.selectors.buttonPicker(this.elementName);
  }

  public async checkPresence() {
    return expect(this.get(), this.getMsg('Check HTML Element Presence')).toBeVisible();
  }

  public applyTimeRange() {
    return this.get().click();
  }
}

/**
 * HTML Element Helper
 */
class HtmlElementHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.contentElement>;
  public contentElementName: string;
  constructor(
    public readonly locator: Locator,
    name: string
  ) {
    this.selectors = this.getSelectors(locator);
    this.contentElementName = name;
  }

  private getMsg(msg: string): string {
    return `HTML Element: ${msg}`;
  }

  private getSelectors(locator: Locator) {
    return getHTMLElementSelectors(locator);
  }

  public get() {
    return this.selectors.root(this.contentElementName);
  }

  public async checkPresence() {
    return expect(
      this.selectors.root(this.contentElementName),
      this.getMsg('Check HTML Element Presence')
    ).toBeVisible();
  }

  public async checkAlertPresence() {
    return expect(
      this.selectors.alert(this.contentElementName),
      this.getMsg('Check Alert Presence in HTML Element')
    ).toBeVisible();
  }
}

/**
 * Links layout Helper
 */
class LinksLayoutHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.linksLayout>;

  constructor(
    public readonly locator: Locator,
    private readonly panel: Panel
  ) {
    this.selectors = this.getSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Default Layouts: ${msg}`;
  }

  private getSelectors(locator: Locator) {
    return getLinksLayoutSelectors(locator);
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Presence')).toBeVisible();
  }

  public get() {
    return this.selectors.root();
  }

  public async checkLinksCount(count: number) {
    const rows = await this.get().locator('button').all();

    expect(rows, this.getMsg('Check Body Rows Count')).toHaveLength(count);
  }

  public getLink() {
    return new LinkElementHelper(this.locator);
  }

  public getHtml(name: string) {
    return new HtmlElementHelper(this.locator, name);
  }

  public getTimePicker(name: string) {
    return new TimePickerElementHelper(this.locator, name);
  }
}

/**
 * Grid layout Helper
 */
class GridLayoutHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.gridLayout>;

  constructor(
    public readonly locator: Locator,
    private readonly panel: Panel
  ) {
    this.selectors = this.getSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Grid Layout: ${msg}`;
  }

  private getSelectors(locator: Locator) {
    return getGridLayoutSelectors(locator);
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Presence')).toBeVisible();
  }

  public get() {
    return this.selectors.root();
  }

  public getLink() {
    return new LinkElementHelper(this.locator);
  }

  public getHtml(name: string) {
    return new HtmlElementHelper(this.locator, name);
  }

  public getTimePicker(name: string) {
    return new TimePickerElementHelper(this.locator, name);
  }
}

/**
 * Panel Helper
 */
export class PanelHelper {
  private readonly locator: Locator;
  private readonly selectors: LocatorSelectors<typeof TEST_IDS.panel>;
  private readonly panel: Panel;

  constructor(dashboardPage: DashboardPage, panelTitle: string) {
    this.panel = dashboardPage.getPanelByTitle(panelTitle);
    this.locator = this.panel.locator;
    this.selectors = getLocatorSelectors(TEST_IDS.panel)(this.locator);
  }

  private getMsg(msg: string): string {
    return `Panel: ${msg}`;
  }

  public getLinksLayout() {
    return new LinksLayoutHelper(this.locator, this.panel);
  }

  public getGridLayout() {
    return new GridLayoutHelper(this.locator, this.panel);
  }

  // public getPanelEditor(locator: Locator, editPage: PanelEditPage) {
  //   return new PanelEditorHelper(locator, editPage);
  // }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Presence')).toBeVisible();
  }

  public async checkAlertPresence() {
    return expect(this.selectors.alert(), this.getMsg('Check Alert Presence')).toBeVisible();
  }

  public async checkIfNoErrors() {
    return expect(this.panel.getErrorIcon(), this.getMsg('Check If No Errors')).not.toBeVisible();
  }

  public async checkTabPresence(name: string) {
    return expect(this.selectors.tab(name), this.getMsg('Check Tab Presence')).toBeVisible();
  }

  public async selectTab(name: string) {
    return this.selectors.tab(name).click();
  }

  // public async checkDownloadPresence() {
  //   return expect(this.selectors.buttonDownload(), this.getMsg('Check Download Presence')).toBeVisible();
  // }

  // public async checkIfDownloadNotPresence() {
  //   return expect(this.selectors.buttonDownload(), this.getMsg('Check If Download Not Presence')).not.toBeVisible();
  // }
}
