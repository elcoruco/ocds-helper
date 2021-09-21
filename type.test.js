// REQUIRE THE MAIN LIBRARY
const readOCDS   = require("./index");

// REQUIRE THE OCDS FILES
const ocdsSECOP  = require("./test/ocds/secop-release_1.json");
const ocdsINAI   = require("./test/ocds/inai-record-package_1.json");
const ocdsSIAFI2 = require("./test/ocds/ocds-lcuori-P2020-60-1-5136_honduras.json");
const MSPBS      = require("./test/ocds/ocds-03ad3f-202300-1_paraguay.json");
const SERCOP     = require("./test/ocds/ecuador-release-package.json");
const SERCOP2    = require("./test/ocds/ecuador-record-package-1.json");
const ocdsFAIL   = {}



// TEST the ocds type function
test('check the ocds type from SECOP (Colombia): release', () => {
  const helper = readOCDS(ocdsSECOP)
  expect( helper.type ).toBe(helper.constants.types.RELEASE)
})

test('check the ocds type from INAI (Mexico): Record package', () => {
  const helper = readOCDS(ocdsINAI)
  expect( helper.type ).toBe(helper.constants.types.RECORDP)
})

test('check the ocds type from ocdsSIAFI2 (Honduras): Record', () => {
  const helper = readOCDS(ocdsSIAFI2)
  expect( helper.type ).toBe(helper.constants.types.RECORD)
})

test('check the ocds type from MSPBS (Paraguay): Record', () => {
  const helper = readOCDS(MSPBS)
  expect( helper.type ).toBe(helper.constants.types.RECORD)
})

test('check the ocds type from invalid format: null', () => {
  const helper = readOCDS(ocdsFAIL)
  expect( helper.type ).toBe(helper.constants.types.FAIL)
})

test('check the ocds type from SERCOP (Ecuador): Release Package', () => {
  const helper = readOCDS(SERCOP)
  expect( helper.type ).toBe(helper.constants.types.RELEASEP)
})

test('check the ocds type from SERCOP (Ecuador): Record Package', () => {
  const helper = readOCDS(SERCOP2)
  expect( helper.type ).toBe(helper.constants.types.RECORDP)
})
