const ns = '[cart/action]';
import logger from 'js-logger'
import { includes } from 'lodash';
import { CALL_API } from '../../middleware/api';
import { ACTION_TYPES as SALESMODEL_ACTION_TYPES } from '../salesmodels/constants';
import CartRulesMiddleware from './cartRulesMiddleware'
import {
  ACTION_TYPES, DEFAULT_CART, QUOTE_CART
} from './constants';
import {normalizeCart} from './schema';
import {initCartData} from './utils'
import { getCartInfo, getTopLevelCartItem, getCartById } from './selectors'
import { validateCart } from './validateCart'

// function getSalesModelItemOffer(salesModleId, offers) {
//   let fn = `${ns}[getSalesModelItemOffer]`
//   let res = Object.keys(offers).map(offerId => {
//     return offers[offerId]
//   }).filter(offer => {
//     let bFound = false
//     for (var sl of offer.salesModels) {
//       if (sl.salesModel == salesModleId) {
//         return true;
//       }
//     }
//     return false
//   });
//   return res.length ? res[0] : null;
// }
export function preloadCart(cart) {
  return {
    type: ACTION_TYPES.FETCH_CART_SUCCESS,
    payload: normalizeCart({ data: cart }),
    loaded: true,
  }
}
export function fetchCart(offerIdentifier = 'default') {
  let fn = `${ns}[fetchCart]`
  return (dispatch, getState) => {
    const state = getState();
    logger.info(fn, 'begin');
    return dispatch({
      [CALL_API]: {
        endpoint: `cart/`,
        options: { method: 'GET' },
        types: [
          ACTION_TYPES.FETCH_CART,
          ACTION_TYPES.FETCH_CART_SUCCESS,
          ACTION_TYPES.FETCH_CART_FAILURE
        ],
        meta: {
          offerIdentifier
        },
        normalizer: (response) => {
          let { offers } = state.entities;        
          logger.info(fn, 'normalizer: response', response); 
          let normalCart = normalizeCart(response, state);
          logger.info(fn, 'normalCart', normalCart); 
          return normalCart;
          // let { cartItems } = normalCart.entities;
          // Object.keys(cartItems).forEach(cartItemId => {
          //   let cartItem = cartItems[cartItemId];
          //   if (cartItem.level == 0) {
          //     let offer = getSalesModelItemOffer(cartItem.salesModel, offers);
          //     logger.info(fn, 'cartItem', cartItem, offer);
          //     cartItem.offerIdentifier = offer ? offer.identifier : ''
          //   }
          // })
          // //need to find cores
          // return normalCart;
        }
      }
    })
  }  
}

function getSumOfAttributesByTag(state, props) {
  let fn = `${ns}[getSumOfAttributesByTag]`
  let { offerIdentifier, salesModel,
    salesModelItem,
    salesModelItemAttributes,
    selectedAttributes,
    salesItemQty,
    tagName,
    attributeIdentifier,
  } = props;
  let totalQty = 0;
  for (var attrId of (salesModelItem.attributes || [])) {
    let attribute = salesModelItemAttributes[attrId];
    let attrkey = `${salesModelItem.identifier}..${attribute.identifier}`;
    let attributeQty = selectedAttributes[attrkey]
      && selectedAttributes[attrkey].quantity || 0;
    let isPrepopulated = selectedAttributes[attrkey] && selectedAttributes[attrkey].selectedOptions
      && selectedAttributes[attrkey].selectedOptions.helper && selectedAttributes[attrkey].selectedOptions.helper.internal 
      && selectedAttributes[attrkey].selectedOptions.helper.internal.prepopulated || false;
      // logger.info(fn, 'prepopluate items', { tagName, attributeQty, attributeIdentifier });
    if (attribute.tags.indexOf(tagName) > -1 && attribute.identifier != attributeIdentifier && attributeQty && !isPrepopulated) {
      
      totalQty += attributeQty;
    }
  }
  // logger.info(fn, 'prepopluate items totalQty:', totalQty);
  return totalQty;
}

