// Lance un test avec le navigateur Edge de Windows au lieu du Chromium de Playwright.
// Utile quand Chromium n'est pas (encore) téléchargé. Usage : node tests/with-edge.js tests/robot.js
const pw = require("playwright");
const launch = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = (opts = {}) => launch({ channel: "msedge", ...opts });
require(require("path").resolve(process.argv[2]));
