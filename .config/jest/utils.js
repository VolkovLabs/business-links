/*
 * ⚠️⚠️⚠️ THIS FILE WAS SCAFFOLDED BY `@grafana/create-plugin`. DO NOT EDIT THIS FILE DIRECTLY. ⚠️⚠️⚠️
 *
 * In order to extend the configuration follow the steps in .config/README.md
 */

/*
 * This utility function is useful in combination with jest `transformIgnorePatterns` config
 * to transform specific packages (e.g.ES modules) in a projects node_modules folder.
 */
const nodeModulesToTransform = (moduleNames) => `node_modules\/(?!.*(${moduleNames.join('|')})\/.*)`;

// Array of known nested grafana package dependencies that only bundle an ESM version
const grafanaESModules = [
  '.pnpm', // Support using pnpm symlinked packages
  '@grafana/schema',
  '@grafana/llm',
  '@modelcontextprotocol/sdk',
  'pkce-challenge',
  'eventsource',
  'eventsource-parser',
  'd3',
  'd3-color',
  'd3-force',
  'd3-interpolate',
  'd3-scale-chromatic',
  'ol',
  'react-colorful',
  'react-calendar',
  'rxjs',
  'uuid',
  'marked',
  'mimic-function',
  'get-user-locale',
  'memoize',
  '@wojtekmaj',
];

module.exports = {
  nodeModulesToTransform,
  grafanaESModules,
};
