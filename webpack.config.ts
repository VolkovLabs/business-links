// webpack.config.ts
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import grafanaConfig from './.config/webpack/webpack.config';

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

/**
 * Config
 */
const config = async (env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    output: {
      asyncChunks: true,
    },
    resolve: {
      alias: {
        handlebars: 'handlebars/dist/handlebars.js',
      },
      fallback: {
        fs: false,
        util: false,
      },
      plugins: [new TsconfigPathsPlugin()],
    },
  });
};

export default config;
