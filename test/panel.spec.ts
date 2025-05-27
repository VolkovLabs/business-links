import { test, expect } from '@grafana/plugin-e2e';

import { PanelHelper } from './utils';

test.describe('Business Links Panel', () => {
  test('Check grafana version', async ({ grafanaVersion }) => {
    console.log('Grafana version: ', grafanaVersion);
    expect(grafanaVersion).toEqual(grafanaVersion);
  });

  test.describe('Render', () => {
    test('Should display a Link Panel', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
      /**
       * Go To Panels dashboard links.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'links.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      const panel = new PanelHelper(dashboardPage, 'External links');

      /**
       * Check Panel Presence
       */
      await panel.checkPresence();
      await panel.checkIfNoErrors();
    });

    test('Should display a Link Panel with Alert if no Links', async ({
      gotoDashboardPage,
      readProvisionedDashboard,
    }) => {
      /**
       * Go To Panels dashboard links.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'links.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      const panel = new PanelHelper(dashboardPage, 'Empty links');

      /**
       * Check Panel Presence
       */
      await panel.checkPresence();
      await panel.checkIfNoErrors();

      /**
       * Check Panel Presence
       */
      await panel.checkAlertPresence();
    });
  });

  test.describe('HTML', () => {
    test('Should display a Link with HTML', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
      /**
       * Go To Panels dashboard html-type.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'html-type.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      const panel = new PanelHelper(dashboardPage, 'Simple in one row');

      /**
       * Check Panel Presence
       */
      await panel.checkPresence();
      await panel.checkIfNoErrors();

      const linksLayout = panel.getLinksLayout();
      await linksLayout.checkPresence();

      const htmlElement = linksLayout.getHtml('I am HTML');
      await htmlElement.checkPresence();
    });

    test('Should display a Link with HTML in Grid Layout', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
      /**
       * Go To Panels dashboard html-type.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'html-type.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      const panel = new PanelHelper(dashboardPage, 'Simple Grid');

      /**
       * Check Panel Presence
       */
      await panel.checkPresence();
      await panel.checkIfNoErrors();

      const gridLayout = panel.getGridLayout();
      await gridLayout.checkPresence();

      const htmlElement = gridLayout.getHtml('I am HTML');
      await htmlElement.checkPresence();
    });

    test('Should return Alert if handlebars return error', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
      /**
       * Go To Panels dashboard html-type.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'html-type.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      const panel = new PanelHelper(dashboardPage, 'Show Alert');

      /**
       * Check Panel Presence
       */
      await panel.checkPresence();
      await panel.checkIfNoErrors();

      const gridLayout = panel.getGridLayout();
      await gridLayout.checkPresence();

      const htmlElement = gridLayout.getHtml('I am HTML');
      await htmlElement.checkAlertPresence();
    });
  });

  test.describe('Configuration', () => {
    test('Should add an empty Link Panel', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
      /**
       * Go To Panels dashboard panels-second.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'panels-second.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Add new visualization
       */
      const editPage = await dashboardPage.addPanel();
      await editPage.setVisualization('Business Links');
      await editPage.setPanelTitle('Business Links Test');
      await editPage.backToDashboard();

      /**
       * Should add empty visualization without errors
       */
      const panel = new PanelHelper(dashboardPage, 'Business Links Test');
      /**
       * Check Panel Presence
       */
      await panel.checkPresence();
      await panel.checkIfNoErrors();

      /**
       * Check Panel Presence
       */
      await panel.checkAlertPresence();
    });
  });

  test.describe('Timepicker', () => {
    test('Should display a Link with Time Picker in a row', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
      /**
       * Go To Panels dashboard time-range.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'time-range.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      const panel = new PanelHelper(dashboardPage, 'Date picker');

      /**
       * Check Panel Presence
       */
      await panel.checkPresence();
      await panel.checkIfNoErrors();

      const linksLayout = panel.getLinksLayout();
      await linksLayout.checkPresence();

      const hourRangePicker = linksLayout.getTimePicker('6h');
      await hourRangePicker.checkPresence();
    });

    test('Should display a Link with Time Picker in Grid Layout', async ({
      gotoDashboardPage,
      readProvisionedDashboard,
    }) => {
      /**
       * Go To Panels dashboard time-range.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'time-range.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      const panel = new PanelHelper(dashboardPage, 'Date picker Grid');

      /**
       * Check Panel Presence
       */
      await panel.checkPresence();
      await panel.checkIfNoErrors();

      const gridLayout = panel.getGridLayout();
      await gridLayout.checkPresence();

      const dayRangePicker = gridLayout.getTimePicker('7d');
      await dayRangePicker.checkPresence();
    });

    test('Should change time range', async ({ gotoDashboardPage, readProvisionedDashboard, page }) => {
      /**
       * Go To Panels dashboard time-range.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'time-range.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      const panel = new PanelHelper(dashboardPage, 'Date picker');

      await page.waitForTimeout(2000);

      const url = new URL(page.url());
      const initialFrom = url.searchParams.get('from');
      const initialTo = url.searchParams.get('to');

      /**
       * Check Panel Presence
       */
      await panel.checkPresence();
      await panel.checkIfNoErrors();

      const linksLayout = panel.getLinksLayout();
      await linksLayout.checkPresence();

      const hourRangePicker = linksLayout.getTimePicker('6h');
      await hourRangePicker.checkPresence();

      await hourRangePicker.applyTimeRange();

      await page.waitForFunction(
        ({ from, to }) => {
          const params = new URL(window.location.href).searchParams;
          return params.get('from') !== from || params.get('to') !== to;
        },
        { from: initialFrom, to: initialTo },
        { timeout: 5000 }
      );

      const updatedFrom = new URL(page.url()).searchParams.get('from');
      const updatedTo = new URL(page.url()).searchParams.get('to');

      await expect(updatedFrom).toEqual('now-6h');
      await expect(updatedTo).toEqual('now');
    });
  });

  test('Should toggle tables via tabs', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
    /**
     * Go To Panels dashboard links.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'links.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    const panel = new PanelHelper(dashboardPage, 'Hover menu');
    const linksLayout = panel.getLinksLayout();

    await linksLayout.checkPresence();

    /**
     * Check Tabs
     */
    await panel.checkTabPresence('Group1');
    await panel.checkTabPresence('Group2');
    await panel.checkTabPresence('Group3');
    await panel.checkTabPresence('Group4');

    /**
     * Check Links in Group 1
     */
    await linksLayout.checkLinksCount(2);

    /**
     * Switch to Group2
     */
    await panel.selectTab('Group2');
    await linksLayout.checkLinksCount(1);

    /**
     * Switch to Group1 again
     */
    await panel.selectTab('Group1');
    await linksLayout.checkLinksCount(2);
  });
});
