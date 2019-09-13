const logger = require('applogger');
const { RegionBackend } = require('../../region/region.backend');
const { AVAILABLE_REGIONS, REGION_INIT_DATA } = require('../../region/region.constants');

const initRegions = async (options) => {
  const fn = `[initRegions]`;
  const collection = 'regions';
  options = Object.assign({
    emptyCollection: false,
  }, options);

  let results = [];
  0;
  for (var regionId of Object.keys(REGION_INIT_DATA)) {   
    var region = REGION_INIT_DATA[regionId];
    
    // logger.info(fn, countryCode, 'canSell', country.translations);
    
    // let country = countryjs.info(countryWitRegions.countryName);
    let doc = {
      ...region
    }
    // logger.info(fn, `creating "${doc.identifier}" ...${doc}`);
    let result = await RegionBackend.findOneAndUpdate({
      shortCode: doc.shortCode,
    }, doc, { upsert: true, new: true, returnNewDocument: true });
    
    results.push[doc];
  }
  return results;
}


module.exports = initRegions;