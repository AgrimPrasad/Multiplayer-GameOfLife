// Set options as a parameter, environment variable, or rc file.
// esm module allows seamless use of ES6 module syntax in node.js
require = require("esm")(module /*, options*/);
module.exports = require("./app.js");
