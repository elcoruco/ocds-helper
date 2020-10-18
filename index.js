const release  = require("./schemas/release.json");
const releaseP = require("./schemas/release-package.json");
const recordP  = require("./schemas/record-package.json");

const RELEASE  = "release";
const RELEASEP = "release package";
const RECORDP  = "record Package";
const LINKED_RELEASE   = "Linked Release";
const EMBEDDED_RELEASE = "Embedded Release";

const ocdsSchemas = {
  release,
  releaseP,
  recordP
}

//console.log("schemas:", ocdsSchemas);

exports.createOCDSHelper = async ocds => {
  //console.log("schemas:", this.ocdsSchemas);
  return {
    ocds,
    type    : jsonType(ocds),
    //schemas : this.ocdsSchemas,
    data    : await getData(ocds)
  }
}

const getData = async ocds => {
  const type = jsonType(ocds);
  if(type === RELEASE) return accesors.release(ocds);
  else if(type === RECORDP) return await accesors.recordPackage(ocds);
  else if(type === RELEASEP) return await accesors.releasePackage(ocds);
  else return null;
}

const accesors = {
  release        : rel => rel,
  releasePackage : rel => rel,
  recordPackage  :  async(rp, index) => {
    const records  = rp.records;
    const response = [];
    // check if has items
    if(!records.length) return null;

    for(const rel of records){
      console.log("rel:", rel);
      /*
      if(rel.compiledRelease){
        console.log("compiled!");
        response.push(rel.compiledRelease);
      }
      */
       if(rel.releases){
        console.log("not compiled");
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
    } 
    return index ? response[index] : response;  
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

