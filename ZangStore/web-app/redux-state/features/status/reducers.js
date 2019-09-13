const ns = '[status/selectors]';
import logger from 'js-logger'
import { combineReducers } from 'redux';
import { ACTION_TYPES } from './constants';
import { ACTION_TYPES as OFFERS_ACTION_TYPES } from '../offers/constants';
import { ACTION_TYPES as CART_ACTION_TYPES } from '../cart/constants';
import { ACTION_TYPES as SALESMODEL_ACTION_TYPES } from '../salesmodels/constants';
import { ACTION_TYPES as QUOTES_ACTION_TYPES } from '../quotes/constants';
import { ACTION_TYPES as PARTNERS_ACTION_TYPES } from '../partners/constants';
import { ACTION_TYPES as COUNTRIES_ACTION_TYPES } from '../countries/constants';
import { ACTION_TYPES as REGIONS_ACTION_TYPES } from '../regions/constants';
const initialStateShoppingWizardDefaults = {

};

const configurations = (state = {}, action) => {
  const { type, payload, slug } = action;
  switch (type) {
    case ACTION_TYPES.SET_CONFIGURATIONS:
      return {
        ...state,
        ...payload,
        loaded: action.loaded
      }
  }
  return state;
}

const offersWizardDefaults = (state = {}, action) => {
  const { type, payload, slug } = action;
  switch (type) {
    case OFFERS_ACTION_TYPES.FETCH_OFFERS_WIZARD_DEFAULTS:
      return {
        ...state,
        [slug]: {
          fetching: true
        }
      }
    case OFFERS_ACTION_TYPES.FETCH_OFFERS_WIZARD_DEFAULTS_SUCCESS:
      if (payload.data) {
        return {
          ...state,
          [slug]: {
            fetching: false,
            ...payload.data
          }
        }
      }

      return state;
    default:
      return state;
  }
};


const topLevelOffers = (state = {}, action) => {
  const { type, payload, identifier } = action;
  switch (type) {
    case OFFERS_ACTION_TYPES.FETCH_TOPLEVEL_OFFER:
      return {
        ...state,
        [identifier]: {
          fetching: true
        }
      }
    case OFFERS_ACTION_TYPES.FETCH_TOPLEVEL_OFFER_FAILURE:
      return {
        ...state,
        [identifier]: {
          fetching: false,
          error: payload && payload.error || 'FETCH_TOPLEVEL_OFFER_FAILURE'
        }
      }
      break;
    case OFFERS_ACTION_TYPES.FETCH_TOPLEVEL_OFFER_SUCCESS:
      let offerIdentifier = identifier
        || (payload
          && payload.entities
          && payload.entities.offers[payload.result]
          && payload.entities.offers[payload.result].identifier)
      return {
        ...state,
        [offerIdentifier]: {
          fetching: false,
          _id: payload.result
        }
      }

      return state;
    default:
      return state;
  }
};

const salesModelsStatus = (state = {}, action) => {
  const { type, payload, identifier } = action;
  switch (type) {
    case SALESMODEL_ACTION_TYPES.FETCH_SALESMODEL_ERROR:
      return {
        ...state,
        [identifier]: {
          fetching: false,
          error: true
        }
      }

    case SALESMODEL_ACTION_TYPES.FETCH_SALESMODEL:
      return {
        ...state,
        [identifier]: {
          fetching: true
        }
      }
    case SALESMODEL_ACTION_TYPES.FETCH_SALESMODEL_SUCCESS:
      logger.info('[offersSalesModel]', payload)
      if (payload.result) {
        return {
          ...state,
          [identifier]: {
            fetching: false,
            salesModelId: payload.result
          }
        }
      }

      return state;
    default:
      return state;
  }
};

const initialOfferCartItemState = {
  offer: null,
  offerItem: null,
  product: null,
  title: { text: '', resource: '' },
  shortTitle: { text: '', resource: '' },
  qty: 0,
  regularPrice: 0,
  salePrice: 0,
  taxPrice: 0,
  taxCodes: [],
  subscriptionInterval: 0,
  subscriptionPeriod: 'month',
  subscriptionLength: 0,
  subscriptionTrialLength: 0,
  subscriptionTrialPeriod: 'month'
}

const initialOfferCartState = {
  items: [],
  subTotal: 0,
  taxTotal: 0,
  total: 0
}

function initCartData(result) {

}

