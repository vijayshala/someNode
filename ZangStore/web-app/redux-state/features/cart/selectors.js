

const ns = '[cart/selectors]';
import logger from 'js-logger'
import { createSelector } from 'reselect';
import { USER_BASED_PRODUCTS } from '../products/constants'
import { getWarningMessage, getLableFromDescriptions, translateResourceField } from '../../utils'
import { getSalesModelItemsByTag, getSalesItemAttributesByTag } from '../salesmodels/selectors'
import CartBody from '../../../views/components/Cart/CartBody/CartBody';

export function getCartByOfferidentifier(state, props) {
    let { cartByOffer } = state.status;
    let { offer, selected } = props;
    let res = {}
    if(offer && offer.identifier) {
        return cartByOffer[offer.identifier] || {}        
    }
    return {}
}

export function getCartInfo(state, props) {       
    let cartOffer = getCartByOfferidentifier(state, props)
    return getCartById(state, cartOffer);
}

export function getCartSubItemsByTag(state, props) {
    let fn = `${ns}[getCartSubItemsByTag]`;    
    let { offer, salesModel, salesModelItem, tagName } = props;  
    let { cartByOffer, selectedOffer } = state.status;
    if (!offer || !salesModel || !salesModelItem) {
        logger.warn(fn, 'invalid params', props)
        return {};
    }
    
    let cart = getCartInfo(state, { offer });
    let sellableAttributes = getSalesItemAttributesByTag(state, {
        salesModelItem,
        tagName
    });

    let selectedAttributes = cartByOffer[selectedOffer.identifier]
        && cartByOffer[selectedOffer.identifier].selectedAttributes
        || {};
    
    // logger.info(fn, 'sellableAttributes:', sellableAttributes);
    let reccuringSubTotal = 0//cartItem.quantity * cartItem.price;
    let oneTimeTotal = 0;
    let numOfAddonsSelected = 0;
    let selectedAddonName = '';
    let totalQty = 0;
    let attributes = sellableAttributes.map(attribute => {
        let attrIdentifer = `${salesModelItem.identifier}..${attribute.identifier}`;
        let attrQty = selectedAttributes[attrIdentifer]
            && selectedAttributes[attrIdentifer].quantity || 0 
        let attrPrice = attribute.price || 0
        if (attribute.isOneTimeCharge) {
            oneTimeTotal += (attrQty * attrPrice)
        }
        else {
            reccuringSubTotal += (attrQty * attrPrice)
        }
        selectedAddonName = attribute.title
            ? attribute.title.resource ? global.localizer.get(attribute.title.resource)
                : attribute.title.text
            : ''
        numOfAddonsSelected += attrQty ? 1 : 0
        totalQty += attrQty;
        // logger.info(fn, 'attribute:', attribute);
        return {
            currency: salesModel.currency,
            addon: attribute,
            quantity: attrQty,
            showQuantityInput: !attribute.followParentQuantity,
            // onChange: (quantity) => {
            //     // logger.info(ns, 'attribute', attribute, 'quantity:', quantity );
            //     this.props.updateQtyItemToCart(quantity ? primaryQuantity : 0, attribute)
            // }
        }
    });

    return {
        salesModelItem,
        attributes,
        oneTimeTotal,
        reccuringSubTotal,
        totalQty,
        numOfAddonsSelected,
        selectedAddonName
    }
}

export function getCartItemInfo(state, props) {
    let fn = `${ns}[getCartItemInfo]`;
    let { cartItems } = state.entities;
    let { offer, salesModel, salesModelItem, attribute } = props;
    let cartInfo = getCartInfo(state, props);

    for (var itemId of (cartInfo.items || [])) {
        let item = cartItems[itemId];
        // logger.info(fn, 'item:', item, 
        //     'salesModel',(salesModel && salesModel._id),
        //     'salesModelItem', (salesModelItem && salesModelItem._id),
        //     'attribute', (attribute && attribute._id)
        // )
        if(
            item.salesModel == (salesModel && salesModel._id)
            && item.salesModelItem == (salesModelItem && salesModelItem._id)
            && item.attribute == (attribute && attribute._id)
        ){
            return item;
        }
    }
    return null;
}

