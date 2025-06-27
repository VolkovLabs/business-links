import { Locator } from '@playwright/test';
import { DashboardPage, expect, Panel, PanelEditPage } from '@grafana/plugin-e2e';
import { TEST_IDS } from '../../src/constants';
import { getLocatorSelectors, LocatorSelectors } from './selectors';

const getLinksLayoutSelectors = getLocatorSelectors(TEST_IDS.linksLayout);
const getGridLayoutSelectors = getLocatorSelectors(TEST_IDS.gridLayout);

const getLinkElementSelectors = getLocatorSelectors(TEST_IDS.linkElement);
const getHTMLElementSelectors = getLocatorSelectors(TEST_IDS.contentElement);
const getTimePickerElementSelectors = getLocatorSelectors(TEST_IDS.timePickerElement);

const getGroupEditorSelectors = getLocatorSelectors(TEST_IDS.groupEditor);
const getLinkEditorSelectors = getLocatorSelectors(TEST_IDS.linkEditor);
const getTimePickerSelectors = getLocatorSelectors(TEST_IDS.timePickerEditor);

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

  public async isVisibleInViewPort() {
    const rectInViewport = await this.get().evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const isInViewport = rect.top >= 0 && rect.bottom <= viewportHeight;
      return isInViewport;
    });

    return expect(rectInViewport).toBeTruthy();
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
 * TimePicker Editor Helper
 */
class TimePickerEditorHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.timePickerEditor>;
  constructor(public readonly locator: Locator) {
    this.selectors = this.getSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `TimePicker Editor: ${msg}`;
  }

  private getSelectors(locator: Locator) {
    return getTimePickerSelectors(locator);
  }

  public async checkFieldFromPresence() {
    return expect(this.selectors.fieldFromPicker(), this.getMsg('Check from range field editor')).toBeVisible();
  }

  public async checkFieldToPresence() {
    return expect(this.selectors.fieldToPicker(), this.getMsg('Check to range field editor')).toBeVisible();
  }
}

/**
 * Link Editor Helper
 */
class LinkEditorHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.linkEditor>;
  public linkName: string;
  constructor(
    public readonly locator: Locator,
    name: string
  ) {
    this.selectors = this.getSelectors(locator);
    this.linkName = name;
  }

  private getMsg(msg: string): string {
    return `Link Editor: ${msg}`;
  }

  private getSelectors(locator: Locator) {
    return getLinkEditorSelectors(locator);
  }

  public get() {
    return this.selectors.root(this.linkName);
  }

  public async checkIconEditorPresence() {
    return expect(this.selectors.fieldIcon(), this.getMsg('Check Icon Editor')).toBeVisible();
  }

  public getTimePickerEditor() {
    return new TimePickerEditorHelper(this.get());
  }
}

/**
 * GroupEditorHelper
 */
class GroupEditorHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.groupEditor>;
  public editorName: string;
  constructor(
    public readonly locator: Locator,
    name: string
  ) {
    this.selectors = this.getSelectors(locator);
    this.editorName = name;
  }

  private getMsg(msg: string): string {
    return `Group Editor: ${msg}`;
  }

  private getSelectors(locator: Locator) {
    return getGroupEditorSelectors(locator);
  }

  public get() {
    return this.selectors.root(this.editorName);
  }

  public async checkPresence() {
    return expect(this.selectors.root(this.editorName), this.getMsg('Check Group Editor Presence')).toBeVisible();
  }

  public async openLinkEditor(name: string) {
    return await this.selectors.itemHeader(name).locator('button[aria-label="Expand"]').click();
  }

  public getLinkEditor(linkName: string) {
    return new LinkEditorHelper(this.get(), linkName);
  }
}

/**
 * Panel Editor Helper
 */
class PanelEditorHelper {
  private readonly tablesEditorSelectors: LocatorSelectors<typeof TEST_IDS.groupsEditor>;

  constructor(
    private readonly locator: Locator,
    private readonly editPage: PanelEditPage
  ) {
    this.tablesEditorSelectors = getLocatorSelectors(TEST_IDS.groupsEditor)(this.locator);
  }

  private getMsg(msg: string): string {
    return `Panel Editor: ${msg}`;
  }

  public async openGroupsEditor(name: string) {
    await this.tablesEditorSelectors.itemTitle(name).click();
  }

  public getGroupsEditor(name: string) {
    return this.tablesEditorSelectors.root(name);
  }

  public async collapsedOptions() {
    const options = this.editPage.getPanelOptions();
    return await options.collapse();
  }

  public geGroupEditor(groupsName: string, groupName: string) {
    const groupsEditor = this.tablesEditorSelectors.root(groupsName);
    return new GroupEditorHelper(groupsEditor, groupName);
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

  public getPanelEditor(locator: Locator, editPage: PanelEditPage) {
    return new PanelEditorHelper(locator, editPage);
  }
}
