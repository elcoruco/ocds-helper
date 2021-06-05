const readOCDS = require("../index");
// REQUIRE THE OCDS FILES
const ocdsSECOP  = require("./ocds/secop-release_1.json");
const ocdsINAI   = require("./ocds/inai-record-package_1.json");
const ocdsSHCP   = require("./ocds/shcp-record-package_1.json");
const ocdsSIAFI2 = require("./ocds/ocds-lcuori-P2020-60-1-5136_honduras.json");
const ocdsMSPBS  = require("./ocds/ocds-03ad3f-202300-1_paraguay.json");

//const helper = readOCDS.createOCDSHelper({ocid : 12});
// I'm using beefy index.js:build.js  --live

// test secop release 1
  const helperSECOP = readOCDS(ocdsSECOP)
  console.log("secop:", helperSECOP, helperSECOP.ocds);
  console.log("secop planning amount:", helperSECOP.getStateAmount(helperSECOP.constants.states.PLANNING) )
  console.log("secop tender amount:", helperSECOP.getStateAmount(helperSECOP.constants.states.TENDER) )
  console.log("secop award amount:", helperSECOP.getStateAmount(helperSECOP.constants.states.AWARD) )
  console.log("secop contract amount:", helperSECOP.getStateAmount(helperSECOP.constants.states.CONTRACT) )
  console.log("secop implementation amount:", helperSECOP.getStateAmount(helperSECOP.constants.states.IMPLEMENTATION) )
  console.log("secop contract has supplier:", helperSECOP.indices.hasSupplier() )
  console.log("secop contract has items:", helperSECOP.indices.hasItems() )
  console.log("secop contract was competitive:", helperSECOP.indices.isCompetitive() )
  console.log("secop contract / award difference:", helperSECOP.indices.awardContractDiff() )
  console.log("secop tender days:", helperSECOP.indices.tenderPeriodDays() )


// test inai record package 1

  let helperINAI = readOCDS(ocdsINAI)
  console.log("inai:", helperINAI, helperINAI.ocds);
  console.log("inai planning amount:", helperINAI.getStateAmount(helperINAI.constants.states.PLANNING) )
  console.log("inai tender amount:", helperINAI.getStateAmount(helperINAI.constants.states.TENDER) )
  console.log("inai award amount:", helperINAI.getStateAmount(helperINAI.constants.states.AWARD) )
  console.log("inai contract amount:", helperINAI.getStateAmount(helperINAI.constants.states.CONTRACT) )
  console.log("inai implementation amount:", helperINAI.getStateAmount(helperINAI.constants.states.IMPLEMENTATION) )
  console.log("inai buyer", helperINAI.getData("parties", {type : "contains", field : "roles", value : "supplier"}) );
  console.log("inai contract has supplier:", helperINAI.indices.hasSupplier() )
  console.log("inai contract has items:", helperINAI.indices.hasItems() )
  console.log("inai contract was competitive:", helperINAI.indices.isCompetitive() )
  console.log("inai contract / award difference:", helperINAI.indices.awardContractDiff() )
  console.log("inai tender days:", helperINAI.indices.tenderPeriodDays() )



// test shcp record package 1
  const helperSHCP = readOCDS(ocdsSHCP);
  console.log("shcp:", helperSHCP, helperSHCP.ocds);
  console.log("shcp:", helperSHCP, helperSHCP.ocds);
  console.log("shcp planning amount:", helperSHCP.getStateAmount(helperSHCP.constants.states.PLANNING) )
  console.log("shcp tender amount:", helperSHCP.getStateAmount(helperSHCP.constants.states.TENDER) )
  console.log("shcp award amount:", helperSHCP.getStateAmount(helperSHCP.constants.states.AWARD) )
  console.log("shcp contract amount:", helperSHCP.getStateAmount(helperSHCP.constants.states.CONTRACT) )
  console.log("shcp implementation amount:", helperSHCP.getStateAmount(helperSHCP.constants.states.IMPLEMENTATION) )

// test paraguay record 1
  const helperMSPBS = readOCDS(ocdsMSPBS);
  console.log("paraguay:", helperMSPBS, helperMSPBS.ocds);
  console.log("paraguay planning amount:", helperMSPBS.getStateAmount(helperMSPBS.constants.states.PLANNING) )
  console.log("paraguay tender amount:", helperMSPBS.getStateAmount(helperMSPBS.constants.states.TENDER) )
  console.log("paraguay award amount:", helperMSPBS.getStateAmount(helperMSPBS.constants.states.AWARD) )
  console.log("paraguay contract amount:", helperMSPBS.getStateAmount(helperMSPBS.constants.states.CONTRACT) )
  console.log("paraguay implementation amount:", helperMSPBS.getStateAmount(helperMSPBS.constants.states.IMPLEMENTATION) )
  console.log("paraguay contract has supplier:", helperMSPBS.indices.hasSupplier() )
  console.log("paraguay contract has items:", helperMSPBS.indices.hasItems() )
  console.log("paraguay contract was competitive:", helperMSPBS.indices.isCompetitive() )
  console.log("paraguay contract / award difference:", helperMSPBS.indices.awardContractDiff() )
  console.log("paraguay tender days:", helperMSPBS.indices.tenderPeriodDays() )

// test honduras record 1
  const helperSIAFI = readOCDS(ocdsSIAFI2);
  console.log("honduras:", helperSIAFI, helperSIAFI.ocds);
  console.log("honduras planning amount:", helperSIAFI.getStateAmount(helperSIAFI.constants.states.PLANNING) )
  console.log("honduras tender amount:", helperSIAFI.getStateAmount(helperSIAFI.constants.states.TENDER) )
  console.log("honduras award amount:", helperSIAFI.getStateAmount(helperSIAFI.constants.states.AWARD) )
  console.log("honduras contract amount:", helperSIAFI.getStateAmount(helperSIAFI.constants.states.CONTRACT) )
  console.log("honduras implementation amount:", helperSIAFI.getStateAmount(helperSIAFI.constants.states.IMPLEMENTATION) )
  console.log("honduras contract has supplier:", helperSIAFI.indices.hasSupplier() )
  console.log("honduras contract has items:", helperSIAFI.indices.hasItems() )
  console.log("honduras contract was competitive:", helperSIAFI.indices.isCompetitive() )
  console.log("honduras contract / award difference:", helperSIAFI.indices.awardContractDiff() )
  console.log("honduras tender days:", helperSIAFI.indices.tenderPeriodDays() )