const offerCartByCategory = (state = {}, action) => {
  const { type, payload, category } = action;
  switch (type) {
    case OFFERS_ACTION_TYPES.FETCH_OFFERS_BY_CATEGORY_ERROR:
      return {
        ...state,
        [category]: {
          fetching: false,
          error: true
        }
      }

    case OFFERS_ACTION_TYPES.FETCH_OFFERS_BY_CATEGORY:
      return {
        ...state,
        [category]: {
          fetching: true
        }
      }
    case OFFERS_ACTION_TYPES.FETCH_OFFERS_BY_CATEGORY_SUCCESS:
      logger.info('[offersByCategory]', payload)
      if (payload.result) {

        return {
          ...state,
          [category]: {
            fetching: false,
            data: initCartData(payload.result)
          }
        }
      }

      return state;
    default:
      return state;
  }
};

let selectedOfferInitialState = {
  category: '',
}

export function selectedOffer(state = { ...selectedOfferInitialState }, action) {
  let fn = `${ns}[selectedOffer]`
  let { type, payload } = action;
  switch (type) {
    // case OFFERS_ACTION_TYPES.SELECT_OFFER_IDENTIFIER:
    //   let { offerIdentifier } = action.payload  
    //   return {
    //     ...state,
    //     identifier: offerIdentifier
    //   }  
    //   break;
    // case CART_ACTION_TYPES.FETCH_CART_SUCCESS:
    //   return {
    //     ...state,
    //     _id: '',
    //     identifier: offerIdentifier, 
    //   }
    // case CART_ACTION_TYPES.FETCH_CART_SUCCESS2:
    //   logger.info(fn, payload);
    //   payload.entities = payload.entities || {};
    //   let { offers, cartItems, salesModels, salesModelItems, salesModelItemAttributes } = payload && payload.entities || {}
    //   let cartItm = cartItems && Object.keys(cartItems);
    //   let selectedOffer = null;
    //   let selectedQty = cartItm && cartItm.length
    //     ? cartItm.map(itemId => {
    //       let item = cartItems[itemId];
    //       let offer = offers[item.offer];
    //       selectedOffer = offer
    //     }) : {}
    //   if (selectedOffer) {
    //     return {
    //       ...state,
    //       _id: selectedOffer._id,
    //       identifier: selectedOffer.identifier, 
    //     } 
    //   }
    //   break; 
    case OFFERS_ACTION_TYPES.SELECT_OFFER:
      return {
        ...state,
        _id: payload.offer._id,
        identifier: payload.offer.identifier,
        useCartData: state.useCartData || '', //action.useCartData,
      }
      break;

    case OFFERS_ACTION_TYPES.SET_USER_CART_DATA_SELECTION:
      return {
        ...state,
        useCartData: action.useCartData,
      }
      break;
  }
  return state;
}



