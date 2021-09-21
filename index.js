/*
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
/
/  Define constantes y métodos de ayuda
/
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
*/
const reducer  = (accumulator, currentValue) => accumulator + currentValue;

// const release  = require("./schemas/release.json");
// const releaseP = require("./schemas/release-package.json");
// const recordP  = require("./schemas/record-package.json");

const RELEASE  = "release";
const RELEASEP = "release package";
const RECORD   = "record";
const RECORDP  = "record Package";
const LINKED_RELEASE   = "Linked Release";
const EMBEDDED_RELEASE = "Embedded Release";

const TENDER         = "tender";
const PLANNING       = "planning";
const AWARD          = "award";
const CONTRACT       = "contract";
const IMPLEMENTATION = "implementation";

const FAIL = null;


// const ocdsSchemas = {
//   release,
//   releaseP,
//   recordP
// }

/*
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
/
/  Define el plugin
/
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
*/
const createOCDSHelper = ocds => {
  const type     = jsonType(ocds);
  const data     = getData(ocds);
  const state    =  getState(data);
  const daysDiff = getDiffDays(data ? data.date : null);
  const amount   = getAmount(state, data)
  return {
    ocds,
    type,
    data,
    state,
    daysDiff,
    amount,
    getData : (prop, condition) => propertyAccesor(prop, data, condition),
    getStateAmount : st => getAmount(st, data),
    constants : {
      states : {
        TENDER,
        PLANNING,
        AWARD,
        CONTRACT,
        IMPLEMENTATION,
        FAIL 
      },
      types : {
        RELEASE,
        RELEASEP,
        RECORD,
        RECORDP,
        LINKED_RELEASE,
        EMBEDDED_RELEASE
      }
    },
    indices : {
      hasSupplier       : () => hasSupplier(data),
      hasItems          : () => hasItems(data),
      isCompetitive     : () => isCompetitive(data),
      awardContractDiff : () => awardContractDiff(data),
      tenderPeriodDays  : () => tenderPeriodDays(data)
    }
  }
}

/*
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
/
/  define los métodos generales del plugin
/
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
*/
const getAmount = (state, rel) => {
  if(!state) return FAIL;

  let amount;

  if(state === PLANNING){
    amount = propertyAccesor('planning.budget.amount', rel)
    return amount ? {
      source : PLANNING,
      data : [amount]
    } : FAIL;
  }

  if(state === TENDER){
    amount = propertyAccesor('tender.value', rel) || propertyAccesor('tender.minValue', rel);
    return amount ? {
      source : TENDER,
      data   : [amount]
    } : FAIL;
  }

  if(state === AWARD){
    amount = propertyAccesor('awards.value', rel);
    return amount ? {
      source : AWARD,
      data   : sumAmount(amount)
    } : FAIL;
  }

  if(state === CONTRACT){
    amount = propertyAccesor('contracts.value', rel);
    return amount ? {
      source : CONTRACT,
      data   : sumAmount(amount)
    } : FAIL;
  }

  if(state === IMPLEMENTATION){
    amount = propertyAccesor('contracts.implementation.transactions.value', rel);
    return amount ? {
      source : IMPLEMENTATION,
      data   : sumAmount(amount)
    } : FAIL;
  }
}

const sumAmount = amountArray => {
  const currencies = [...new Set( amountArray.map(d => d.currency) )]
  
  return currencies.map( currency => {
    return {
      currency,
      amount : amountArray.map(d => d.amount).filter(d => d).reduce(reducer, 0)
    }
  }).sort( (a,b) => a.amount > b.amount ? 1 : -1)
}

const propertyAccesor = (prop, ref, condition) => {
  if(!prop) return null;
  const isArr   = item => Array.isArray(item);
  const isObj   = item => typeof item === 'object' && item !== null && !isArr(item);
  const isStr   = item => typeof item === 'string' || item instanceof String;
  const isEmpty = res  => isArr(res) ? ! res.filter(d => d).length : false; 
  const slices  = prop.split(".");
  let response  = ref;

  for(slice of slices){
    let isArray  = isArr(response);
    let isObject = isObj(response);  
    if(isObject){
      response = response[slice]
    }
    else if(isArray){
      response = response.filter(r => r).map(r => {
        if( isObj(r) ){
          return r[slice]
        }
        else if(isArr(r)){
          return r.map(s => s[slice])
        }
        else{
          return FAIL
        }
      }).flat();
    }
    else{
      response = FAIL;
    }
  }
  
  // return isEmpty(response) ? null :  response;
  if( isEmpty(response) ) return null;

  if(!condition) return response;

  if(condition && isArr(response)){
    let items =  response.filter(item => {
      if(condition.type === "contains"){
        return item[condition.field].indexOf(condition.value) !== -1;
      }
      else if(condition.type === "equals"){
        return item[condition.field] == condition.value;
      }
      else{
        return;
      }
    });

    return items.length ? items : FAIL;
  }



}

/*
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
/
/  define los métodos de indicadores del plugin
/
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
*/
const hasSupplier = rel => {
  const suppliers = propertyAccesor("parties", rel, {type : "contains", field : "roles", value : "supplier"});
  return suppliers ? true : false;
}

const hasItems = rel => {
  const tenderItems = propertyAccesor("tender.items", rel);
  const awardsItems = propertyAccesor("awards.items", rel);
  const contractsItems = propertyAccesor("contracts.items", rel);
  return tenderItems || awardsItems || contractsItems ? true : false;
}

const isCompetitive = rel => {
  const type = propertyAccesor("tender.procurementMethod", rel);

  if(!type){
    return FAIL; 
  }
  else if(type.toLowerCase() == "direct"){
    return false;
  }
  else{
    return true;
  }
}

const awardContractDiff = rel => {
  const awardAmount = getAmount(AWARD, rel);
  const contractAmount = getAmount(CONTRACT, rel);
  let amount, percent;

  if(!awardAmount || !contractAmount) return FAIL;
  if(awardAmount.data.currency != contractAmount.data.currency) return FAIL;
  if(!awardAmount.data.amount || !contractAmount.data.amount) return FAIL;

  amount = +contractAmount.data.amount - +awardAmount.data.amount;
  percent = amount / +awardAmount.data.amount;

  return {amount, percent};
}

const tenderPeriodDays = rel => {
  const tenderPeriod = propertyAccesor("tender.tenderPeriod", rel);
  let from, to, diff, days;

  if(!tenderPeriod) return FAIL;
  if(!tenderPeriod.startDate) return FAIL;
  if(!tenderPeriod.endDate) return FAIL;

  from = new Date(tenderPeriod.startDate);
  to = new Date(tenderPeriod.endDate);
  diff = to.getTime() - from.getTime();
  days = Math.ceil( diff / (1000*60*60*24)  )

  return days;
}

/*
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
/
/  define métodos que se ocupan una sola vez
/  y que no forman parte del plugin
/
/  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
*/
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

// https://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
const getDiffDays = date => {
  if(!date) return null;
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
  else if(type === RECORD) return  accesors.record(ocds);
  else return null;
}

const accesors = {
  release        : rel => rel,
  record         : record => record.compiledRelease || record.releases[0],
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
  if(file.ocid && file.releases) return RECORD;
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