function getSalemodelItemPrepopulateAttrib(state, props) {
  let fn = `${ns}[getSalemodelItemPrepopulateAttrib]`
  let { offerIdentifier, salesModel,
    salesModelItem,
    selectedAttribute,
    salesModelItemAttributes,
    selectedAttributes,
    salesItemQty,
    forcePrepopulate,
    switchPrepopulatedItems
  } = props;
  if (!salesModel || !salesModelItem) {
    return;
  }
  let { rules } = salesModel;
  let prePopulateVals = [];
  for (var rl of rules) {
    if (rl.event == 'before-config-init-cart' && rl.identifier == 'prepopulate-other-items') {
      let tag = '';
      let identifier = '';
      let follow = '';
      for (var prm of rl.parameters) {
        if (prm.parameter == 'tag') {
          tag = prm.value
        }
        if (prm.parameter == 'identifier') {
          identifier = prm.value
        }
        if (prm.parameter == 'follow') {
          follow = prm.value
        }
      }
      prePopulateVals.push({ tag, identifier, follow });
    }
  }
  if (!prePopulateVals.length) {
    return [];
  } 

  let prePoluateItems = [];
  for (var attrId of (salesModelItem.attributes || [])) {
    let attribute = salesModelItemAttributes[attrId];
    let attrkey = `${salesModelItem.identifier}..${attribute.identifier}`;
    let selectedOptions = selectedAttributes[attrkey] && selectedAttributes[attrkey].selectedOptions
    let attributeQty = selectedAttributes[attrkey]
      && selectedAttributes[attrkey].quantity || 0;    
    let isPrepopulated = selectedOptions && selectedOptions.helper && selectedOptions.helper.internal && selectedOptions.helper.internal.prepopulated || false;
    //if preppopulate ignore
    for (var prep of prePopulateVals) {
      let curAttributeQty = getSumOfAttributesByTag(state, {...props, tagName: prep.tag, attributeIdentifier: attribute.identifier})
      if (attribute.tags.indexOf(prep.tag) > -1
        && attribute.identifier == prep.identifier
        && !(selectedAttribute && selectedAttribute._id ==attribute._id)
      ) {
        // prePoluateItems.push(attribute);
        
        logger.info(fn, 'prepopluate items',
          {
            attrkey,
            attribute,
            selectedOptions,
            curAttributeQty,
            isPrepopulated,
            forcePrepopulate,
            selectedAttributes,
            switchPrepopulatedItems
          });
        //if selected item is set by user don't change.
        if (isPrepopulated || forcePrepopulate || (!selectedOptions && switchPrepopulatedItems)) {
          if ((salesItemQty - curAttributeQty > 0 || salesItemQty != attributeQty)) {          
            selectedOptions = selectedOptions || {}
            selectedOptions.helper = selectedOptions.helper || {};
            selectedOptions.helper.internal = selectedOptions.helper.internal || {};
            selectedOptions.helper.internal.prepopulated = true; 
            selectedOptions.helper.internal.follow = prep.follow;
            logger.info(fn, 'prepopulating....', salesItemQty - curAttributeQty, attribute, selectedOptions); 
            //need to get quantity of other similar selection and add the difference.
            CartRulesMiddleware.addItem(salesItemQty - curAttributeQty,
              offerIdentifier,
              salesModel,
              salesModelItem,
              attribute,
              selectedOptions);
          }
        }
        // if ((salesItemQty-curAttributeQty > 0 || salesItemQty!=attributeQty) && (!isPrepopulated || forcePrepopulate)) {
          
        //   selectedOptions.helper = selectedOptions.helper || {}
        //   selectedOptions.helper.internal.prepopulated = forcePrepopulate;
        //   selectedOptions.helper.internal.follow = prep.follow;
          
        //   //need to get quantity of other similar selection and add the difference.
        //   CartRulesMiddleware.addItem(salesItemQty - curAttributeQty,
        //     offerIdentifier,
        //     salesModel,
        //     salesModelItem,
        //     attribute,
        //     selectedOptions);
        // }
      }
    }
  }
}


