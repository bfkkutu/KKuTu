const path = require("path");
const fs = require("fs");

const pages = fs.readdirSync(path.resolve(__dirname, "Web/front/@page"));

module.exports = {
  cache: true,
  name: "front",
  target: "web",
  mode: "production",
  devtool: "inline-source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      front: path.resolve(__dirname, "Web/front"),
    },
  },
  entry: pages.reduce((acc, page) => {
    acc[page.substring(0, page.length - 4)] = `./Web/front/@page/${page}`;
    return acc;
  }, {}),
  output: {
    path: path.join(__dirname, "Web/public/pages"),
    filename: "[name].js",
  },
  externals: {
    cluster: {},
    crypto: {},
    fs: {},
    path: {},
    process: {},

    highlightjs: "hljs",
    "msgpack-lite": "msgpack",
    react: "React",
    "react-dom": "ReactDOM",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        use: [
          {
            loader: "ts-loader",
            options: {
              happyPackMode: true,
            },
          },
        ],
      },
    ],
  },
};