export const cartByOffer = (state = { cartEmailSent: null }, action) => {
  let fn = `${ns}[cartByOffer]`
  const { type, payload, offerIdentifier } = action;
  let cartOffer = null;
  switch (type) {
    case ACTION_TYPES.INIT_STEPPER:
      if (offerIdentifier) {
        return {
          ...state, [offerIdentifier]: {
            ...state[offerIdentifier],
            stepperOptions: { ...payload }
          }
        }
      }
      break;
    case ACTION_TYPES.SET_CURRENT_STEP:
      if (offerIdentifier) {
        let stepperOptions = state[offerIdentifier] && state[offerIdentifier].stepperOptions || {}
        let currentStep = payload.stepNumber || 1;
        return {
          ...state, [offerIdentifier]: {
            ...state[offerIdentifier],
            stepperOptions: {
              ...stepperOptions,
              currentStep,
              // allStepsDone: (currentStep == stepperOptions.totalSteps) || stepperOptions.allStepsDone,              
            }
          }
        }
      }
      break;

    case ACTION_TYPES.SET_STEP_STATUS:
      if (offerIdentifier) {
        let stepperOptions = state[offerIdentifier] && state[offerIdentifier].stepperOptions || { stepsStatus: {} }
        // logger.info(fn, 'stepperOptions[payload.stepNumber]:', stepperOptions, payload.stepNumber, stepperOptions.stepsStatus[payload.stepNumber]);
        stepperOptions = {
          ...stepperOptions,
          stepsStatus: {
            ...stepperOptions.stepsStatus,
            [payload.stepNumber]: { ...stepperOptions.stepsStatus[payload.stepNumber], ...payload.status }
          }
        };
        let allStepsDone = true;
        for (var sn of (Object.keys(stepperOptions.stepsStatus) || [])) {
          logger.info(fn, `stepStatus[${sn}:`, stepperOptions.stepsStatus[sn]);
          if (!stepperOptions.stepsStatus[sn].completed) {
            allStepsDone = false;
            break;
          }
        }
        stepperOptions.allStepsDone = allStepsDone;
        return {
          ...state, [offerIdentifier]: {
            ...state[offerIdentifier],
            stepperOptions,
          }
        }
      }
      break;
    case CART_ACTION_TYPES.RESET_CART_INFO:
      return Object.keys(state)
        .filter(key => key != offerIdentifier)
        .reduce((result, current) => {
          result[current] = state[current];
          return result;
        }, {});

    case CART_ACTION_TYPES.CLEAR_CART_WARNINGS:
      if (offerIdentifier) {
        cartOffer = state[offerIdentifier] || {};
        let warnings = cartOffer.warnings || [];
        return {
          ...state, [offerIdentifier]: {
            ...cartOffer,
            warnings: warnings.filter(warning => {
              return payload.fields.indexOf(warning.reference) == -1
            }),
            error: action.error
          }
        }
      }
    case CART_ACTION_TYPES.SET_CART_SHIPPING_SAME_AS_BILLING:
      cartOffer = state[offerIdentifier] || {};
      return {
        ...state, [offerIdentifier]: {
          ...cartOffer,
          shippingSameAsBilling: payload && payload.shippingSameAsBilling
        }
      }
    case CART_ACTION_TYPES.CART_VALIDATION:
      cartOffer = state[offerIdentifier] || {};
      return {
        ...state, [offerIdentifier]: {
          ...cartOffer,
          warnings: payload && payload.warnings || []
        }
      }
    case QUOTES_ACTION_TYPES.CREATE_QUOTE_SUCCESS:
      if (offerIdentifier) {
        cartOffer = state[offerIdentifier] || {};
        return {
          ...state, [offerIdentifier]: {
            ...cartOffer,
            cartId: payload.result || cartOffer.cartId,
            creating: false,
            warnings: payload && payload.warnings || [],
            error: action.error
          }
        }
      }

    case QUOTES_ACTION_TYPES.CREATE_QUOTE:
    case QUOTES_ACTION_TYPES.CREATE_QUOTE_FAILURE:
    case CART_ACTION_TYPES.CREATE_CART:
    case CART_ACTION_TYPES.CREATE_CART_SUCCESS:
    case CART_ACTION_TYPES.CREATE_CART_FAILURE:
      if (offerIdentifier) {
        cartOffer = state[offerIdentifier] || {};
        return {
          ...state, [offerIdentifier]: {
            ...cartOffer,
            creating: type == CART_ACTION_TYPES.CREATE_CART || type == QUOTES_ACTION_TYPES.CREATE_QUOTE,
            warnings: payload && payload.warnings || [],
            error: action.error,
            cartEmailSent: null
          }
        }
      }
      break;
    case QUOTES_ACTION_TYPES.FETCH_QUOTE:
    case CART_ACTION_TYPES.FETCH_CART:
      if (offerIdentifier) {
        return {
          ...state, [offerIdentifier]: {
            ...state[offerIdentifier],
            fetching: true
          }
        }
      }
      break;
    case QUOTES_ACTION_TYPES.FETCH_QUOTE_FAILURE:
    case CART_ACTION_TYPES.FETCH_CART_FAILURE:
      if (offerIdentifier) {
        return {
          ...state, [offerIdentifier]: {
            ...state[offerIdentifier],
            fetching: false,
            error: action.error
          }
        }
      }
      break;
    case QUOTES_ACTION_TYPES.FETCH_QUOTE_SUCCESS:
    case CART_ACTION_TYPES.FETCH_CART_SUCCESS:
      return mergeCartStatusData({ ...state, cartEmailSent: null }, payload, offerIdentifier || 'default');

    case CART_ACTION_TYPES.INIT_CART_SUCCESS:
      return mergeCartStatusData(state, payload, offerIdentifier);
      break;


    case CART_ACTION_TYPES.SEND_CART_SUMMARY:
      return { ...state, cartEmailSent: true };
    case CART_ACTION_TYPES.SEND_CART_SUMMARY_SUCCESS:
      return { ...state, cartEmailSent: false };

  }
  return state;
};

