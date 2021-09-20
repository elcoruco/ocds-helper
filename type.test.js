// REQUIRE THE MAIN LIBRARY
const readOCDS   = require("./index");

// REQUIRE THE OCDS FILES
const ocdsSECOP  = require("./test/ocds/secop-release_1.json");
const ocdsINAI   = require("./test/ocds/inai-record-package_1.json");
const ocdsSIAFI2 = require("./test/ocds/ocds-lcuori-P2020-60-1-5136_honduras.json");
const MSPBS      = require("./test/ocds/ocds-03ad3f-202300-1_paraguay.json");
const SERCOP     = require("./test/ocds/ecuador-release-package.json");
const ocdsFAIL   = {}



// TEST the ocds type function
test('check the ocds type from SECOP (Colombia)', () => {
  const helper = readOCDS(ocdsSECOP)
  expect( helper.type ).toBe('release')
})

test('check the ocds type from INAI (Mexico)', () => {
  const helper = readOCDS(ocdsINAI)
  expect( helper.type ).toBe('record Package')
})

test('check the ocds type from ocdsSIAFI2 (Honduras)', () => {
  const helper = readOCDS(ocdsSIAFI2)
  expect( helper.type ).toBe('record')
})

test('check the ocds type from MSPBS (Paraguay)', () => {
  const helper = readOCDS(MSPBS)
  expect( helper.type ).toBe('record')
})

test('check the ocds type from invalid format (must be null)', () => {
  const helper = readOCDS(ocdsFAIL)
  expect( helper.type ).toBe(null)
})

test('check the ocds type from SERCOP (Ecuador)', () => {
  const helper = readOCDS(SERCOP)
  expect( helper.type ).toBe('release package')
})
