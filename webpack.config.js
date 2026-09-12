//@ts-check

'use strict';

const path = require('path');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code 扩展运行在 Node.js 环境中 📖 -> https://webpack.js.org/configuration/node/
	mode: 'none', // 让源码尽可能保持原样（打包时我们会将其设为 'production'）

  entry: './src/extension.ts', // 本扩展的入口点，📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // 打包产物存放在 'dist' 文件夹中（参见 package.json），📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // vscode 模块是动态生成的，必须排除，不能被 webpack 打包。其他无法打包的模块也请添加在这里，📖 -> https://webpack.js.org/configuration/externals/
    // 添加在这里的模块也需要同步添加到 .vscodeignore 文件中
  },
  resolve: {
    // 支持读取 TypeScript 和 JavaScript 文件，📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // 启用问题匹配器（problem matchers）所需的日志
  },
};
module.exports = [ extensionConfig ];