const release  = require("./schemas/release.json");
const releaseP = require("./schemas/release-package.json");
const recordP  = require("./schemas/record-package.json");

const RELEASE  = "release";
const RELEASEP = "release package";
const RECORDP  = "record Package";

exports.ocdsSchemas = {
  release,
  releaseP,
  recordP
}

exports.jsonType = file => {
  if(typeof file !== "object" || file === null) return null;
  if(file.releases) return RELEASEP;
  if(file.records) return RECORDP;
  if(file.ocid) return RELEASE;
  return null;
}

exports.createOCDSHelper = ocds => {
  console.log("schemas:", this.ocdsSchemas);
  return {
    ocds,
    type : this.jsonType(ocds),
    schemas : this.ocdsSchemas
  }
}