export function getTopLevelCartItem(state, props) {
    let fn = `${ns}[getTopLevelCartItem]`;
    let { cartByOffer } = state.status;
    let { cart, cartItems, offers, salesModels } = state.entities;
    let { identifier } = props;
    let cartOffer = cartByOffer[identifier];
    let curCart = cartOffer && cart[cartOffer.cartId];
    if (curCart) {
        for (var cartItemId of curCart.items || []) {
            let item = cartItems[cartItemId];            
            if (item.level == 0) {
                // logger.info(fn, item)
                return {
                    ...item,
                    offer: offers[item.offer],
                    salesModel: salesModels[item.salesModel]
                }
            }
        }
    }
    return null;
}

export function getCartOntimeSubtotalWithoutDiscount(state, props) {
    let fn = `${ns}[getCartOntimeSubtotalWithoutDiscount]`;
    let { cartByOffer } = state.status;
    let { cartItems, salesModels, salesModelItems, salesModelItemAttributes } = state.entities;
    let { offer, salesModel, salesModelItem, attribute } = props;
    let offerIdentifier = offer.identifier;
    let cartOffer = cartByOffer[offerIdentifier];
    
    if (!cartOffer) {
        return null;
    }    
    let cartInfo = getCartById(state, cartOffer);
    let ontimeSubTotal = 0;
    let recurringSubTotal = 0;
    for (var itemId of (cartInfo.items || [])) {
        let item = cartItems[itemId];
        if (item.price > 0) {
            if (item.isOneTimeCharge) {
                ontimeSubTotal += item.price * item.quantity
            }
            else {
                recurringSubTotal += item.price * item.quantity
            }
        }
    }
    return { onetime: ontimeSubTotal, subscription: recurringSubTotal };
}

export function getCurrentCartItemInfo(state, props) {
    let fn = `${ns}[getCurrentCartItemInfo]`;
    let { cartByOffer } = state.status;
    let { cartItems, salesModels, salesModelItems, salesModelItemAttributes } = state.entities;
    let { offer, salesModel, salesModelItem, attribute } = props;
    let cartOffer = cartByOffer['default'];
    
    if (!cartOffer) {
        return null;
    }    
    let cartInfo = getCartById(state, cartOffer);

    for (var itemId of (cartInfo.items || [])) {
        let item = cartItems[itemId];
        // logger.info(fn, 'item:', item, 
        //     'salesModel',(salesModel && salesModel._id),
        //     'salesModelItem', (salesModelItem && salesModelItem._id),
        //     'attribute', (attribute && attribute._id)
        // )
        if(
            item.salesModel == (salesModel && salesModel._id)
            && item.salesModelItem == (salesModelItem && salesModelItem._id)
            && item.attribute == (attribute && attribute._id)
        ){
            return {...item, salesModel, salesModelItem, attribute} ;
        }
    }
    return null;
}

export function getSalesModelItemRules(ruleIdentifier) {

}

function getRuleParameter(rule, parameterName) {
    for (var param of rule.parameters) {
        if (param == parameterName) {
            return param;
        }
    }
    return null
}

const TAG_NAMES = {
    'user-types' : 'USERS'
}
function tagNameToText(tagName) {
    global.localizer.get(TAG_NAMES[tagName]);
}

export function getSalesModelItemsVolumeDiscountInfo(state, props) {
    let fn = `${ns}[getSalesModelItemsVolumeDiscountInfo]`;
    let { offer, salesModel, tagName } = props;
    if (!salesModel || !offer) {
        logger.warn(fn, 'invalid params', props);
        return [];
    }
   
    let slmItemsUserTypes = getSalesModelItemsByTag(state, {
        salesModelId: salesModel._id,
        tagName
    });


    let volumeDiscountGrid = []
    let header = [];
    let firstColumn = [{ label: global.localizer.get('USERS'), identifier: 'header' }];
    let rows = []
    slmItemsUserTypes.map(slmItem => {
        qtyBasedRule = null;
        header.push(
            translateResourceField(getLableFromDescriptions(slmItem, 'short-title'))
        );
        let columnsDone = false;
        slmItem.rules.map(rule => {            
            if (rule.identifier == 'quantity-based-price') {
                let parameter = getRuleParameter(rule, 'prices');
                if (parameter && parameter.value && parameter.value.length) {
                    for (var price of parameter.value) {
                        let range = '';
                        if (!price.minQuantity && price.maxQuantity) {
                            range='1 - ' + price.maxQuantity
                        } else                         if (price.minQuantity && !price.maxQuantity) {
                            minQuantity = '+'
                            range= price.maxQuantity + '+'
                        }
                        else {
                            range= price.minQuantity + ' + ' + price.maxQuantity
                        }
                        if (!columnsDone) {
                            firstColumn.push({
                                range,
                                unitType: tagNameToText(tagName)
                            })  
                        }
                                               
                    }
                    columnsDone = true;
                }                
            }
        });
    });
}

