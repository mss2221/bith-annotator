const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
    ],
    resolve: {
      // configuration options
      fallback: {
        path: false,
        fs: false,
        crypto: require.resolve('crypto-browserify'),
        stream: false
      }
    }
  }
})