function initCartInfo(state, options) {
  let fn = `${ns}[initCartInfo]`
  let {
    offerIdentifier = '',
    salesModel = null,
    cartKey='',
    forcePrepopulate,
    ignoreDefaultQty,
    switchPrepopulatedItems,
    reuseCartCustomerInfo,
    contact,
    billingAddress,
    shippingAddress,
    company,
    quote,
    partner,
    partnerAgent,
    resetOtherInfo=true
  } = options
  logger.info(fn, { offerIdentifier, salesModel, cartKey, forcePrepopulate, ignoreDefaultQty });
  let { cartByOffer, regions = {} } = state.status;
  // let { currentRegion: curRegion } = regions;
  let currentRegion = regions.currentRegion && regions.currentRegion.data || {};
  let { salesModels, salesModelItems, salesModelItemAttributes } = state.entities;
  cartKey = cartKey || offerIdentifier;
  // let isCartData = (cartKey == 'default')
  let cartStatus = cartByOffer[cartKey] || { }
  let { selectedSalesModelItems = {}, selectedAttributes = {}} = cartStatus
  //read current cart state.
  let cart = getCartById(state, cartStatus);
  // if (cart) {
  //   let items = (cart.items || []).map(itemId => {
  //     return cartItems[itemId];
  //   });
  // }

  logger.info(fn, { region: currentRegion.shortCode, currency: currentRegion.currency || cart.currency }, cart, cartKey);
  CartRulesMiddleware.initCart(currentRegion.shortCode || cart.region, currentRegion.currency || cart.currency);
  CartRulesMiddleware.addItem(1, offerIdentifier, salesModel);
  for (var itemId of (salesModel.items||[])) {
    let salesModelItem = salesModelItems[itemId];
    let slmItemKey = `${salesModelItem.identifier}`
    let salesItemQty = selectedSalesModelItems[slmItemKey]
    && selectedSalesModelItems[slmItemKey].quantity || (forcePrepopulate && !ignoreDefaultQty && salesModelItem.defaultQuantity) || 0;
    logger.info(fn, offerIdentifier, 'salesModelItem', salesModelItem, 'salesItemQty', salesItemQty, 'forcePrepopulate',
    forcePrepopulate, selectedSalesModelItems[slmItemKey] && selectedSalesModelItems[slmItemKey].selectedOptions);
    if (salesItemQty > 0) {
      CartRulesMiddleware.addItem(salesItemQty, offerIdentifier, salesModel, salesModelItem, null, selectedSalesModelItems[slmItemKey] && selectedSalesModelItems[slmItemKey].selectedOptions);
      
      for (var attrId of (salesModelItem.attributes || [])) {
        let attribute = salesModelItemAttributes[attrId];
        let attrkey = `${salesModelItem.identifier}..${attribute.identifier}`;
        let attributeQty = selectedAttributes[attrkey]
          && selectedAttributes[attrkey].quantity || (forcePrepopulate && !ignoreDefaultQty && attribute.defaultQuantity) || 0;
        let isPrepopulated = selectedAttributes[attrkey] && selectedAttributes[attrkey].selectedOptions
          && selectedAttributes[attrkey].selectedOptions.helper && selectedAttributes[attrkey].selectedOptions.helper.internal 
          && selectedAttributes[attrkey].selectedOptions.helper.internal.prepopulated || false;
          logger.info(fn,'selected attributes:', { offerIdentifier, attrkey, isPrepopulated, attributeQty, selectedAttributes});
        //if prepopluate ignore it
        if (attributeQty > 0 && !isPrepopulated) {            
          CartRulesMiddleware.addItem(attributeQty,
            offerIdentifier,
            salesModel,
            salesModelItem,
            attribute,
            selectedAttributes[attrkey] && selectedAttributes[attrkey].selectedOptions);
        }
      }
      var prePopulateAttribute = getSalemodelItemPrepopulateAttrib(state, {
        offerIdentifier,
        salesModel,
        salesModelItem,
        salesModelItemAttributes,
        selectedAttributes,
        salesItemQty,
        forcePrepopulate,
        switchPrepopulatedItems
      })
    }
  }
  let updatedCart = CartRulesMiddleware.updateCart();
  updatedCart._id = cartStatus.cartId;
  updatedCart.contact = contact || reuseCartCustomerInfo && cart.contact || updatedCart.contact;
  updatedCart.company = company || reuseCartCustomerInfo && cart.company ||updatedCart.company;
  updatedCart.billingAddress = billingAddress || reuseCartCustomerInfo && cart.billingAddress || updatedCart.billingAddress;
  updatedCart.shippingAddress = shippingAddress || reuseCartCustomerInfo && cart.shippingAddress || updatedCart.shippingAddress;
  updatedCart.quote = quote || reuseCartCustomerInfo && cart.quote || updatedCart.quote;
  updatedCart.partner = partner || reuseCartCustomerInfo && cart.partner || updatedCart.partner;
  updatedCart.partnerAgent = partnerAgent || reuseCartCustomerInfo && cart.partnerAgent || updatedCart.partnerAgent;
  updatedCart.resetOtherInfo = resetOtherInfo;
  // updatedCart.region = region || reuseCartCustomerInfo && cart.region || updatedCart.region;
  // updatedCart.currency = currency || reuseCartCustomerInfo && cart.currency || updatedCart.currency;
  return updatedCart;
}

