// Set options as a parameter, environment variable, or rc file.
// esm module allows seamless use of ES6 module syntax in node.js
/* eslint-disable-next-line no-global-assign */
require = require("esm")(module /*, options*/);
module.exports = require("./app.js");
