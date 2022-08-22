const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
    ],
    resolve: {
      // configuration options
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: false
      }
    }
  }
})
