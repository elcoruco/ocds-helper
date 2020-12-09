const readOCDS = require("../index");
const axios    = require("axios");

//const helper = readOCDS.createOCDSHelper({ocid : 12});

// test secop release 1
axios.get("/ocds/secop-release_1.json").then(res => {
  const helper = readOCDS(res.data)
  console.log("secop:", helper, helper.ocds);
  console.log("secop planning amount:", helper.getStateAmount(helper.constants.states.PLANNING) )
  console.log("secop tender amount:", helper.getStateAmount(helper.constants.states.TENDER) )
  console.log("secop award amount:", helper.getStateAmount(helper.constants.states.AWARD) )
  console.log("secop contract amount:", helper.getStateAmount(helper.constants.states.CONTRACT) )
  console.log("secop implementation amount:", helper.getStateAmount(helper.constants.states.IMPLEMENTATION) )

});


// test inai record package 1
axios.get("/ocds/inai-record-package_1.json").then(res => {
  let helper = readOCDS(res.data)
  console.log("inai:", helper, helper.ocds);
  console.log("inai planning amount:", helper.getStateAmount(helper.constants.states.PLANNING) )
  console.log("inai tender amount:", helper.getStateAmount(helper.constants.states.TENDER) )
  console.log("inai award amount:", helper.getStateAmount(helper.constants.states.AWARD) )
  console.log("inai contract amount:", helper.getStateAmount(helper.constants.states.CONTRACT) )
  console.log("inai implementation amount:", helper.getStateAmount(helper.constants.states.IMPLEMENTATION) )
  console.log("inai buyer", helper.getData("parties", {type : "contains", field : "roles", value : "supplier"}) );
});


// test shcp record package 1
// axios.get("/ocds/shcp-record-package_1.json").then(res => {
//   const helper = readOCDS(res.data);
//   console.log("shcp:", helper, helper.ocds);
//   console.log("shcp:", helper, helper.ocds);
//   console.log("shcp planning amount:", helper.getStateAmount(helper.constants.states.PLANNING) )
//   console.log("shcp tender amount:", helper.getStateAmount(helper.constants.states.TENDER) )
//   console.log("shcp award amount:", helper.getStateAmount(helper.constants.states.AWARD) )
//   console.log("shcp contract amount:", helper.getStateAmount(helper.constants.states.CONTRACT) )
//   console.log("shcp implementation amount:", helper.getStateAmount(helper.constants.states.IMPLEMENTATION) )
// });

// test paraguay record 1
axios.get("/ocds/ocds-03ad3f-202300-1_paraguay.json").then(res => {
  const helper = readOCDS(res.data);
  console.log("paraguay:", helper, helper.ocds);
  console.log("paraguay planning amount:", helper.getStateAmount(helper.constants.states.PLANNING) )
  console.log("paraguay tender amount:", helper.getStateAmount(helper.constants.states.TENDER) )
  console.log("paraguay award amount:", helper.getStateAmount(helper.constants.states.AWARD) )
  console.log("paraguay contract amount:", helper.getStateAmount(helper.constants.states.CONTRACT) )
  console.log("paraguay implementation amount:", helper.getStateAmount(helper.constants.states.IMPLEMENTATION) )
});

// test honduras record 1
axios.get("/ocds/ocds-lcuori-P2020-60-1-5136_honduras.json").then(res => {
  const helper = readOCDS(res.data);
  console.log("honduras:", helper, helper.ocds);
  console.log("honduras planning amount:", helper.getStateAmount(helper.constants.states.PLANNING) )
  console.log("honduras tender amount:", helper.getStateAmount(helper.constants.states.TENDER) )
  console.log("honduras award amount:", helper.getStateAmount(helper.constants.states.AWARD) )
  console.log("honduras contract amount:", helper.getStateAmount(helper.constants.states.CONTRACT) )
  console.log("honduras implementation amount:", helper.getStateAmount(helper.constants.states.IMPLEMENTATION) )
});
