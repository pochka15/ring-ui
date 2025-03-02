const path = require('path');

const webpack = require('webpack');

const ringConfig = require('../webpack.config').createConfig();
const pkgConfig = require('../package.json').config;

module.exports = {
  stories: [
    // Make welcome stories default
    '../src/welcome.examples.js',
    '../src/**/*.examples.{js,ts,tsx}'
  ],
  presets: [require.resolve('./custom-header/header-preset')],
  addons: [
    '@storybook/addon-storysource',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    'storybook-zeplin/register'
  ],
  core: {
    builder: 'webpack5'
  },
  webpackFinal(config) {
    ringConfig.componentsPath.push(
      __dirname,
      path.resolve(__dirname, '../src')
    );
    ringConfig.loaders.babelLoader.options.plugins = [[
      'babel-plugin-react-docgen',
      {
        DOC_GEN_COLLECTION_NAME: 'STORYBOOK_REACT_CLASSES'
      }
    ]];

    config.module.rules = [
      ...ringConfig.config.module.rules,
      config.module.rules.find(rule =>
        rule.include instanceof RegExp &&
        rule.include.test('node_modules/acorn-jsx')),
      {
        test: /\.md$/,
        loader: 'raw-loader'
      },
      {
        test: /\.examples\.[jt]sx?$/,
        loader: require.resolve('@storybook/source-loader'),
        enforce: 'pre'
      },
      {
        test: /\.svg$/,
        loader: require.resolve('svg-inline-loader'),
        options: {removeSVGTagAttrs: false},
        include: [/@primer\/octicons/, /@jetbrains\/logos/]
      }
    ];

    const serverUri = pkgConfig.hub;
    const clientId = pkgConfig.clientId;
    const hubConfig = JSON.stringify({serverUri, clientId});

    config.plugins.push(new webpack.DefinePlugin({hubConfig}));

    return config;
  }
};