export function initCartWithQuote(options = {}) {
  let fn = `${ns}[initCartWithQuote]`
  return (dispatch, getState) => {
    const state = getState();
    let quote = getCartInfo(state, { offer: { identifier: QUOTE_CART } });
    let cartMainItem = getTopLevelCartItem(state, { identifier: QUOTE_CART });
    dispatch({
      type: SALESMODEL_ACTION_TYPES.SET_DEFAULT_SALESMODEL,
      payload: { offer: cartMainItem.offer, salesModel: cartMainItem.salesModel }
    })
    
    logger.info(fn, 'cartMainItem', cartMainItem);
    let updatedCart = initCartInfo(state, {
      offerIdentifier: cartMainItem.offer.identifier,
      salesModel: cartMainItem.salesModel,
      cartKey: QUOTE_CART,
      // contact: quote.contact,
      company: quote.company,
      billingAddress: quote.billingAddress,
      shippingAddress: quote.shippingAddress,
      partner: quote.partner,
      partnerAgent: quote.partnerAgent,
      quote: quote._id,
      resetOtherInfo: false
    });
    return dispatch({
      type: ACTION_TYPES.INIT_CART_SUCCESS,
      payload: normalizeCart({data: updatedCart}),
      offerIdentifier: cartMainItem.offer.identifier
    })
  }
}

export function resetCartInfo(options) {
  let fn = `${ns}[resetCartInfo]`
  return (dispatch, getState) => {
    const state = getState();
    let {
      offerIdentifier = '',
      salesModel = null,
      cartKey
    } = options;
    let cart = getCartInfo(state, { offer: { identifier: offerIdentifier } });    
    return dispatch({
      type: ACTION_TYPES.RESET_CART_INFO,
      offerIdentifier,
      payload: { cart }
    })
  }
}


export function initCartInfoByOffer(options) {
  let fn = `${ns}[initCartInfoByOffer]`
  return (dispatch, getState) => {
    const state = getState();
    let {
      offerIdentifier = '',
      salesModel = null,
      cartKey
    } = options;
    let updatedCart = initCartInfo(state, options);
    return dispatch({
      type: ACTION_TYPES.INIT_CART_SUCCESS,
      payload: normalizeCart({data: updatedCart}),
      offerIdentifier
    })
  }
}

