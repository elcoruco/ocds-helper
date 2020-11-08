const readOCDS = require("../index");
const axios    = require("axios");

//const helper = readOCDS.createOCDSHelper({ocid : 12});


// test secop release 1
axios.get("/ocds/secop-release_1.json").then(res => {
  const helper = readOCDS.createOCDSHelper(res.data)
  console.log("secop:", helper.getData("awards.description"), helper.getData("planning.budget.amount"),  helper.ocds);

});


// test inai record package 1
axios.get("/ocds/inai-record-package_1.json").then(res => {
  let helper = readOCDS.createOCDSHelper(res.data)
  console.log("inai:", helper.ocds);
});


// test shcp record package 1
axios.get("/ocds/shcp-record-package_1.json").then(res => {
  const helper = readOCDS.createOCDSHelper(res.data);
  console.log("shcp:", helper.ocds);
});
