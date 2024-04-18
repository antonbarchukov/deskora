const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    hot: true
  },
  transpileDependencies: true,
})
