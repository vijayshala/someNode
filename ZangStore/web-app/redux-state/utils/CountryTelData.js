import countryTelephoneData from 'country-telephone-data';
class CountryTelData {
  constructor() {
    this.allPhoneLookups = this.initCountryPhoneLookup();
  }

  getByIso2(iso2) {
    return this.allPhoneLookups[iso2];
  }

  initCountryPhoneLookup = () => {
    const fn = `[initCountryPhoneLookup]`;
    let allPhoneLookups = {}
    for (var country of countryTelephoneData.allCountries) {
      // logger.info(fn, 'country', country);
      
      allPhoneLookups[country.iso2] = country;
    }
    return allPhoneLookups;
  }
}

export default new CountryTelData();
