import { cx } from '@emotion/css';
import { DataFrame, InterpolateFunction } from '@grafana/data';
import { Alert, useStyles2 } from '@grafana/ui';
import React, { useCallback, useEffect, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { VisualLink } from '@/types/links';
import { generateHtml, prepareContentData } from '@/utils';

import { getStyles } from './ContentElement.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.contentElement;

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
   * Panel Data
   *
   * @type {DataFrame[]}
   */
  panelData: DataFrame[];

  /**
   * ReplaceVariables
   *
   * @type {InterpolateFunction}
   */
  replaceVariables: InterpolateFunction;
}

/**
 * Content Element
 */
export const ContentElement: React.FC<Props> = ({ link, panelData, gridMode = false, replaceVariables }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * State
   */
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState<unknown | null>(null);

  /**
   * get HTML
   * keep async as in Text panel
   */
  const getHtml = useCallback(
    async (htmlData: Record<string, unknown>, content: string) => {
      const result = {
        ...(await generateHtml({
          data: htmlData,
          content,
          replaceVariables,
        })),
        data: panelData,
      };

      return result;
    },
    [panelData, replaceVariables]
  );

  useEffect(() => {
    const run = async () => {
      /**
       * Reset error before html generation
       */
      setError(null);

      try {
        /**
         * Prepare content data
         */
        const data = prepareContentData(panelData);

        /**
         * Prepare html content
         */
        const { html } = await getHtml({ data }, link.content ?? '');
        setHtmlContent(html);
      } catch (e) {
        setError(e);
      }
    };

    run();
  }, [getHtml, link.content, panelData]);

  if (error) {
    return (
      <div className={cx(styles.contentWrapper, gridMode && styles.linkGridMode)}>
        <Alert severity="info" title="Links" {...testIds.alert.apply(link.name)}>
          Please make sure the Content is a valid template
          {<pre {...testIds.alertText.apply()}>{error instanceof Error ? error.message : `${error}`}</pre>}
        </Alert>
      </div>
    );
  }

  /**
   * Return
   */
  return (
    <>
      {!error && (
        <div
          className={cx(styles.contentWrapper, gridMode && styles.linkGridMode)}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          {...testIds.root.apply(link.name)}
        />
      )}
    </>
  );
};
