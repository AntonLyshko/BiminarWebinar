const path = require("path");

module.exports = {
  paths: function(paths, env) {
    paths.appBuild = path.resolve(paths.appPath, "dist"); // TODO: remove next version and support ci
    return paths;
  },
}
