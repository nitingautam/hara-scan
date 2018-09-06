const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: ['babel-polyfill', "./handler.js"],
  target: "node",
  output: {
    filename: "bundle.js"
  },
  // Generate sourcemaps for proper error messages
  devtool: 'source-map',
  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: [nodeExternals()],
  mode: process.env.IS_DEV ? "development" : "production",
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
  performance: {
    // Turn off size warnings for entry points
    hints: false
  },
  // Run babel on all .js files and skip those in node_modules
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: __dirname,
        exclude: /node_modules/
      }
    ]
  }
};