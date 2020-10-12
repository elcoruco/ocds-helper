(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const release = require("./release.json");
console.log(release);
exports.readOCDS = () => {
  release
}
},{"./release.json":2}],2:[function(require,module,exports){
module.exports={
  "id": "https://standard.open-contracting.org/schema/1__1__5/release-schema.json",
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Schema for an Open Contracting Release",
  "description": "Each release provides data about a single contracting process at a particular point in time. Releases can be used to notify users of new tenders, awards, contracts and other updates. Releases may repeat or update information provided previously in this contracting process. One contracting process may have many releases. A 'record' of a contracting process follows the same structure as a release, but combines information from multiple points in time into a single summary.",
  "type": "object",
  "properties": {
    "ocid": {
      "title": "Open Contracting ID",
      "description": "A globally unique identifier for this Open Contracting Process. Composed of an ocid prefix and an identifier for the contracting process. For more information see the [Open Contracting Identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/)",
      "type": "string",
      "minLength": 1
    },
    "id": {
      "title": "Release ID",
      "description": "An identifier for this particular release of information. A release identifier must be unique within the scope of its related contracting process (defined by a common ocid). A release identifier must not contain the # character.",
      "type": "string",
      "minLength": 1,
      "omitWhenMerged": true
    },
    "date": {
      "title": "Release Date",
      "description": "The date on which the information contained in the release was first recorded in, or published by, any system.",
      "type": "string",
      "format": "date-time",
      "omitWhenMerged": true
    },
    "tag": {
      "title": "Release Tag",
      "description": "One or more values from the closed [releaseTag](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#release-tag) codelist. Tags can be used to filter releases and to understand the kind of information that releases might contain.",
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "planning",
          "planningUpdate",
          "tender",
          "tenderAmendment",
          "tenderUpdate",
          "tenderCancellation",
          "award",
          "awardUpdate",
          "awardCancellation",
          "contract",
          "contractUpdate",
          "contractAmendment",
          "implementation",
          "implementationUpdate",
          "contractTermination",
          "compiled"
        ]
      },
      "codelist": "releaseTag.csv",
      "openCodelist": false,
      "minItems": 1,
      "omitWhenMerged": true
    },
    "initiationType": {
      "title": "Initiation type",
      "description": "The type of initiation process used for this contract, from the closed [initiationType](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#initiation-type) codelist.",
      "type": "string",
      "enum": [
        "tender"
      ],
      "codelist": "initiationType.csv",
      "openCodelist": false
    },
    "parties": {
      "title": "Parties",
      "description": "Information on the parties (organizations, economic operators and other participants) who are involved in the contracting process and their roles, e.g. buyer, procuring entity, supplier etc. Organization references elsewhere in the schema are used to refer back to this entries in this list.",
      "type": "array",
      "items": {
        "$ref": "#/definitions/Organization"
      },
      "uniqueItems": true
    },
    "buyer": {
      "title": "Buyer",
      "description": "A buyer is an entity whose budget will be used to pay for goods, works or services related to a contract. This may be different from the procuring entity who may be specified in the tender data.",
      "$ref": "#/definitions/OrganizationReference"
    },
    "planning": {
      "title": "Planning",
      "description": "Information from the planning phase of the contracting process. This includes information related to the process of deciding what to contract, when and how.",
      "$ref": "#/definitions/Planning"
    },
    "tender": {
      "title": "Tender",
      "description": "The activities undertaken in order to enter into a contract.",
      "$ref": "#/definitions/Tender"
    },
    "awards": {
      "title": "Awards",
      "description": "Information from the award phase of the contracting process. There can be more than one award per contracting process e.g. because the contract is split among different providers, or because it is a standing offer.",
      "type": "array",
      "items": {
        "$ref": "#/definitions/Award"
      },
      "uniqueItems": true
    },
    "contracts": {
      "title": "Contracts",
      "description": "Information from the contract creation phase of the procurement process.",
      "type": "array",
      "items": {
        "$ref": "#/definitions/Contract"
      },
      "uniqueItems": true
    },
    "language": {
      "title": "Release language",
      "description": "The default language of the data using either two-letter [ISO639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes), or extended [BCP47 language tags](http://www.w3.org/International/articles/language-tags/). The use of lowercase two-letter codes from [ISO639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) is recommended.",
      "type": [
        "string",
        "null"
      ],
      "default": "en"
    },
    "relatedProcesses": {
      "uniqueItems": true,
      "items": {
        "$ref": "#/definitions/RelatedProcess"
      },
      "description": "The details of related processes: for example, if this process follows on from one or more other processes, represented under a separate open contracting identifier (ocid). This is commonly used to relate mini-competitions to their parent frameworks or individual tenders to a broader planning process.",
      "title": "Related processes",
      "type": "array"
    }
  },
  "required": [
    "ocid",
    "id",
    "date",
    "tag",
    "initiationType"
  ],
  "definitions": {
    "Planning": {
      "title": "Planning",
      "description": "Information from the planning phase of the contracting process. Note that many other fields can be filled in a planning release, in the appropriate fields in other schema sections; these would likely be estimates at this stage, e.g. value in tender.",
      "type": "object",
      "properties": {
        "rationale": {
          "title": "Rationale",
          "description": "The rationale for the procurement provided in free text. More detail can be provided in an attached document.",
          "type": [
            "string",
            "null"
          ]
        },
        "budget": {
          "title": "Budget",
          "description": "Details of the budget that funds this contracting process.",
          "$ref": "#/definitions/Budget"
        },
        "documents": {
          "title": "Documents",
          "description": "A list of documents related to the planning process.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          }
        },
        "milestones": {
          "title": "Planning milestones",
          "description": "A list of milestones associated with the planning stage.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Milestone"
          }
        }
      },
      "patternProperties": {
        "^(rationale_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Tender": {
      "title": "Tender",
      "description": "Data regarding tender process - publicly inviting prospective contractors to submit bids for evaluation and selecting a winner or winners.",
      "type": "object",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "Tender ID",
          "description": "An identifier for this tender process. This may be the same as the ocid, or may be an internal identifier for this tender.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1,
          "versionId": true
        },
        "title": {
          "title": "Tender title",
          "description": "A title for this tender. This will often be used by applications as a headline to attract interest, and to help analysts understand the nature of this procurement.",
          "type": [
            "string",
            "null"
          ]
        },
        "description": {
          "title": "Tender description",
          "description": "A summary description of the tender. This complements any structured information provided using the items array. Descriptions should be short and easy to read. Avoid using ALL CAPS.",
          "type": [
            "string",
            "null"
          ]
        },
        "status": {
          "title": "Tender status",
          "description": "The current status of the tender, from the closed [tenderStatus](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#tender-status) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "tenderStatus.csv",
          "openCodelist": false,
          "enum": [
            "planning",
            "planned",
            "active",
            "cancelled",
            "unsuccessful",
            "complete",
            "withdrawn",
            null
          ]
        },
        "procuringEntity": {
          "title": "Procuring entity",
          "description": "The entity managing the procurement. This may be different from the buyer who pays for, or uses, the items being procured.",
          "$ref": "#/definitions/OrganizationReference"
        },
        "items": {
          "title": "Items to be procured",
          "description": "The goods and services to be purchased, broken into line items wherever possible. Items should not be duplicated, but the quantity specified instead.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Item"
          },
          "uniqueItems": true
        },
        "value": {
          "title": "Value",
          "description": "The total upper estimated value of the procurement. A negative value indicates that the contracting process may involve payments from the supplier to the buyer (commonly used in concession contracts).",
          "$ref": "#/definitions/Value"
        },
        "minValue": {
          "title": "Minimum value",
          "description": "The minimum estimated value of the procurement.  A negative value indicates that the contracting process may involve payments from the supplier to the buyer (commonly used in concession contracts).",
          "$ref": "#/definitions/Value"
        },
        "procurementMethod": {
          "title": "Procurement method",
          "description": "The procurement method, from the closed [method](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#method) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "method.csv",
          "openCodelist": false,
          "enum": [
            "open",
            "selective",
            "limited",
            "direct",
            null
          ]
        },
        "procurementMethodDetails": {
          "title": "Procurement method details",
          "description": "Additional detail on the procurement method used. This field can be used to provide the local name of the particular procurement method used.",
          "type": [
            "string",
            "null"
          ]
        },
        "procurementMethodRationale": {
          "title": "Procurement method rationale",
          "description": "Rationale for the chosen procurement method. This is especially important to provide a justification in the case of limited tenders or direct awards.",
          "type": [
            "string",
            "null"
          ]
        },
        "mainProcurementCategory": {
          "title": "Main procurement category",
          "description": "The primary category describing the main object of this contracting process, from the closed [procurementCategory](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#procurement-category) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "procurementCategory.csv",
          "openCodelist": false,
          "enum": [
            "goods",
            "works",
            "services",
            null
          ]
        },
        "additionalProcurementCategories": {
          "title": "Additional procurement categories",
          "description": "Any additional categories describing the objects of this contracting process, using the open [extendedProcurementCategory](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#extended-procurement-category) codelist.",
          "type": [
            "array",
            "null"
          ],
          "items": {
            "type": "string"
          },
          "codelist": "extendedProcurementCategory.csv",
          "openCodelist": true
        },
        "awardCriteria": {
          "title": "Award criteria",
          "description": "The award criteria for the procurement, using the open [awardCriteria](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#award-criteria) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "awardCriteria.csv",
          "openCodelist": true
        },
        "awardCriteriaDetails": {
          "title": "Award criteria details",
          "description": "Any detailed or further information on the award or selection criteria.",
          "type": [
            "string",
            "null"
          ]
        },
        "submissionMethod": {
          "title": "Submission method",
          "description": "The methods by which bids are submitted, using the open [submissionMethod](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#submission-method) codelist.",
          "type": [
            "array",
            "null"
          ],
          "items": {
            "type": "string"
          },
          "codelist": "submissionMethod.csv",
          "openCodelist": true
        },
        "submissionMethodDetails": {
          "title": "Submission method details",
          "description": "Any detailed or further information on the submission method. This can include the address, e-mail address or online service to which bids are submitted, and any special requirements to be followed for submissions.",
          "type": [
            "string",
            "null"
          ]
        },
        "tenderPeriod": {
          "title": "Tender period",
          "description": "The period when the tender is open for submissions. The end date is the closing date for tender submissions.",
          "$ref": "#/definitions/Period"
        },
        "enquiryPeriod": {
          "title": "Enquiry period",
          "description": "The period during which potential bidders may submit questions and requests for clarification to the entity managing procurement. Details of how to submit enquiries should be provided in attached notices, or in submissionMethodDetails. Structured dates for when responses to questions will be made can be provided using tender milestones.",
          "$ref": "#/definitions/Period"
        },
        "hasEnquiries": {
          "title": "Has enquiries?",
          "description": "A true/false field to indicate whether any enquiries were received during the tender process. Structured information on enquiries that were received, and responses to them, can be provided using the enquiries extension.",
          "type": [
            "boolean",
            "null"
          ]
        },
        "eligibilityCriteria": {
          "title": "Eligibility criteria",
          "description": "A description of any eligibility criteria for potential suppliers.",
          "type": [
            "string",
            "null"
          ]
        },
        "awardPeriod": {
          "title": "Evaluation and award period",
          "description": "The period for decision making regarding the contract award. The end date should be the date on which an award decision is due to be finalized. The start date may be used to indicate the start of an evaluation period.",
          "$ref": "#/definitions/Period"
        },
        "contractPeriod": {
          "description": "The period over which the contract is estimated or required to be active. If the tender does not specify explicit dates, the duration field may be used.",
          "title": "Contract period",
          "$ref": "#/definitions/Period"
        },
        "numberOfTenderers": {
          "title": "Number of tenderers",
          "description": "The number of parties who submit a bid.",
          "type": [
            "integer",
            "null"
          ]
        },
        "tenderers": {
          "title": "Tenderers",
          "description": "All parties who submit a bid on a tender. More detailed information on bids and the bidding organization can be provided using the bid extension.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/OrganizationReference"
          },
          "uniqueItems": true
        },
        "documents": {
          "title": "Documents",
          "description": "All documents and attachments related to the tender, including any notices. See the [documentType](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#document-type) codelist for details of potential documents to include. Common documents include official legal notices of tender, technical specifications, evaluation criteria, and, as a tender process progresses, clarifications and replies to queries.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          }
        },
        "milestones": {
          "title": "Milestones",
          "description": "A list of milestones associated with the tender.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Milestone"
          }
        },
        "amendments": {
          "description": "A tender amendment is a formal change to the tender, and generally involves the publication of a new tender notice/release. The rationale and a description of the changes made can be provided here.",
          "type": "array",
          "title": "Amendments",
          "items": {
            "$ref": "#/definitions/Amendment"
          }
        },
        "amendment": {
          "title": "Amendment",
          "description": "The use of individual amendment objects has been deprecated. From OCDS 1.1 information should be provided in the amendments array.",
          "$ref": "#/definitions/Amendment",
          "deprecated": {
            "description": "The single amendment object has been deprecated in favour of including amendments in an amendments (plural) array.",
            "deprecatedVersion": "1.1"
          }
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(procurementMethodRationale_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(awardCriteriaDetails_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(submissionMethodDetails_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(eligibilityCriteria_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Award": {
      "title": "Award",
      "description": "An award for the given procurement. There can be more than one award per contracting process e.g. because the contract is split among different providers, or because it is a standing offer.",
      "type": "object",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "Award ID",
          "description": "The identifier for this award. It must be unique and must not change within the Open Contracting Process it is part of (defined by a single ocid). See the [identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/) for further details.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "title": {
          "title": "Title",
          "description": "Award title",
          "type": [
            "string",
            "null"
          ]
        },
        "description": {
          "title": "Description",
          "description": "Award description",
          "type": [
            "string",
            "null"
          ]
        },
        "status": {
          "title": "Award status",
          "description": "The current status of the award, from the closed [awardStatus](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#award-status) codelist.",
          "type": [
            "string",
            "null"
          ],
          "enum": [
            "pending",
            "active",
            "cancelled",
            "unsuccessful",
            null
          ],
          "codelist": "awardStatus.csv",
          "openCodelist": false
        },
        "date": {
          "title": "Award date",
          "description": "The date of the contract award. This is usually the date on which a decision to award was made.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "value": {
          "title": "Value",
          "description": "The total value of this award. In the case of a framework contract this may be the total estimated lifetime value, or maximum value, of the agreement. There may be more than one award per procurement. A negative value indicates that the award may involve payments from the supplier to the buyer (commonly used in concession contracts).",
          "$ref": "#/definitions/Value"
        },
        "suppliers": {
          "title": "Suppliers",
          "description": "The suppliers awarded this award. If different suppliers have been awarded different items or values, these should be split into separate award blocks.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/OrganizationReference"
          },
          "uniqueItems": true
        },
        "items": {
          "title": "Items awarded",
          "description": "The goods and services awarded in this award, broken into line items wherever possible. Items should not be duplicated, but the quantity specified instead.",
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Item"
          },
          "uniqueItems": true
        },
        "contractPeriod": {
          "title": "Contract period",
          "description": "The period for which the contract has been awarded.",
          "$ref": "#/definitions/Period"
        },
        "documents": {
          "title": "Documents",
          "description": "All documents and attachments related to the award, including any notices.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          },
          "uniqueItems": true
        },
        "amendments": {
          "description": "An award amendment is a formal change to the details of the award, and generally involves the publication of a new award notice/release. The rationale and a description of the changes made can be provided here.",
          "type": "array",
          "title": "Amendments",
          "items": {
            "$ref": "#/definitions/Amendment"
          }
        },
        "amendment": {
          "title": "Amendment",
          "description": "The use of individual amendment objects has been deprecated. From OCDS 1.1 information should be provided in the amendments array.",
          "$ref": "#/definitions/Amendment",
          "deprecated": {
            "description": "The single amendment object has been deprecated in favour of including amendments in an amendments (plural) array.",
            "deprecatedVersion": "1.1"
          }
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Contract": {
      "type": "object",
      "title": "Contract",
      "description": "Information regarding the signed contract between the buyer and supplier(s).",
      "required": [
        "id",
        "awardID"
      ],
      "properties": {
        "id": {
          "title": "Contract ID",
          "description": "The identifier for this contract. It must be unique and must not change within the Open Contracting Process it is part of (defined by a single ocid). See the [identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/) for further details.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "awardID": {
          "title": "Award ID",
          "description": "The award.id against which this contract is being issued.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "title": {
          "title": "Contract title",
          "description": "Contract title",
          "type": [
            "string",
            "null"
          ]
        },
        "description": {
          "title": "Contract description",
          "description": "Contract description",
          "type": [
            "string",
            "null"
          ]
        },
        "status": {
          "title": "Contract status",
          "description": "The current status of the contract, from the closed [contractStatus](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#contract-status) codelist.",
          "type": [
            "string",
            "null"
          ],
          "enum": [
            "pending",
            "active",
            "cancelled",
            "terminated",
            null
          ],
          "codelist": "contractStatus.csv",
          "openCodelist": false
        },
        "period": {
          "title": "Period",
          "description": "The start and end date for the contract.",
          "$ref": "#/definitions/Period"
        },
        "value": {
          "title": "Value",
          "description": "The total value of this contract. A negative value indicates that the contract will involve payments from the supplier to the buyer (commonly used in concession contracts).",
          "$ref": "#/definitions/Value"
        },
        "items": {
          "title": "Items contracted",
          "description": "The goods, services, and any intangible outcomes in this contract. Note: If the items are the same as the award do not repeat.",
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Item"
          },
          "uniqueItems": true
        },
        "dateSigned": {
          "title": "Date signed",
          "description": "The date the contract was signed. In the case of multiple signatures, the date of the last signature.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "documents": {
          "title": "Documents",
          "description": "All documents and attachments related to the contract, including any notices.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          },
          "uniqueItems": true
        },
        "implementation": {
          "title": "Implementation",
          "description": "Information related to the implementation of the contract in accordance with the obligations laid out therein.",
          "$ref": "#/definitions/Implementation"
        },
        "relatedProcesses": {
          "uniqueItems": true,
          "items": {
            "$ref": "#/definitions/RelatedProcess"
          },
          "description": "The details of related processes: for example, if this process is followed by one or more contracting processes, represented under a separate open contracting identifier (ocid). This is commonly used to refer to subcontracts and to renewal or replacement processes for this contract.",
          "title": "Related processes",
          "type": "array"
        },
        "milestones": {
          "title": "Contract milestones",
          "description": "A list of milestones associated with the finalization of this contract.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Milestone"
          }
        },
        "amendments": {
          "description": "A contract amendment is a formal change to, or extension of, a contract, and generally involves the publication of a new contract notice/release, or some other documents detailing the change. The rationale and a description of the changes made can be provided here.",
          "type": "array",
          "title": "Amendments",
          "items": {
            "$ref": "#/definitions/Amendment"
          }
        },
        "amendment": {
          "title": "Amendment",
          "description": "The use of individual amendment objects has been deprecated. From OCDS 1.1 information should be provided in the amendments array.",
          "$ref": "#/definitions/Amendment",
          "deprecated": {
            "description": "The single amendment object has been deprecated in favour of including amendments in an amendments (plural) array.",
            "deprecatedVersion": "1.1"
          }
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Implementation": {
      "type": "object",
      "title": "Implementation",
      "description": "Information during the performance / implementation stage of the contract.",
      "properties": {
        "transactions": {
          "title": "Transactions",
          "description": "A list of the spending transactions made against this contract",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Transaction"
          },
          "uniqueItems": true
        },
        "milestones": {
          "title": "Milestones",
          "description": "As milestones are completed, the milestone's status and dates should be updated.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Milestone"
          },
          "uniqueItems": true
        },
        "documents": {
          "title": "Documents",
          "description": "Documents and reports that are part of the implementation phase e.g. audit and evaluation reports.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          },
          "uniqueItems": true
        }
      }
    },
    "Milestone": {
      "title": "Milestone",
      "description": "The milestone block can be used to represent a wide variety of events in the lifetime of a contracting process.",
      "type": "object",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "ID",
          "description": "A local identifier for this milestone, unique within this block. This field is used to keep track of multiple revisions of a milestone through the compilation from release to record mechanism.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "title": {
          "title": "Title",
          "description": "Milestone title",
          "type": [
            "string",
            "null"
          ]
        },
        "type": {
          "title": "Milestone type",
          "description": "The nature of the milestone, using the open [milestoneType](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#milestone-type) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "milestoneType.csv",
          "openCodelist": true
        },
        "description": {
          "title": "Description",
          "description": "A description of the milestone.",
          "type": [
            "string",
            "null"
          ]
        },
        "code": {
          "title": "Milestone code",
          "description": "Milestone codes can be used to track specific events that take place for a particular kind of contracting process. For example, a code of 'approvalLetter' can be used to allow applications to understand this milestone represents the date an approvalLetter is due or signed.",
          "type": [
            "string",
            "null"
          ]
        },
        "dueDate": {
          "title": "Due date",
          "description": "The date the milestone is due.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "dateMet": {
          "format": "date-time",
          "title": "Date met",
          "description": "The date on which the milestone was met.",
          "type": [
            "string",
            "null"
          ]
        },
        "dateModified": {
          "title": "Date modified",
          "description": "The date the milestone was last reviewed or modified and the status was altered or confirmed to still be correct.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "status": {
          "title": "Status",
          "description": "The status that was realized on the date provided in `dateModified`, from the closed [milestoneStatus](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#milestone-status) codelist.",
          "type": [
            "string",
            "null"
          ],
          "enum": [
            "scheduled",
            "met",
            "notMet",
            "partiallyMet",
            null
          ],
          "codelist": "milestoneStatus.csv",
          "openCodelist": false
        },
        "documents": {
          "title": "Documents",
          "description": "List of documents associated with this milestone (Deprecated in 1.1).",
          "type": "array",
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "Inclusion of documents at the milestone level is now deprecated. Documentation should be attached in the tender, award, contract or implementation sections, and titles and descriptions used to highlight the related milestone. Publishers who wish to continue to provide documents at the milestone level should explicitly declare this by using the milestone documents extension."
          },
          "items": {
            "$ref": "#/definitions/Document"
          },
          "uniqueItems": true
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Document": {
      "type": "object",
      "title": "Document",
      "description": "Links to, or descriptions of, external documents can be attached at various locations within the standard. Documents can be supporting information, formal notices, downloadable forms, or any other kind of resource that ought to be made public as part of full open contracting.",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "ID",
          "description": "A local, unique identifier for this document. This field is used to keep track of multiple revisions of a document through the compilation from release to record mechanism.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "documentType": {
          "title": "Document type",
          "description": "A classification of the document described, using the open [documentType](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#document-type) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "documentType.csv",
          "openCodelist": true
        },
        "title": {
          "title": "Title",
          "description": "The document title.",
          "type": [
            "string",
            "null"
          ]
        },
        "description": {
          "title": "Description",
          "description": "A short description of the document. Descriptions are recommended to not exceed 250 words. In the event the document is not accessible online, the description field can be used to describe arrangements for obtaining a copy of the document.",
          "type": [
            "string",
            "null"
          ]
        },
        "url": {
          "title": "URL",
          "description": "A direct link to the document or attachment. The server providing access to this document ought to be configured to correctly report the document mime type.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "datePublished": {
          "title": "Date published",
          "description": "The date on which the document was first published. This is particularly important for legally important documents such as notices of a tender.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "dateModified": {
          "title": "Date modified",
          "description": "Date that the document was last modified",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "format": {
          "title": "Format",
          "description": "The format of the document, using the open [IANA Media Types](http://www.iana.org/assignments/media-types/) codelist (see the values in the 'Template' column), or using the 'offline/print' code if the described document is published offline. For example, web pages have a format of 'text/html'.",
          "type": [
            "string",
            "null"
          ]
        },
        "language": {
          "title": "Language",
          "description": "The language of the linked document using either two-letter [ISO639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes), or extended [BCP47 language tags](http://www.w3.org/International/articles/language-tags/). The use of lowercase two-letter codes from [ISO639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) is recommended unless there is a clear user need for distinguishing the language subtype.",
          "type": [
            "string",
            "null"
          ]
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Budget": {
      "type": "object",
      "title": "Budget information",
      "description": "This section contains information about the budget line, and associated projects, through which this contracting process is funded. It draws upon the data model of the [Fiscal Data Package](https://frictionlessdata.io/specs/fiscal-data-package/), and should be used to cross-reference to more detailed information held using a Budget Data Package, or, where no linked Budget Data Package is available, to provide enough information to allow a user to manually or automatically cross-reference with another published source of budget and project information.",
      "properties": {
        "id": {
          "title": "ID",
          "description": "An identifier for the budget line item which provides funds for this contracting process. This identifier should be possible to cross-reference against the provided data source.",
          "type": [
            "string",
            "integer",
            "null"
          ]
        },
        "description": {
          "title": "Budget Source",
          "description": "A short free text description of the budget source. May be used to provide the title of the budget line, or the programme used to fund this project.",
          "type": [
            "string",
            "null"
          ]
        },
        "amount": {
          "title": "Amount",
          "description": "The value reserved in the budget for this contracting process. A negative value indicates anticipated income to the budget as a result of this contracting process, rather than expenditure. Where the budget is drawn from multiple sources, the budget breakdown extension can be used.",
          "$ref": "#/definitions/Value"
        },
        "project": {
          "title": "Project title",
          "description": "The name of the project through which this contracting process is funded (if applicable). Some organizations maintain a registry of projects, and the data should use the name by which the project is known in that registry. No translation option is offered for this string, as translated values can be provided in third-party data, linked from the data source above.",
          "type": [
            "string",
            "null"
          ]
        },
        "projectID": {
          "title": "Project identifier",
          "description": "An external identifier for the project that this contracting process forms part of, or is funded via (if applicable). Some organizations maintain a registry of projects, and the data should use the identifier from the relevant registry of projects.",
          "type": [
            "string",
            "integer",
            "null"
          ]
        },
        "uri": {
          "title": "Linked budget information",
          "description": "A URI pointing directly to a machine-readable record about the budget line-item or line-items that fund this contracting process. Information can be provided in a range of formats, including using IATI, the Open Fiscal Data Standard or any other standard which provides structured data on budget sources. Human readable documents can be included using the planning.documents block.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "source": {
          "title": "Data Source",
          "description": "(Deprecated in 1.1) Used to point either to a corresponding Budget Data Package, or to a machine or human-readable source where users can find further information on the budget line item identifiers, or project identifiers, provided here.",
          "type": [
            "string",
            "null"
          ],
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "The budget data source field was intended to link to machine-readable data about the budget for a contracting process, but has been widely mis-used to provide free-text descriptions of budget providers. As a result, it has been removed from version 1.1. budget/uri can be used to provide a link to machine-readable budget information, and budget/description can be used to provide human-readable information on the budget source."
          },
          "format": "uri"
        }
      },
      "patternProperties": {
        "^(source_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(project_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Transaction": {
      "type": "object",
      "title": "Transaction information",
      "description": "A spending transaction related to the contracting process. Draws upon the data models of the [Fiscal Data Package](https://frictionlessdata.io/specs/fiscal-data-package/) and the [International Aid Transparency Initiative](http://iatistandard.org/activity-standard/iati-activities/iati-activity/transaction/) and should be used to cross-reference to more detailed information held using a Fiscal Data Package, IATI file, or to provide enough information to allow a user to manually or automatically cross-reference with some other published source of transactional spending data.",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "ID",
          "description": "A unique identifier for this transaction. This identifier should be possible to cross-reference against the provided data source. For IATI this is the transaction reference.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "source": {
          "title": "Data source",
          "description": "Used to point either to a corresponding Fiscal Data Package, IATI file, or machine or human-readable source where users can find further information on the budget line item identifiers, or project identifiers, provided here.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "date": {
          "title": "Date",
          "description": "The date of the transaction",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "value": {
          "$ref": "#/definitions/Value",
          "title": "Value",
          "description": "The value of the transaction."
        },
        "payer": {
          "$ref": "#/definitions/OrganizationReference",
          "title": "Payer",
          "description": "An organization reference for the organization from which the funds in this transaction originate."
        },
        "payee": {
          "$ref": "#/definitions/OrganizationReference",
          "title": "Payee",
          "description": "An organization reference for the organization which receives the funds in this transaction."
        },
        "uri": {
          "title": "Linked spending information",
          "description": "A URI pointing directly to a machine-readable record about this spending transaction.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "amount": {
          "title": "Amount",
          "description": "(Deprecated in 1.1. Use transaction.value instead) The value of the transaction. A negative value indicates a refund or correction.",
          "$ref": "#/definitions/Value",
          "deprecated": {
            "description": "This field has been replaced by the `transaction.value` field for consistency with the use of value and amount elsewhere in the standard.",
            "deprecatedVersion": "1.1"
          }
        },
        "providerOrganization": {
          "title": "Provider organization",
          "description": "(Deprecated in 1.1. Use transaction.payer instead.) The Organization Identifier for the organization from which the funds in this transaction originate. Expressed following the Organizational Identifier standard - consult the documentation and the codelist.",
          "$ref": "#/definitions/Identifier",
          "deprecated": {
            "description": "This field has been replaced by the `transaction.payer` field to resolve ambiguity arising from 'provider' being interpreted as relating to the goods or services procured rather than the flow of funds between the parties.",
            "deprecatedVersion": "1.1"
          }
        },
        "receiverOrganization": {
          "title": "Receiver organization",
          "description": "(Deprecated in 1.1. Use transaction.payee instead). The Organization Identifier for the organization which receives the funds in this transaction. Expressed following the Organizational Identifier standard - consult the documentation and the codelist.",
          "$ref": "#/definitions/Identifier",
          "deprecated": {
            "description": "This field has been replaced by the `transaction.payee` field to resolve ambiguity arising from 'receiver' being interpreted as relating to the goods or services procured rather than the flow of funds between the parties.",
            "deprecatedVersion": "1.1"
          }
        }
      }
    },
    "OrganizationReference": {
      "properties": {
        "name": {
          "type": [
            "string",
            "null"
          ],
          "description": "The name of the party being referenced. This must match the name of an entry in the parties section.",
          "title": "Organization name",
          "minLength": 1
        },
        "id": {
          "type": [
            "string",
            "integer"
          ],
          "description": "The id of the party being referenced. This must match the id of an entry in the parties section.",
          "title": "Organization ID"
        },
        "identifier": {
          "title": "Primary identifier",
          "description": "The primary identifier for this organization. Identifiers that uniquely pick out a legal entity should be preferred. Consult the [organization identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/) for the preferred scheme and identifier to use.",
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "From version 1.1, organizations should be referenced by their identifier and name in a document, and detailed legal identifier information should only be provided in the relevant cross-referenced entry in the parties section at the top level of a release."
          },
          "$ref": "#/definitions/Identifier"
        },
        "address": {
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "From version 1.1, organizations should be referenced by their identifier and name in a document, and address information should only be provided in the relevant cross-referenced entry in the parties section at the top level of a release."
          },
          "$ref": "#/definitions/Address",
          "description": "(Deprecated outside the parties section)",
          "title": "Address"
        },
        "additionalIdentifiers": {
          "type": "array",
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "From version 1.1, organizations should be referenced by their identifier and name in a document, and additional identifiers for an organization should be provided in the relevant cross-referenced entry in the parties section at the top level of a release."
          },
          "items": {
            "$ref": "#/definitions/Identifier"
          },
          "title": "Additional identifiers",
          "uniqueItems": true,
          "wholeListMerge": true,
          "description": "(Deprecated outside the parties section) A list of additional / supplemental identifiers for the organization, using the [organization identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/). This can be used to provide an internally used identifier for this organization in addition to the primary legal entity identifier."
        },
        "contactPoint": {
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "From version 1.1, organizations should be referenced by their identifier and name in a document, and contact point information for an organization should be provided in the relevant cross-referenced entry in the parties section at the top level of a release."
          },
          "$ref": "#/definitions/ContactPoint",
          "description": "(Deprecated outside the parties section)",
          "title": "Contact point"
        }
      },
      "type": "object",
      "description": "The id and name of the party being referenced. Used to cross-reference to the parties section",
      "title": "Organization reference"
    },
    "Organization": {
      "title": "Organization",
      "description": "A party (organization)",
      "type": "object",
      "properties": {
        "name": {
          "title": "Common name",
          "description": "A common name for this organization or other participant in the contracting process. The identifier object provides a space for the formal legal name, and so this may either repeat that value, or may provide the common name by which this organization or entity is known. This field may also include details of the department or sub-unit involved in this contracting process.",
          "type": [
            "string",
            "null"
          ]
        },
        "id": {
          "type": "string",
          "description": "The ID used for cross-referencing to this party from other sections of the release. This field may be built with the following structure {identifier.scheme}-{identifier.id}(-{department-identifier}).",
          "title": "Entity ID"
        },
        "identifier": {
          "title": "Primary identifier",
          "description": "The primary identifier for this organization or participant. Identifiers that uniquely pick out a legal entity should be preferred. Consult the [organization identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/) for the preferred scheme and identifier to use.",
          "$ref": "#/definitions/Identifier"
        },
        "additionalIdentifiers": {
          "title": "Additional identifiers",
          "description": "A list of additional / supplemental identifiers for the organization or participant, using the [organization identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/). This can be used to provide an internally used identifier for this organization in addition to the primary legal entity identifier.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Identifier"
          },
          "uniqueItems": true,
          "wholeListMerge": true
        },
        "address": {
          "title": "Address",
          "description": "An address. This may be the legally registered address of the organization, or may be a correspondence address for this particular contracting process.",
          "$ref": "#/definitions/Address"
        },
        "contactPoint": {
          "title": "Contact point",
          "description": "Contact details that can be used for this party.",
          "$ref": "#/definitions/ContactPoint"
        },
        "roles": {
          "title": "Party roles",
          "description": "The party's role(s) in the contracting process, using the open [partyRole](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#party-role) codelist.",
          "type": [
            "array",
            "null"
          ],
          "items": {
            "type": "string"
          },
          "codelist": "partyRole.csv",
          "openCodelist": true
        },
        "details": {
          "type": [
            "object",
            "null"
          ],
          "description": "Additional classification information about parties can be provided using partyDetail extensions that define particular fields and classification schemes.",
          "title": "Details"
        }
      },
      "patternProperties": {
        "^(name_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Item": {
      "title": "Item",
      "type": "object",
      "description": "A good, service, or work to be contracted.",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "ID",
          "description": "A local identifier to reference and merge the items by. Must be unique within a given array of items.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "description": {
          "title": "Description",
          "description": "A description of the goods, services to be provided.",
          "type": [
            "string",
            "null"
          ]
        },
        "classification": {
          "title": "Classification",
          "description": "The primary classification for the item.",
          "$ref": "#/definitions/Classification"
        },
        "additionalClassifications": {
          "title": "Additional classifications",
          "description": "An array of additional classifications for the item.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Classification"
          },
          "uniqueItems": true,
          "wholeListMerge": true
        },
        "quantity": {
          "title": "Quantity",
          "description": "The number of units to be provided.",
          "type": [
            "number",
            "null"
          ]
        },
        "unit": {
          "title": "Unit",
          "description": "A description of the unit in which the supplies, services or works are provided (e.g. hours, kilograms) and the unit-price.",
          "type": "object",
          "properties": {
            "scheme": {
              "title": "Scheme",
              "description": "The list from which identifiers for units of measure are taken, using the open [unitClassificationScheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#unit-classification-scheme) codelist. 'UNCEFACT' is recommended.",
              "type": [
                "string",
                "null"
              ],
              "codelist": "unitClassificationScheme.csv",
              "openCodelist": true
            },
            "id": {
              "title": "ID",
              "description": "The identifier from the codelist referenced in the `scheme` field. Check the [unitClassificationScheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#unit-classification-scheme) codelist for details of how to find and use identifiers from the scheme in use.",
              "type": [
                "string",
                "null"
              ],
              "versionId": true
            },
            "name": {
              "title": "Name",
              "description": "Name of the unit.",
              "type": [
                "string",
                "null"
              ]
            },
            "value": {
              "title": "Value",
              "description": "The monetary value of a single unit.",
              "$ref": "#/definitions/Value"
            },
            "uri": {
              "title": "URI",
              "description": "The machine-readable URI for the unit of measure, provided by the scheme.",
              "format": "uri",
              "type": [
                "string",
                "null"
              ]
            }
          },
          "patternProperties": {
            "^(name_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "patternProperties": {
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Amendment": {
      "title": "Amendment",
      "type": "object",
      "description": "Amendment information",
      "properties": {
        "date": {
          "title": "Amendment date",
          "description": "The date of this amendment.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "rationale": {
          "title": "Rationale",
          "description": "An explanation for the amendment.",
          "type": [
            "string",
            "null"
          ]
        },
        "id": {
          "description": "An identifier for this amendment: often the amendment number",
          "type": [
            "string",
            "null"
          ],
          "title": "ID"
        },
        "description": {
          "description": "A free text, or semi-structured, description of the changes made in this amendment.",
          "type": [
            "string",
            "null"
          ],
          "title": "Description"
        },
        "amendsReleaseID": {
          "description": "Provide the identifier (release.id) of the OCDS release (from this contracting process) that provides the values for this contracting process **before** the amendment was made.",
          "type": [
            "string",
            "null"
          ],
          "title": "Amended release (identifier)"
        },
        "releaseID": {
          "description": "Provide the identifier (release.id) of the OCDS release (from this contracting process) that provides the values for this contracting process **after** the amendment was made.",
          "type": [
            "string",
            "null"
          ],
          "title": "Amending release (identifier)"
        },
        "changes": {
          "title": "Amended fields",
          "description": "An array of change objects describing the fields changed, and their former values. (Deprecated in 1.1)",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "property": {
                "title": "Property",
                "description": "The property name that has been changed relative to the place the amendment is. For example if the contract value has changed, then the property under changes within the contract.amendment would be value.amount. (Deprecated in 1.1)",
                "type": "string"
              },
              "former_value": {
                "title": "Former Value",
                "description": "The previous value of the changed property, in whatever type the property is. (Deprecated in 1.1)",
                "type": [
                  "string",
                  "number",
                  "integer",
                  "array",
                  "object",
                  "null"
                ]
              }
            }
          },
          "deprecated": {
            "description": "A free-text or semi-structured string describing the changes made in each amendment can be provided in the amendment.description field. To provide structured information on the fields that have changed, publishers should provide releases indicating the state of the contracting process before and after the amendment.  ",
            "deprecatedVersion": "1.1"
          }
        }
      },
      "patternProperties": {
        "^(rationale_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Classification": {
      "title": "Classification",
      "description": "A classification consists of at least two parts: an identifier for the list (scheme) from which the classification is taken, and an identifier for the category from that list being applied. It is useful to also publish a text label and/or URI that users can draw on to interpret the classification.",
      "type": "object",
      "properties": {
        "scheme": {
          "title": "Scheme",
          "description": "The scheme or codelist from which the classification code is taken. For line item classifications, this uses the open [itemClassificationScheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#item-classification-scheme) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "itemClassificationScheme.csv",
          "openCodelist": true
        },
        "id": {
          "title": "ID",
          "description": "The classification code taken from the scheme.",
          "type": [
            "string",
            "integer",
            "null"
          ],
          "versionId": true
        },
        "description": {
          "title": "Description",
          "description": "A textual description or title for the classification code.",
          "type": [
            "string",
            "null"
          ]
        },
        "uri": {
          "title": "URI",
          "description": "A URI to uniquely identify the classification code.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        }
      },
      "patternProperties": {
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Identifier": {
      "title": "Identifier",
      "description": "A unique identifier for a party (organization).",
      "type": "object",
      "properties": {
        "scheme": {
          "title": "Scheme",
          "description": "Organization identifiers should be taken from an existing organization identifier list. The scheme field is used to indicate the list or register from which the identifier is taken. This value should be taken from the [Organization Identifier Scheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#organization-identifier-scheme) codelist.",
          "type": [
            "string",
            "null"
          ]
        },
        "id": {
          "title": "ID",
          "description": "The identifier of the organization in the selected scheme.",
          "type": [
            "string",
            "integer",
            "null"
          ],
          "versionId": true
        },
        "legalName": {
          "title": "Legal Name",
          "description": "The legally registered name of the organization.",
          "type": [
            "string",
            "null"
          ]
        },
        "uri": {
          "title": "URI",
          "description": "A URI to identify the organization, such as those provided by [Open Corporates](http://www.opencorporates.com) or some other relevant URI provider. This is not for listing the website of the organization: that can be done through the URL field of the Organization contact point.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        }
      },
      "patternProperties": {
        "^(legalName_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Address": {
      "title": "Address",
      "description": "An address.",
      "type": "object",
      "properties": {
        "streetAddress": {
          "title": "Street address",
          "type": [
            "string",
            "null"
          ],
          "description": "The street address. For example, 1600 Amphitheatre Pkwy."
        },
        "locality": {
          "title": "Locality",
          "type": [
            "string",
            "null"
          ],
          "description": "The locality. For example, Mountain View."
        },
        "region": {
          "title": "Region",
          "type": [
            "string",
            "null"
          ],
          "description": "The region. For example, CA."
        },
        "postalCode": {
          "title": "Postal code",
          "type": [
            "string",
            "null"
          ],
          "description": "The postal code. For example, 94043."
        },
        "countryName": {
          "title": "Country name",
          "type": [
            "string",
            "null"
          ],
          "description": "The country name. For example, United States."
        }
      },
      "patternProperties": {
        "^(countryName_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "ContactPoint": {
      "title": "Contact point",
      "type": "object",
      "description": "A person, contact point or department to contact in relation to this contracting process.",
      "properties": {
        "name": {
          "title": "Name",
          "type": [
            "string",
            "null"
          ],
          "description": "The name of the contact person, department, or contact point, for correspondence relating to this contracting process."
        },
        "email": {
          "title": "Email",
          "type": [
            "string",
            "null"
          ],
          "description": "The e-mail address of the contact point/person."
        },
        "telephone": {
          "title": "Telephone",
          "type": [
            "string",
            "null"
          ],
          "description": "The telephone number of the contact point/person. This should include the international dialing code."
        },
        "faxNumber": {
          "title": "Fax number",
          "type": [
            "string",
            "null"
          ],
          "description": "The fax number of the contact point/person. This should include the international dialing code."
        },
        "url": {
          "title": "URL",
          "type": [
            "string",
            "null"
          ],
          "description": "A web address for the contact point/person.",
          "format": "uri"
        }
      },
      "patternProperties": {
        "^(name_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Value": {
      "title": "Value",
      "description": "Financial values should be published with a currency attached.",
      "type": "object",
      "properties": {
        "amount": {
          "title": "Amount",
          "description": "Amount as a number.",
          "type": [
            "number",
            "null"
          ]
        },
        "currency": {
          "title": "Currency",
          "description": "The currency of the amount, from the closed [currency](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#currency) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "currency.csv",
          "openCodelist": false,
          "enum": [
            "ADP",
            "AED",
            "AFA",
            "AFN",
            "ALK",
            "ALL",
            "AMD",
            "ANG",
            "AOA",
            "AOK",
            "AON",
            "AOR",
            "ARA",
            "ARP",
            "ARS",
            "ARY",
            "ATS",
            "AUD",
            "AWG",
            "AYM",
            "AZM",
            "AZN",
            "BAD",
            "BAM",
            "BBD",
            "BDT",
            "BEC",
            "BEF",
            "BEL",
            "BGJ",
            "BGK",
            "BGL",
            "BGN",
            "BHD",
            "BIF",
            "BMD",
            "BND",
            "BOB",
            "BOP",
            "BOV",
            "BRB",
            "BRC",
            "BRE",
            "BRL",
            "BRN",
            "BRR",
            "BSD",
            "BTN",
            "BUK",
            "BWP",
            "BYB",
            "BYN",
            "BYR",
            "BZD",
            "CAD",
            "CDF",
            "CHC",
            "CHE",
            "CHF",
            "CHW",
            "CLF",
            "CLP",
            "CNY",
            "COP",
            "COU",
            "CRC",
            "CSD",
            "CSJ",
            "CSK",
            "CUC",
            "CUP",
            "CVE",
            "CYP",
            "CZK",
            "DDM",
            "DEM",
            "DJF",
            "DKK",
            "DOP",
            "DZD",
            "ECS",
            "ECV",
            "EEK",
            "EGP",
            "ERN",
            "ESA",
            "ESB",
            "ESP",
            "ETB",
            "EUR",
            "FIM",
            "FJD",
            "FKP",
            "FRF",
            "GBP",
            "GEK",
            "GEL",
            "GHC",
            "GHP",
            "GHS",
            "GIP",
            "GMD",
            "GNE",
            "GNF",
            "GNS",
            "GQE",
            "GRD",
            "GTQ",
            "GWE",
            "GWP",
            "GYD",
            "HKD",
            "HNL",
            "HRD",
            "HRK",
            "HTG",
            "HUF",
            "IDR",
            "IEP",
            "ILP",
            "ILR",
            "ILS",
            "INR",
            "IQD",
            "IRR",
            "ISJ",
            "ISK",
            "ITL",
            "JMD",
            "JOD",
            "JPY",
            "KES",
            "KGS",
            "KHR",
            "KMF",
            "KPW",
            "KRW",
            "KWD",
            "KYD",
            "KZT",
            "LAJ",
            "LAK",
            "LBP",
            "LKR",
            "LRD",
            "LSL",
            "LSM",
            "LTL",
            "LTT",
            "LUC",
            "LUF",
            "LUL",
            "LVL",
            "LVR",
            "LYD",
            "MAD",
            "MDL",
            "MGA",
            "MGF",
            "MKD",
            "MLF",
            "MMK",
            "MNT",
            "MOP",
            "MRO",
            "MRU",
            "MTL",
            "MTP",
            "MUR",
            "MVQ",
            "MVR",
            "MWK",
            "MXN",
            "MXP",
            "MXV",
            "MYR",
            "MZE",
            "MZM",
            "MZN",
            "NAD",
            "NGN",
            "NIC",
            "NIO",
            "NLG",
            "NOK",
            "NPR",
            "NZD",
            "OMR",
            "PAB",
            "PEH",
            "PEI",
            "PEN",
            "PES",
            "PGK",
            "PHP",
            "PKR",
            "PLN",
            "PLZ",
            "PTE",
            "PYG",
            "QAR",
            "RHD",
            "ROK",
            "ROL",
            "RON",
            "RSD",
            "RUB",
            "RUR",
            "RWF",
            "SAR",
            "SBD",
            "SCR",
            "SDD",
            "SDG",
            "SDP",
            "SEK",
            "SGD",
            "SHP",
            "SIT",
            "SKK",
            "SLL",
            "SOS",
            "SRD",
            "SRG",
            "SSP",
            "STD",
            "STN",
            "SUR",
            "SVC",
            "SYP",
            "SZL",
            "THB",
            "TJR",
            "TJS",
            "TMM",
            "TMT",
            "TND",
            "TOP",
            "TPE",
            "TRL",
            "TRY",
            "TTD",
            "TWD",
            "TZS",
            "UAH",
            "UAK",
            "UGS",
            "UGW",
            "UGX",
            "USD",
            "USN",
            "USS",
            "UYI",
            "UYN",
            "UYP",
            "UYU",
            "UYW",
            "UZS",
            "VEB",
            "VEF",
            "VES",
            "VNC",
            "VND",
            "VUV",
            "WST",
            "XAF",
            "XAG",
            "XAU",
            "XBA",
            "XBB",
            "XBC",
            "XBD",
            "XCD",
            "XDR",
            "XEU",
            "XFO",
            "XFU",
            "XOF",
            "XPD",
            "XPF",
            "XPT",
            "XRE",
            "XSU",
            "XTS",
            "XUA",
            "XXX",
            "YDD",
            "YER",
            "YUD",
            "YUM",
            "YUN",
            "ZAL",
            "ZAR",
            "ZMK",
            "ZMW",
            "ZRN",
            "ZRZ",
            "ZWC",
            "ZWD",
            "ZWL",
            "ZWN",
            "ZWR",
            null
          ]
        }
      }
    },
    "Period": {
      "title": "Period",
      "description": "Key events during a contracting process may have a known start date, end date, duration, or maximum extent (the latest date the period can extend to). In some cases, not all of these fields will have known or relevant values.",
      "type": "object",
      "properties": {
        "startDate": {
          "title": "Start date",
          "description": "The start date for the period. When known, a precise start date must be provided.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "endDate": {
          "title": "End date",
          "description": "The end date for the period. When known, a precise end date must be provided.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "maxExtentDate": {
          "description": "The period cannot be extended beyond this date. This field can be used to express the maximum available date for extension or renewal of this period.",
          "format": "date-time",
          "title": "Maximum extent",
          "type": [
            "string",
            "null"
          ]
        },
        "durationInDays": {
          "description": "The maximum duration of this period in days. A user interface can collect or display this data in months or years as appropriate, and then convert it into days when storing this field. This field can be used when exact dates are not known. If a startDate and endDate are set, this field, if used, should be equal to the difference between startDate and endDate. Otherwise, if a startDate and maxExtentDate are set, this field, if used, should be equal to the difference between startDate and maxExtentDate.",
          "title": "Duration (days)",
          "type": [
            "integer",
            "null"
          ]
        }
      }
    },
    "RelatedProcess": {
      "description": "A reference to a related contracting process: generally one preceding or following on from the current process.",
      "type": "object",
      "title": "Related Process",
      "properties": {
        "id": {
          "title": "Relationship ID",
          "description": "A local identifier for this relationship, unique within this array.",
          "type": "string"
        },
        "relationship": {
          "items": {
            "type": "string"
          },
          "description": "The type of relationship, using the open [relatedProcess](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#related-process) codelist.",
          "title": "Relationship",
          "type": [
            "array",
            "null"
          ],
          "codelist": "relatedProcess.csv",
          "openCodelist": true
        },
        "title": {
          "description": "The title of the related process, where referencing an open contracting process, this field should match the tender/title field in the related process.",
          "title": "Related process title",
          "type": [
            "string",
            "null"
          ]
        },
        "scheme": {
          "title": "Scheme",
          "description": "The identification scheme used by this cross-reference, using the open [relatedProcessScheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#related-process-scheme) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "relatedProcessScheme.csv",
          "openCodelist": true
        },
        "identifier": {
          "description": "The identifier of the related process. If the scheme is 'ocid', this must be an Open Contracting ID (ocid).",
          "title": "Identifier",
          "type": [
            "string",
            "null"
          ]
        },
        "uri": {
          "format": "uri",
          "description": "A URI pointing to a machine-readable document, release or record package containing the identified related process.",
          "title": "Related process URI",
          "type": [
            "string",
            "null"
          ]
        }
      }
    }
  }
}
},{}]},{},[1]);