export function initCartBuble() {
  let fn = `${ns}[initCartBuble]`;   
  return (dispatch, getState) => {
    const state = getState();    
    let {cartItems, salesModels, salesModelItems, salesModelItemAttributes} = state.entities;
    let cart = getCartInfo(state, { offer: { identifier: 'default' } });
    logger.info(fn, 'CART: ', cart);
    
    let noOfItems = 0;
    for (var itemId of cart.items || []) {
      if (!cartItems[itemId].level) {
        noOfItems +=1
      }
    }

    $('.nav li .cart .bubble').remove();
    if (noOfItems > 0) {
      $('.nav li .cart').append($('<div class="bubble">' + noOfItems + '</div>'));  
    }    
    
  }  
}

export function removeItemFromCart(offerIdentifier = '', salesModel = null, salesModelItem = null, attribute = null, cartOfferIdentifer) {
  let fn = `${ns}[removeItemFromCart]`;
  return (dispatch, getState) => {
    const state = getState();
    cartOfferIdentifer = cartOfferIdentifer || offerIdentifier;
    let { cartItems, salesModels, salesModelItems, salesModelItemAttributes } = state.entities;
    let cart = getCartInfo(state, { offer: { identifier: cartOfferIdentifer } });

    var removedItems = [];

    logger.info(fn, 'item to be deleted', {
      salesModel,
      salesModelItem,
      attribute
    });

    for (let itemId of cart.items || []) {
      let item = cartItems[itemId];
      if (
        //remove item
        (item.salesModel == (salesModel && salesModel._id)
          && item.salesModelItem == (salesModelItem && salesModelItem._id)
          && item.attribute == (attribute && attribute._id))
        
        //remove first child level items if any
        || (item.salesModel == (salesModel && salesModel._id) && !salesModelItem && !attribute)

        //remove second child level items if any
        || (item.salesModel == (salesModel && salesModel._id)
          && item.salesModelItem == (salesModelItem && salesModelItem._id) && !attribute)
      ) {
        removedItems.push(itemId)
      }
      else {
        logger.info(fn, 'ignoring item:', item)
      }
    }
    logger.info(fn, 'removedItems==', removedItems);
    return Promise.all([
      dispatch({
        type: ACTION_TYPES.CLEAR_CART,
        payload: { cart: { ...cart, items: [...removedItems] } },
        offerIdentifier
      }),
      dispatch(initCartBuble(offerIdentifier)),
      dispatch(deleteCart(offerIdentifier))
    ]);
  };
}

export function validateCartInfo(params) {
  let fn = `${ns}[validateCartInfo]`;
  let {
    cartOfferIdentifer,
    fields = [],
  } = params;
  // let cartValidationHandler = 0;
  // clearTimeout(cartValidationHandler);
  // cartValidationHandler = setTimeout(() => {
    return (dispatch, getState) => {
      const state = getState();
      let { currentRegion = {} } = state.status.regions;
      let cartStatus = state.status.cartByOffer[cartOfferIdentifer] || { }
      let cart = getCartInfo(state, { offer: { identifier: cartOfferIdentifer } });
      let warnings = validateCart(cart, cartStatus.shippingSameAsBilling, currentRegion);
      return dispatch({
        type: ACTION_TYPES.CART_VALIDATION,
        payload: {
          warnings
        },
        offerIdentifier: cartOfferIdentifer
      })
    }
  // }, 500);
}

export function clearCartWarnings(params) {
  let fn = `${ns}[clearCartWarnings]`;
  let {
    cartOfferIdentifer,
    fields = [],
  } = params;

  return (dispatch, getState) => {
    const state = getState();
    return dispatch({
      type: ACTION_TYPES.CLEAR_CART_WARNINGS,
      payload: {
        fields
      },
      offerIdentifier: cartOfferIdentifer
    })
  }
}

