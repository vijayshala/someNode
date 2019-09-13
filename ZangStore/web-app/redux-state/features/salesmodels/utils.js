const ns = '[offers/selectors]';
import logger from 'js-logger'
export function getMainDIDSelected(options) {
  let fn = `${ns}[getMainDIDSelected]`  
  let { tagName,
    salesModelItems,
    attributeIdentifier,
  } = options;

  if (!salesModelItems || !salesModelItems.length) {
    return null;
  }

  for (let slmItem of salesModelItems) {
    if (!attributeIdentifier && slmItem.quantity > 0
      || slmItem.salesModelItem.identifier == attributeIdentifier) {
      return slmItem.salesModelItem;
    }
  }
  return null;
}