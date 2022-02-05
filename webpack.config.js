const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const MODE = process.env.WEBPACK_MODE ?? "development";
const PRODUCTION = MODE === "production";

/** @type {import("webpack").Configuration} */
module.exports = {
  mode: MODE,
  devtool: "inline-source-map",
  entry: {
    index: {
      import: "./src/index.ts",
      dependOn: "split"
    },
    serviceWorker: {
      import: "./src/service-worker/index.ts",
      filename: "service-worker.js",
    },
    split: {
      import: [
        "react",
        "react-dom",
        "react-router-dom",
        "@mui/material",
        "@emotion/react",
        "@emotion/styled",
        "./src/utils/demo-entries.ts"
      ],
    }
  },
  output: {
    filename: "[name].[fullhash].js",
    path: path.resolve(__dirname, "build", "webpack", MODE),
  },
  optimization: {
    runtimeChunk: 'single',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, "src")],
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: PRODUCTION ? [] : ["react-refresh/babel"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["tailwindcss"],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      publicPath: "/",
      excludeChunks: ["serviceWorker"],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/assets/icon-*.png",
          to: "[name][ext]",
        },
        {
          from: "src/assets/manifest.json",
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