export function setCartShippingSameAsBilling(params) {
  let fn = `${ns}[setCartShippingSameAsBilling]`; 
  let {
    cartOfferIdentifer,
    sameAsBilling
  } = params;

  return (dispatch, getState) => {
    const state = getState();
    return dispatch({
      type: ACTION_TYPES.SET_CART_SHIPPING_SAME_AS_BILLING,
      payload: {        
        shippingSameAsBilling: sameAsBilling
      },
      offerIdentifier: cartOfferIdentifer
    })  
  }    
}

export function updateAccountInfo(params) {
  let fn = `${ns}[updateCartAccountInfo]`; 
  let {
    cartOfferIdentifer,
    contact,
    company,
    billingAddress,
    shippingAddress,
    // sameAsBilling
  } = params;

  logger.info(fn, company);

  return (dispatch, getState) => {
    const state = getState();
    let cartStatus = state.status.cartByOffer[cartOfferIdentifer] || { }
    let cart = getCartInfo(state, {offer: {identifier: cartOfferIdentifer}});
    return dispatch({
      type: ACTION_TYPES.UPDATE_CART_ACCOUNT_INFO,
      payload: { 
        _id : cart._id,
        contact,
        company,
        billingAddress,
        shippingAddress: shippingAddress,
        sameAsBilling: cartStatus.shippingSameAsBilling
      },
      offerIdentifier: cartOfferIdentifer
    })       
    

  }
}

export function updatePartnerInfo(params) {
  let fn = `${ns}[updatePartnerInfo]`; 
  let {
    cartOfferIdentifer,
    partnerId,
    partnerAgentId
  } = params;

  return (dispatch, getState) => {
    const state = getState();
    let cart = getCartInfo(state, {offer: {identifier: cartOfferIdentifer}});
    return dispatch({
      type: ACTION_TYPES.UPDATE_CART_PARTNER_INFO,
      payload: { 
        _id : cart._id,
        partnerId,
        partnerAgentId
      },
      offerIdentifier: cartOfferIdentifer
    })
  }
}

export function addItemToCart(params) {
  let fn = `${ns}[addItemToCart]`; 
  let {
    offerIdentifier = '',
    quantity,
    salesModel,
    salesModelItem,
    attribute,
    selectedOptions,
    cartOfferIdentifer,
    forcePrepopulate
  } = params;
  return (dispatch, getState) => {
    // logger.info(fn, 'begin', quantity, salesModel, salesModelItem, attribute)
    const state = getState();
    cartOfferIdentifer = cartOfferIdentifer || offerIdentifier;
    let {cartItems, salesModels, salesModelItems, salesModelItemAttributes} = state.entities;
    let cart = getCartInfo(state, {offer: {identifier: cartOfferIdentifer}});
    let items = (cart.items || []).map(itemId=>{
      return cartItems[itemId];
    })
    
    dispatch({
      type: ACTION_TYPES.CLEAR_CART,
      payload: {cart:{...cart, items: [...cart.items]}},
      offerIdentifier
    })

    let updatedCart = convertCartToJson({
      state, 
      cart, 
      offerIdentifier, 
      quantity, 
      salesModel, 
      salesModelItem, 
      attribute,
      selectedOptions,
      forcePrepopulate,
    })        
    logger.info(fn, 'updatedCart:', updatedCart);
    return dispatch({
      type: ACTION_TYPES.INIT_CART_SUCCESS,
      payload: normalizeCart({data: updatedCart}),
      offerIdentifier
    })
  }
}

function getItemLevel(salesModel, salesModelItem, attribute) {
  // salesmodel only is level=0;
  // salesModel && salesModelItem level=1;
  // salesModel && salesModelItem && atrribute level 2
  return (salesModel && salesModelItem && attribute)
  ? 2
  : (salesModel && salesModelItem)
    ? 1
    : salesModel ? 0
  : -1;
}