export function getSalesModelItemsPriceFromCart(state, props) {
    let fn = `${ns}[getSalesModelItemsPriceFromCart]`;    
    let { offer, salesModel, tagName, currency, totalCalculationMode='include-sales-model-item', attributesTagName } = props;
    let { cart, cartItems } = state.entities;
    let { cartByOffer, selectedOffer } = state.status;  
    let offerIdentifier = offer.identifier;
    if (!salesModel
        || !offerIdentifier
        || !cartByOffer[offerIdentifier]
        || !cartByOffer[offerIdentifier].cartId)
    {
        logger.warn(fn, 'invalid params', props);
        return [];    
    }
    
    let selectedSalesModelItems = cartByOffer[selectedOffer.identifier]
        && cartByOffer[selectedOffer.identifier].selectedSalesModelItems
        || {};
    
    let nonePrimarySalesItems = getSalesModelItemsByTag(state, {
        salesModelId: salesModel._id,
        tagName
      });

    
    let salesItems = nonePrimarySalesItems.map(salesModelItem => {        // let attrQty = 0;

        let selectedItem = selectedSalesModelItems[`${salesModelItem.identifier}`];
        let itemQty = selectedItem && selectedItem.quantity || 0;
        let selectedOptions = selectedItem && selectedItem.selectedOptions  || null;
        let cartItem = getCartItemInfo(state, { offer, salesModel, salesModelItem });
        // logger.info(fn, 'selectedSalesModelItems:',
        //     selectedSalesModelItems,
        //     'id:', `${salesModelItem.identifier}`,
        //     'itemQty:', itemQty,
        //     'itemHelper', itemHelper,
        //     'cartItem:', cartItem);
        
        let reqularPrice = salesModelItem.price;
        let price = cartItem && cartItem.price || salesModelItem.price
        return {
            salesModelItem: { ...salesModelItem, price, reqularPrice },
            quantity: itemQty,
            selectedOptions,
        }
    })

    let reccuringSubTotal = 0//cartItem.quantity * cartItem.price;
    let oneTimeTotal = 0;
    let totalQty = 0;
    let numOfSalesModelItemsSelected = 0;
    let numOfAttributesSelected = 0;
    let selectedSalesModelItemName = '';    
    let salesModelItems = salesItems.map(item => {
        let salesModelItem = item.salesModelItem;
        let itemQty = item.quantity;
        let selectedOptions = item.selectedOptions || null;

        if ((totalCalculationMode == 'include-attributes' || totalCalculationMode == 'include-attributes-only')
            && attributesTagName) {
            let slmItemAttributes = getCartSubItemsByTag(state, { offer, salesModel, salesModelItem, tagName: attributesTagName });
            // logger.info(fn, 'attribes', attributesTagName, slmItemAttributes);
            reccuringSubTotal += slmItemAttributes.reccuringSubTotal
            oneTimeTotal += slmItemAttributes.oneTimeTotal;
            numOfAttributesSelected += slmItemAttributes.totalQty;
        }

        if (totalCalculationMode == 'include-attributes' || totalCalculationMode == 'include-sales-model-item') {
            if (salesModelItem.isOneTimeCharge) {
                oneTimeTotal += (itemQty * salesModelItem.price)
            }
            else {
                reccuringSubTotal += (itemQty * salesModelItem.price)
            }
        }

        if (itemQty > 0) {
            selectedSalesModelItemName = salesModelItem.title
                ? salesModelItem.title.resource ? global.localizer.get(salesModelItem.title.resource)
                    : salesModelItem.title.text
                : ''
        }
        totalQty += itemQty;
        numOfSalesModelItemsSelected += itemQty > 0 ? 1 : 0;
        return {
            currency: salesModel.currency,
            salesModelItem,
            quantity: itemQty,
            selectedOptions,
            showQuantityInput: true,
        }
    }) 

    return {
        totalQty,
        salesModelItems,
        oneTimeTotal,
        reccuringSubTotal,
        numOfSalesModelItemsSelected,
        selectedSalesModelItemName,
        numOfAttributesSelected
    }



    
}



