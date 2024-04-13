const { override, addWebpackAlias, addWebpackResolve } = require('customize-cra');
const path = require('path');

module.exports = override(
    addWebpackAlias({
        ['@components']: path.resolve(__dirname, 'src/components')
    }),
  addWebpackResolve({
    fallback: {
      buffer: require.resolve('buffer/')
    }
  })
);