const ns = '[offers/selectors]';
import logger from 'js-logger'
import { createSelector } from 'reselect';
import { getPlanInfo } from '../../utils';
import { getSalesModelItemsByTag } from '../salesmodels/selectors'
import { PRODUCT_TAG_DISCOUNT } from '../salesmodels/constants';
import { formatCurrency } from '../../../common/currencyFormatter'

export function getOfferDefaultSalesModel(state, props) {
  let fn = `${ns}[getOfferDefaultSalesModel]`
  let { salesModels } = state.entities;
  let offer = getOfferById(state, props);
  if (!offer.salesModels) {
    return null;
  }
  let defaultSalesModel = (offer && offer.salesModels && offer.salesModels.length > 0 && offer.salesModels[0].salesModel)
    ? salesModels[offer.salesModels[0].salesModel] : null;
   
  for (var item of offer.salesModels) {  
    // logger.info(fn, 'item', item);
    if (item.isDefault && item.salesModel) {
      defaultSalesModel = salesModels[item.salesModel];
      break;
    }
  }
  // logger.info(fn, 'defaultSalesModel', defaultSalesModel);
  return defaultSalesModel;
}

export function getSelectedOffer(state, props) {
  let fn = `${ns}[getSelectedOffer]`
  let { offers } = state.entities;
  let { selectedOffer } = state.status
  return (selectedOffer._id) ? getOfferById(state, {offerId: selectedOffer._id}) : null; 
}

export function getOfferByIdentifier(state, props) {
  let fn = `${ns}[getOfferByIdentifier]`
  let { entitiesIdentifiers } = state;
  let { identifier } = props;  
  // logger.info(fn, 'key:', `offer_${identifier}`);
  let mp = entitiesIdentifiers[`offer_${identifier}`] || {};
  // logger.info(fn, 'key:', `offer_${identifier}`, mp);
  return getOfferById(state, { offerId: mp._id });
}

export function getOfferById(state, props) {
  let fn = `${ns}[getOfferById]`
  let { offers } = state.entities;  
  let { offerId } = props;  
  return offers[offerId]
}

export function getTopLevelOffer(state, props) {
  let fn = `${ns}[getTopLevelOffer]`
  let { offers } = state.entities;
  let { topLevelOffers } = state.status
  let { identifier, selected } = props;
  let offerId = (topLevelOffers[identifier] && topLevelOffers[identifier]._id) || identifier
    // logger.info(ns, '[getTopLevelOffer]============', identifier,  topLevelOffers[identifier]);
  return offers[offerId]
}

export function getDefaultOfferInCategory(state, props) {
  let fn = `${ns}[getDefaultOfferInCategory]`
  let { offers } = state.entities;
  let { offersByCategory } = state.status
  let { offerIdentifier, selected } = props;
  let data =
    (offersByCategory[offerIdentifier] && offersByCategory[offerIdentifier].data)
      ? offersByCategory[offerIdentifier].data
      : []
  // logger.info(ns, '============', offers);
  for (var offerId of data) {    
    if (offers[offerId] && offers[offerId].slug == selected) {
      // logger.info(ns, 'offer', offerId, offers[offerId])
      return offers[offerId]
    }
  }
  return null;
}

export function getOfferPlans(state, props) {
  let { offer } = props;
  let { salesModels, discountTagName } = state.entities

  let offerPlans = offer.salesModels.map(slModel => {
    let salesModel = salesModels[slModel.salesModel];
    let planPeriod = getPlanInfo(salesModel.subscription);
    let discountItems = getSalesModelItemsByTag(state, {    
      salesModelId: salesModel._id,
      tagName: discountTagName || PRODUCT_TAG_DISCOUNT
    });

    let deviceDiscountLabel = '';//global.localizer.get('NO_DEVICE_CREDIT')
    if (discountItems && discountItems.length) {
      deviceDiscountLabel = ' (' + global.localizer.get('UP_TO_DEVICE_CREDITE_PER_USER').replace('{$}',
      formatCurrency(Math.abs(discountItems[0].price), { code: salesModel.currency })) + ')'
    }
    return {
      value: salesModel.identifier,
      salesModel,
      label: planPeriod + deviceDiscountLabel
    } 
  });

  return offerPlans;
}

// const filteredTopicsSelector = topicType =>
//   createDeepEqualSelector(
//     [entitiesArraySelector('topics'), statusSelector('topics')],
//     (topics, topicsStatus) => {
//       const searchStr = topicsStatus.searchStr.toLowerCase();
//       return topics.map(topic => topic.toJS()).filter(topic => {
//         // console.log('...topic', topic, topicsStatus)
//         if (topicType && topic.type !== topicType) {
//           return false;
//         }
//         if (searchStr) {
//           return (
//             topic.title.toLowerCase().includes(searchStr) &&
//             topic.status !== TOPIC_STATUS.ARCHIVE
//           );
//         }
//         if (!!topicsStatus[topicType].pinnedFilterIsActive && !topic.isPinned) {
//           return false;
//         }
//         if (
//           isDefined(topicsStatus[topicType].activeStatus) &&
//           topic.status !== topicsStatus[topicType].activeStatus
//         ) {
//           return false;
//         }
//         return true;
//       });
//     }
//   );