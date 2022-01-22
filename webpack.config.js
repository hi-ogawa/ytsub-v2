const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ReactRefreshTypeScript = require("react-refresh-typescript");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const MODE = process.env.WEBPACK_MODE ?? "development";
const PRODUCTION = MODE === "production";

module.exports = {
  mode: MODE,
  devtool: "inline-source-map",
  entry: {
    index: "./src/index.ts",
  },
  output: {
    filename: "[name].[fullhash].js",
    path: path.resolve(__dirname, "build", "webpack", MODE),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, "src")],
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: PRODUCTION ? [] : [ReactRefreshTypeScript()],
              }),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html", publicPath: "/" }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/assets/icon-*.png",
          to: "[name][ext]",
        },
      ],
    }),
    ...(PRODUCTION ? [] : [new ReactRefreshWebpackPlugin()]),
  ],
  devServer: {
    historyApiFallback: true,
    hot: true,
  },
};
