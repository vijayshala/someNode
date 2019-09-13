const billingInfo = {
  month: 'MONTHLY',
  year: 'Annually'
}
export function getBillingPeriodLabel(billingPeriod) {
  return billingPeriod ? global.localizer.get(billingInfo[billingPeriod]) : billingPeriod;
}

export function getPlanInfo(subscription) {
  let contractPeriod = subscription.contractPeriod;
  let contractLength = subscription.contractLength
  if (subscription.contractPeriod == 'month') {
    if (contractLength % 12===0 ) {
      contractPeriod = 'year'
      contractLength = subscription.contractLength / 12;
    }
  }
  let LNG_RESOURCE = contractLength == 1
    ? contractPeriod == 'month'
      ? 'MONTHLY_PLAN'
      : contractPeriod == 'year'
        ? 'ONE_YEAR_PLAN'
        : contractPeriod
    : contractPeriod == 'month'
    ? 'MONTHS_PLAN'
    : contractPeriod == 'year'
      ? 'YEARS_PLAN'
      : contractPeriod
    
  let label = global.localizer.get(LNG_RESOURCE);
  label = label ? label.replace('{0}', contractLength) : '';
  return label;
}

export function updateState(state, newObjects = {}) {
  let newState = {...state}  
  Object.keys(newObjects).forEach(key => {  
    if (key != 'undefined') {      
      newState[key] = {
        ...(state[key] || {} ), ...newObjects[key]}
    }
  })  
  return newState;
}

export function getLableFromDescriptions(obj, identifier) {
  if (obj && identifier) {
    let descriptions = obj.descriptions || []
    for (var descp of descriptions) {
      if (descp.identifier == identifier) {
        return descp;
      }
    }
  }
  return null;  
}

export function translateResourceField(obj) {
  return obj ? obj.resource ? global.localizer.get(obj.resource) : obj.text ? obj.text : '' : '';
}

export function getWarningMessage(message) {
  var msg = message;
  if (message.resource && message.resource.length) {
    var errTemplate = global.localizer.get(message.resource[0]);
    for (var i = 1; i < message.resource.length; i++){
      errTemplate = errTemplate.replace('{' + i + '}', global.localizer.get(message.resource[i]));
    }
    msg= errTemplate
  }
  else {
    if (message.text) {
      msg=message.text
    }
  }
  return msg;
}

export function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}