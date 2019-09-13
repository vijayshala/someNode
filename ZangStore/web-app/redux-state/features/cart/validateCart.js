export function validateCart(cart, shippingSameAsBilling, currentRegion) {
  let warnings = [];
  // isValidInput('partnerId', warnings, ['-1', '', null]);

  console.log("Current Region: ", currentRegion);

  //validate company info
  let company = cart.company || {};
  isValidInput('company.domain', company.domain, warnings);
  isValidInput('company.name', company.name, warnings);
  isValidInput('company.industry', company.industry, warnings);
  if (currentRegion && currentRegion.data.countryISO != 'DE') {
    isValidInput('company.isIncorporated', company.isIncorporated, warnings);
  }
  
  let contact = cart.contact || {};
  isValidInput('contact.email', contact.email, warnings);
  isValidInput('contact.firstName', contact.firstName, warnings);
  isValidInput('contact.lastName', contact.lastName, warnings);
  isValidInput('contact.phone', contact.phone, warnings);

  let billingAddress = cart.billingAddress || {};
  isValidInput('billingAddress.address1', billingAddress.address1, warnings);
  isValidInput('billingAddress.country', billingAddress.country, warnings);
  isValidInput('billingAddress.city', billingAddress.city, warnings);
  if (currentRegion && currentRegion.data.addressFormClass == 0 || currentRegion.data.addressFormClass == 1) {
    isValidInput('billingAddress.state', billingAddress.state, warnings);  
  }
  isValidInput('billingAddress.zip', billingAddress.zip, warnings);

  let shippingAddress = cart.shippingAddress || {};
  if (!shippingSameAsBilling) {
    isValidInput('shippingAddress.address1', shippingAddress.address1, warnings);
    isValidInput('shippingAddress.country', shippingAddress.country, warnings);
    isValidInput('shippingAddress.city', shippingAddress.city, warnings);
    if (currentRegion && currentRegion.data.addressFormClass == 0 || currentRegion && currentRegion.data.addressFormClass == 1) {
      isValidInput('shippingAddress.state', shippingAddress.state, warnings);
    }
    isValidInput('shippingAddress.zip', shippingAddress.zip, warnings);
  }
  console.log("Warnings: ", warnings);
  return warnings;
}

function isUndefined(val) {
  return val == undefined
}

function isValidInput(reference, value, warnings, invalidValue = ['', null, 'undefined', undefined], secondaryReference) {
  if (reference && invalidValue.indexOf(value) > -1 || isUndefined(value)) {
    warnings.push({
      code: 'THIS_FIELD_IS_REQUIRED',
      message: {
        resource:['THIS_FIELD_IS_REQUIRED'],
        text: global.localizer.get('THIS_FIELD_IS_REQUIRED')
      },
      reference: secondaryReference || reference,
    })
  }
}