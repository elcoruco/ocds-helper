// REQUIRE THE MAIN LIBRARY
const readOCDS   = require("./index");

// REQUIRE THE OCDS FILES
const ocdsSECOP  = require("./test/ocds/secop-release_1.json");
const ocdsINAI   = require("./test/ocds/inai-record-package_1.json");
const ocdsSIAFI2 = require("./test/ocds/ocds-lcuori-P2020-60-1-5136_honduras.json");
const MSPBS      = require("./test/ocds/ocds-03ad3f-202300-1_paraguay.json");


// TEST the getData functionality
test('access ocid from SECOP (Colombia) release with getData', () => {
  const helper = readOCDS(ocdsSECOP)
  expect( helper.getData("ocid") ).toBe('ocds-k50g02-CO1.BDOS.530558')
})

test('access ocid from INAI (Mexico) record package with getData', () => {
  const helper = readOCDS(ocdsINAI)
  expect( helper.getData("ocid") ).toBe('ocds-g4facg-LA-006HHE001-E111-2017')
})

test('access ocid from SIAFI2 (Honduras) record with getData', () => {
  const helper = readOCDS(ocdsSIAFI2)
  expect( helper.getData("ocid") ).toBe('ocds-lcuori-P2020-60-1-5136')
})

test('access ocid from MSPBS (Paraguay) non standard json with getData', () => {
  const helper = readOCDS(MSPBS)
  expect( helper.getData("ocid") ).toBe('ocds-03ad3f-202300-1')
})


// TEST the ocds type function
test('check the ocds type from MSPBS (Paraguay)', () => {
  const helper = readOCDS(MSPBS)
  expect( helper.type ).toBe('record')
})