function mergeCartStatusData(state, payload, offerIdentifier, eventType) {
  let fn = `${ns}[mergeCartStatusData]`
  logger.info(fn, payload);
  payload.entities = payload.entities || {};
  let { offers, cartItems, salesModels, salesModelItems, salesModelItemAttributes } = payload && payload.entities || {}
  let cartItm = cartItems && Object.keys(cartItems)
  let selectedAttributes = {}
  let selectedSalesModelItems = {}
  let offerId = offerIdentifier;
  let selectedQty = cartItm && cartItm.length
    ? cartItm.map(itemId => {
      let item = cartItems[itemId];
      let offer = offers[item.offer];
      offerId = offerId || offer.identifier || 'default';//(eventType == CART_ACTION_TYPES.FETCH_CART_SUCCESS) ? offer.identifier : offerId;
      let sl = item.salesModel && salesModels[item.salesModel] && salesModels[item.salesModel].identifier
      let slItem = item.salesModelItem && salesModelItems[item.salesModelItem] && salesModelItems[item.salesModelItem].identifier
      let attr = item.attribute && salesModelItemAttributes[item.attribute] && salesModelItemAttributes[item.attribute].identifier
      let selectedOptions = item.selectedOptions;
      if (slItem && attr) {
        logger.info(fn, selectedOptions)
        selectedAttributes[`${slItem}..${attr}`] = { quantity: item.quantity, selectedOptions }
      }
      else if (slItem) {
        selectedSalesModelItems[`${slItem}`] = { quantity: item.quantity, selectedOptions }
      }
      return {
        salesModel: sl,
        salesModelItem: slItem,
        attribute: attr,
        quantity: item.quantity,
        selectedOptions
      }
    })
    : {}
  logger.info(fn, 'offerId:', offerId)
  if (payload && offerId) {
    return {
      ...state, [offerId]: {
        ...state[offerId],
        fetching: false,
        loaded: (eventType == CART_ACTION_TYPES.FETCH_CART_SUCCESS) ? true : state[offerId] && state[offerId].loaded,
        cartId: payload.result,
        selectedAttributes,
        selectedSalesModelItems
      }
    }
  }
  return state;
}

export const partnerQuotes = (state = {}, action) => {
  let fn = `${ns}[partnerQuotes]`
  const { type, payload, partnerId, agentId } = action;
  switch (type) {
    case PARTNERS_ACTION_TYPES.FETCH_PARTNER_QUOTES:
    case PARTNERS_ACTION_TYPES.FETCH_PARTNER_AGENT_QUOTES:
      return {
        ...state, ...{
          partnerId,
          agentId,
          fetching: true,
          error: '',
        }
      }
      break;
    case PARTNERS_ACTION_TYPES.FETCH_PARTNER_QUOTES_FAILURE:
    case PARTNERS_ACTION_TYPES.FETCH_PARTNER_AGENT_QUOTES_FAILURE:
      return {
        ...state, ...{
          partnerId,
          agentId,
          fetching: false,
          error: payload.error
        }
      }
      break;
    case PARTNERS_ACTION_TYPES.FETCH_PARTNER_QUOTES_SUCCESS:
    case PARTNERS_ACTION_TYPES.FETCH_PARTNER_AGENT_QUOTES_SUCCESS:
      return {
        ...state, ...{
          partnerId,
          agentId,
          fetching: false,
          error: '',
          nextPageUrl: payload.nextPageUrl,
          previousPageUrl: payload.previousPageUrl,
          total: payload.total,
          data: [...payload.data]
        }
      }
      break;
  }
  return state
}

export const countries = (state = {}, action) => {
  let fn = `${ns}[countries]`
  const { type, payload, offerIdentifier } = action;
  switch (type) {
    case COUNTRIES_ACTION_TYPES.FETCH_COUNTRIES_SUCCESS:
      return { ...state, data: [...payload.result] }
  }
  return state;
}

export const regions = (state = { data: [] }, action) => {
  let fn = `${ns}[regions]`;
  const { type, payload } = action;
  switch (type) {
    case REGIONS_ACTION_TYPES.FETCH_CURRENT_REGIONS_SUCCESS:
      return { ...state, currentRegion: payload };
    case REGIONS_ACTION_TYPES.FETCH_ALL_REGIONS_SUCCESS:
      return { ...state, data: [...payload.data] }
    case PARTNERS_ACTION_TYPES.FETCH_PARTNER_REGION_SUCCESS:
      return { ...state, data: [...payload.data] }
  }
  return state;
}

export const states = (state = { data: [] }, action) => {
  let fn = `${ns}[states]`
  const { type, payload, offerIdentifier } = action;
  switch (type) {
    case COUNTRIES_ACTION_TYPES.FETCH_STATES_SUCCESS:
      return { ...state, data: [...payload.result] }
  }
  return state;
}

export default combineReducers({
  // offersWizardDefaults,
  salesModelsStatus,
  // offerCartByCategory,  
  selectedOffer,
  topLevelOffers,
  cartByOffer,
  partnerQuotes,
  regions,
  countries,
  states,
  configurations
});
