const release  = require("./schemas/release.json");
const releaseP = require("./schemas/release-package.json");
const recordP  = require("./schemas/record-package.json");
console.log(release, releaseP, recordP, "alv");
exports.ocdsSchemas = {
  release,
  releaseP,
  recordP
}