export function getConflictingCartItemWithSameSalesModel(state, props) {
    let fn = `${ns}[getConflictingCartItemWithSameSalesModel]`;
    let { offer, salesModel, tagName } = props;
    let { cart, cartItems, salesModels, offers } = state.entities;
    let { cartByOffer, selectedOffer } = state.status;
    let cartOffer = cartByOffer['default'];
    let cartInfo = cartOffer && getCartById(state, cartOffer);
    
    if (!offer || !salesModel || !cartInfo || !cartInfo.items || !cartInfo.items.length) {
        return null;        
    }

    

    let rules = salesModels[salesModel._id] && salesModels[salesModel._id].rules || [];
    //detect salesmodel rules
    for (let rule of rules) {
        //if salesmodel has remove-other-items rules, 
        if (rule.identifier == 'remove-other-items') {
            for (let param of rule.parameters) {
                if (param.parameter == 'tag') {
                    //detect other salesmodels
                    var conflictingCartItems = Object.keys(salesModels).map(slmKey => {
                        let slm = salesModels[slmKey];
                        let cartItem = getCurrentCartItemInfo(state, { offer, salesModel: slm });
                        // logger.info(fn, 'cartItem:', cartItem);
                        if (slm._id != salesModel._id
                            && (slm.tags || []).indexOf(param.value) > -1
                            && cartItem) {
                            return { ...cartItem, offer: offers[cartItem.offer]};//salesModel: salesModels[cartItem.salesModel] 
                        }
                    }).filter(cartItem => {
                        return cartItem;
                        
                    })                   
                    
                    
                    if (conflictingCartItems.length) {
                        logger.warn(fn, 'conflicting salesmodel Detected', conflictingCartItems,
                        'param', param,                        
                        'salesModel', salesModel);
                        return conflictingCartItems[0]
                    }
                }
            }
        }
    }

    return null;


}

export function getCartById(state, props) {    
    let { cartId } = props;
    return state.entities.cart[cartId] || {};
}

export function getCartPrimarySalesModelQty(state, props) {
    let {cartItems, salesModels, salesModelItems, salesModelItemAttributes} = state.entities;
    let cart = getCartInfo(state, props) || {items:[]}    
    let items = cart.items || [];
    let quantity = 0;
    for(var itemId of items) {
        let item = cartItems[itemId];
        let slM = salesModels[item.salesModel] || null;
        let slMItem = salesModelItems[item.salesModelItem] || null;
        let slMItemAttr = salesModelItemAttributes[item.attribute] || null;
        // logger.info('[getCartPrimarySalesModelQty]', item)
        if(slMItem && slMItem.isPrimary)         {
            return item.quantity
        }
    }
    return 0;
}


function getDiscountInfo() {
    
}

export function getCartDiscountInfo(state, props) {
    let {cartItems, salesModels, salesModelItems, salesModelItemAttributes} = state.entities;
    let cart = getCartInfo(state, props) || {items:[]}    
    let items = cart.items || [];
    let quantity = 0;
    for(var itemId of items) {
        let item = cartItems[itemId];
        let slM = salesModels[item.salesModel] || null;
        let slMItem = salesModelItems[item.salesModelItem] || null;
        let slMItemAttr = salesModelItemAttributes[item.attribute] || null;
        
        if(slMItem && slMItem.isPrimary)         {
            return item.quantity
        }
    }
    return 0;
}

export function getCartWarning(state, props) {
    let { identifier, filters=[] } = props;
    let { selectedOffer, cartByOffer } = state.status  
    let cartOffer = cartByOffer[identifier] || {};
    let warnings = {};
    (cartOffer.warnings || []).filter(warning => {
        return !filters.length || filters.indexOf(warning.reference) > -1;
    }).map(warning => {
        let reference = warning.reference;
        let message = getWarningMessage(warning.message);//global.localizer.get(warning.code)
        warnings[reference] = message;
        return { reference, message }
    });
    logger.info('[getCartWarning]', ns, warnings);
    return warnings
}