export function convertCartToJson(options) {
  let fn = `${ns}[convertCartToJson]`;  
  let { state,
    cart,
    offerIdentifier,
    quantity,
    salesModel = null,
    salesModelItem = null,
    attribute = null,
    selectedOptions,
    forcePrepopulate,
    switchPrepopulatedItems,
  } = options
  let { regions } = state.status;
  let currentRegion = regions.currentRegion && regions.currentRegion.data || {};
  let cartStatus = state.status.cartByOffer[offerIdentifier] || { }
  let { selectedSalesModelItems = {}, selectedAttributes = {}} = cartStatus
  let {cartItems, salesModels, salesModelItems, salesModelItemAttributes} = state.entities;    
  let items = (cart.items || []).map(itemId=>{
    return cartItems[itemId];
  })
  logger.info(fn, 'currentRegion', currentRegion);
  CartRulesMiddleware.initCart(currentRegion.shortCode, currentRegion.currency);

  let isItemAdded = false;
  let itemsToPopulate = [];
  for (let item of items) {      
    let slMItemAttr = salesModelItemAttributes[item.attribute] || null;
    logger.info(fn, 'cart item', {item, slMItemAttr, attribute});
    if (
      item.salesModel == (salesModel && salesModel._id)
      && item.salesModelItem == (salesModelItem && salesModelItem._id)
      && item.attribute == (attribute && attribute._id)
    ) {
      logger.info(fn, 'change same item in the cart', {item});
      // if (selectedOptions && selectedOptions.helper && !forcePrepopulate) {
      //   delete selectedOptions.helper.internal.prepopulated;
      //   delete selectedOptions.helper.internal.follow;
      // }
      CartRulesMiddleware.addItem(quantity, offerIdentifier, salesModel, salesModelItem, attribute, selectedOptions);
      isItemAdded = true;
    }
    else {
      //other items in the cart
      let slM = salesModels[item.salesModel] || null;
      let slMItem = salesModelItems[item.salesModelItem] || null;
      
      let itmSelectedOptions = item.selectedOptions
      let itemQty = item.quantity;
      
      //change quantity for prepopulate items
      //we check if follow option is same as the item's tag
      if (item.salesModel == (salesModel && salesModel._id)
        && item.salesModelItem == (salesModelItem && salesModelItem._id)
        && (!attribute || !attribute._id)
        && itmSelectedOptions && itmSelectedOptions.helper && itmSelectedOptions.helper.internal 
        && itmSelectedOptions.helper.internal.prepopulated
        && itmSelectedOptions.helper.internal.follow == 'parent'
        // && salesModelItem.tags.indexOf(itmSelectedOptions.helper.internal.follow)
      ) {
        logger.info(fn, 'item quanithy follow parent', itemQty, quantity, itmSelectedOptions)
      }
      else {        
        CartRulesMiddleware.addItem(itemQty, offerIdentifier, slM, slMItem, slMItemAttr, itmSelectedOptions);
      }
    }     
  }
  
  if (!isItemAdded && quantity && salesModel) {
    CartRulesMiddleware.addItem(quantity, offerIdentifier, salesModel, salesModelItem, attribute, selectedOptions);  
  }
  var prePopulateAttribute = getSalemodelItemPrepopulateAttrib(state, {
    offerIdentifier,
    salesModel,
    salesModelItem,
    selectedAttribute: attribute,
    salesModelItemAttributes,
    selectedAttributes,
    salesItemQty: quantity,
    forcePrepopulate,
    switchPrepopulatedItems
  }); 

  logger.info(fn, 'selectedOptions==', selectedOptions, 'partnerAgent', cart);
  let updatedCart = CartRulesMiddleware.updateCart();
  updatedCart._id = updatedCart._id || cart._id;
  updatedCart.contact = cart.contact || updatedCart.contact
  updatedCart.company = cart.company || updatedCart.company
  updatedCart.billingAddress = cart.billingAddress || updatedCart.billingAddress
  updatedCart.shippingAddress = cartStatus.shippingSameAsBilling
    ? updatedCart.billingAddress
    : cart.shippingAddress || updatedCart.shippingAddress

  updatedCart.partner = cart.partner || updatedCart.partner
  updatedCart.partnerAgent = cart.partnerAgent || updatedCart.partnerAgent
  updatedCart.quote = cart.quote || updatedCart.quote
  updatedCart.resetOtherInfo = cart.resetOtherInfo || updatedCart.resetOtherInfo

  logger.info(fn, 'updatedCart:', updatedCart);
  return updatedCart;
}

