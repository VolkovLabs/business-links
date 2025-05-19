import { InterpolateFunction, textUtil } from '@grafana/data';
import { config } from '@grafana/runtime';
import handlebars from 'handlebars';

import { registerHelpers } from './handlebars';
import { replaceVariablesHelper } from './helpers';

/**
 * Helpers
 */
registerHelpers(handlebars);

/**
 * Generate HTML
 */
export const generateHtml = async ({
  data,
  content,
  replaceVariables,
}: {
  data: Record<string, unknown>;
  content: string;
  replaceVariables: InterpolateFunction;
}): Promise<{ html: string; unsubscribe?: unknown }> => {
  /**
   * Variable
   */
  handlebars.registerHelper('variable', (name: string) => {
    return replaceVariablesHelper(name, replaceVariables);
  });

  /**
   * Variable value
   */
  handlebars.registerHelper('variableValue', (name: string) => {
    return replaceVariables(`${name}`);
  });

  /**
   * Handlebars
   */
  const template = handlebars.compile(content);
  const contentResult = template(data);

  /**
   * Skip sanitizing if disabled in Grafana
   */
  if (config.disableSanitizeHtml) {
    return {
      html: contentResult,
    };
  }

  /**
   * Return sanitized HTML
   */
  return {
    html: textUtil.sanitize(contentResult),
  };
};
