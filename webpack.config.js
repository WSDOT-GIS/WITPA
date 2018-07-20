const path = require("path");

/**
 * Creates the config for file and sets appropriate library target.
 * @param {string} entry - Relative file path to entry file.
 */
function createConfig(entry) {
  const isWorker = /worker/i.test(entry);
  const libraryTarget = isWorker ? undefined : "amd";
  const target = isWorker ? "webworker" : "web";
  const name = entry.match(/(\w+).js$/)[1];
  return {
    target,
    mode: "production",
    devtool: "source-map",
    entry,
    resolve: {
      extensions: [".js", ".json"]
    },
    output: {
      filename: `${name}.js`,
      path: path.resolve(__dirname, "dist"),
      libraryTarget
    },
    externals: /^((esri)|(dojo)|(dijit))\b.+/
  }
}

module.exports = ["./dist/browser/browser/main.js","./dist/worker/worker/QueryWorker.js"].map(createConfig);

// module.exports = {
//   mode: "production",
//   devtool: "source-map",
//   entry: {
//     main: "./dist/browser/main.js",
//     QueryWorker: "./dist/worker/worker/QueryWorker.js"
//   },
//   resolve: {
//     extensions: [".js", ".json"]
//   },
//   output: {
//     filename: "[name].js",
//     path: path.resolve(__dirname, "dist"),
//     libraryTarget: "amd"
//   },
//   externals: /^((esri)|(dojo)|(dijit))\b.+/
// };