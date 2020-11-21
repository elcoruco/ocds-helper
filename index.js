const reducer  = (accumulator, currentValue) => accumulator + currentValue;

const release  = require("./schemas/release.json");
const releaseP = require("./schemas/release-package.json");
const recordP  = require("./schemas/record-package.json");

const RELEASE  = "release";
const RELEASEP = "release package";
const RECORDP  = "record Package";
const LINKED_RELEASE   = "Linked Release";
const EMBEDDED_RELEASE = "Embedded Release";

const TENDER         = "tender";
const PLANNING       = "planning";
const AWARD          = "award";
const CONTRACT       = "contract";
const IMPLEMENTATION = "implementation";

const FAIL = null;


const ocdsSchemas = {
  release,
  releaseP,
  recordP
}

const createOCDSHelper = ocds => {
  const type     = jsonType(ocds);
  const data     = getData(ocds);
  const state    =  getState(data);
  const daysDiff = getDiffDays(data.date);

  return {
    ocds,
    type,
    data,
    state,
    daysDiff,
    getData : prop => propertyAccesor(prop, data),
    constants : {
      states : {
        TENDER,
        PLANNING,
        AWARD,
        CONTRACT,
        IMPLEMENTATION,
        FAIL 
      }
    }
  }
}

const getState = rel => {
  if(!rel) return null;

  let planning       = !!rel.planning,
      tender         = !!rel.tender,
      award          = rel.awards && rel.awards.length,
      contract       = rel.contracts && rel.contracts.length,
      implementation = contract && rel.contracts.find(con => con.implementation),
      state;

  if (implementation) {
    state = IMPLEMENTATION;
  }
  else if (contract) {
    state = CONTRACT;
  }
  else if (award) {
    state = AWARD;
  }
  else if (tender) {
    state = TENDER;
  }
  else if (planning) {
    state = PLANNING;
  }
  else {
    state = FAIL;
  }

  return state;
}

const getDiffDays = date => {
  if(!date) return null;
  // https://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const dateDiffInDays = (a, b) => {
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  return dateDiffInDays(new Date(date), new Date());
}

const getData = ocds => {
  const type = jsonType(ocds);
  if(type === RELEASE) return accesors.release(ocds);
  else if(type === RECORDP) return  accesors.recordPackage(ocds);
  else if(type === RELEASEP) return  accesors.releasePackage(ocds);
  else return null;
}

const propertyAccesor = (prop, ref) => {
  if(!prop) return null;
  const isArr   = item => Array.isArray(item);
  const isObj   = item => typeof item === 'object' && item !== null && !isArr(item);
  const isEmpty = res  => isArr(res) ? ! res.filter(d => d).length : false; 
  const slices  = prop.split(".");
  let response  = ref;

  // return if only one value
  //if( slices.length === 1 ) return ref[prop];

  for(slice of slices){
    let isArray  = isArr(response);
    let isObject = isObj(response);  
    response = isObject ? response[slice] : (isArray ? response.map(r => isObj(r) ? r[slice] : null) : null)
  }
  
  return isEmpty(response) ? null :  response;
}

const accesors = {
  release        : rel => rel,
  releasePackage : (rp, index) => {
    const releases = rp.releases;
    return index ? (releases[index] || null) : (releases.length === 1 ? releases[0] : releases); 
  },

  recordPackage  :  (rp, index) => {
    const records  = rp.records;
    const response = [];
    // check if has items
    if(!records.length) return null;

    for(const rel of records){
      if(rel.compiledRelease){
        response.push(rel.compiledRelease);
      }
    }

    return index ? (response[index] || null) : (response.length === 1 ? response[0] : response); 
      /*
      else if(rel.releases){
        for(const el of rel.releases){
          let type = releaseType(el);
          if(type == EMBEDDED_RELEASE){
            response.push(el);
          }
          else{
            try{
              let res  = await fetch(el.url);
              let item = res.json();
              response.push(item); 
            }
            catch(e){
              console.log(e);
            }
          }
        }
      }
     
    }  */ 
  }
}


const jsonType = file => {
  if(typeof file !== "object" || file === null) return null;
  if(file.releases) return RELEASEP;
  if(file.records) return RECORDP;
  if(file.ocid) return RELEASE;
  return null;
}

const releaseType = rel => {
  if(rel.url && rel.date)       return LINKED_RELEASE;
  else if(rel.ocid && rel.date) return EMBEDDED_RELEASE;
  else return null;
}


// ----------------------------------------------------------------
// UMD WRAPPER
// https://github.com/umdjs/umd/blob/master/templates/returnExports.js
// ----------------------------------------------------------------

// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], factory);
  } else if (typeof module === 'object' && module.exports) {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory();
  } else {
      // Browser globals (root is window)
      root['createOCDSHelper'] = factory();
}
}(typeof self !== 'undefined' ? self : this, function () {

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.


  return createOCDSHelper;
}));

