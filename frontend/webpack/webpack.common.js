const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const webpack = require("webpack");
require("dotenv").config();

const BUILD_DIR = path.resolve(__dirname, "../build");
const SRC_DIR = path.resolve(__dirname, "../src");

module.exports = {
  entry: path.join(SRC_DIR, "index.tsx"),
  output: {
    path: BUILD_DIR,
    filename: "[contenthash].bundle.js",
    publicPath: "/",
    clean: true,
  },
  resolve: {
    mainFields: ["browser", "main", "module"],
    extensions: [".ts", ".tsx", ".js", ".json"],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[hash][ext][query]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(__dirname, "../public/index.html"),
    }),
    new ESLintPlugin({
      extensions: ["ts", "tsx", "js"],
      emitWarning: true,
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "../public"),
    },
    hot: true,
    historyApiFallback: true,
    host: "0.0.0.0",
    port: 3000,
    open: true,
    client: {
      overlay: true,
      progress: true,
    },
  },
};
