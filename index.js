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


const ocdsSchemas = {
  release,
  releaseP,
  recordP
}

// console.log("schemas:", ocdsSchemas);

exports.createOCDSHelper = ocds => {
  const type = jsonType(ocds);
  const data = getData(ocds);

  return {
    ocds,
    type,
    data,
    getData : prop => propertyAccesor(prop, data)
  }
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

  const slices = prop.split(".");
  if( slices.length === 1 ) return ref[prop];
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
      //console.log("rel:", rel);
      
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