export function sanitizeCartPayload(cart, resetOtherInfo) {
  if(cart) {
    delete cart._id;
    delete cart.created;
    if (resetOtherInfo) {
      delete cart.company;
      delete cart.contact;
      delete cart.billingAddress;
      delete cart.shippingAddress;
      delete cart.partner;
      delete cart.partnerAgent;
      delete cart.quote;
    }

    for (var item of cart.items || []) {
      if (item.attribute && item.attribute.helper) {
        // delete item.attribute.helper.internal.prepopulated;
        // delete item.attribute.helper.internal.follow;
      }
    }
    cart = CartRulesMiddleware.sanitizeCart(cart);

    return { ...cart };//
  }
  return cart;
}
export function createCart(offerIdentifier) {
  let fn = `${ns}[createCart]`;   
  return (dispatch, getState) => {    
    const state = getState();    
    let cart = getCartInfo(state, {offer: {identifier: offerIdentifier}});
    let updatedCart = sanitizeCartPayload(convertCartToJson({ state, cart, offerIdentifier }), cart.resetOtherInfo);
    delete updatedCart.contact; //contact should not pushed to cart
    
    logger.info(fn, 'updatedCart:', updatedCart);
    return dispatch({
      [CALL_API]: {
        endpoint: 'cart/',
        options: {
          method: 'POST',
          body: JSON.stringify(updatedCart)
        },
        types: [
          ACTION_TYPES.CREATE_CART,
          ACTION_TYPES.CREATE_CART_SUCCESS,
          ACTION_TYPES.CREATE_CART_FAILURE
        ],
        meta: {
          offerIdentifier
        },
        normalizer: (response) => {
          let normalCart = normalizeCart(response, state);
          logger.info(fn, 'normalCart', normalCart); 
          return {
            // warnings: response.warnings || [],
            ...normalCart
          };
        }
      }
    });
  }
}

export function deleteCart(offerIdentifier) {
  let fn = `${ns}[deleteCart]`;   
  return (dispatch, getState) => {    
    const state = getState();    
    let cart = getCartInfo(state, {offer: {identifier: offerIdentifier}});
    return dispatch({
      [CALL_API]: {
        endpoint: 'cart/',
        options: {
          method: 'delete',
        },
        types: [
          ACTION_TYPES.DELETE_CART,
          ACTION_TYPES.DELETE_CART_SUCCESS,
          ACTION_TYPES.DELETE_CART_FAILURE
        ],
        meta: {
          offerIdentifier
        }
      }
    });
  }
}

export function updateCart(productId, data = {}) {
  return {
    [CALL_API]: {
      endpoint: `products/${productId}`,
      options: { method: 'POST', body: JSON.stringify(data) },
      types: [
        ACTION_TYPES.UPDATE_OFFER,
        ACTION_TYPES.UPDATE_OFFER_SUCCESS,
        ACTION_TYPES.UPDATE_OFFER_ERROR
      ],
      schema: Schemas.OFFER
    }
  };
}

export function sendCartSummary() {
  return (dispatch, getState) => {
    return dispatch({
      [CALL_API]: {
        endpoint: `cart/sendsummary`,
        options: { method: 'POST' },
        types: [
          ACTION_TYPES.SEND_CART_SUMMARY,
          ACTION_TYPES.SEND_CART_SUMMARY_SUCCESS,
          ACTION_TYPES.SEND_CART_SUMMARY_ERROR
        ]
      }
    });
  };
}
