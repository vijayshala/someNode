const ns = '[offers/schema]';
import { schema, normalize } from 'normalizr';
import logger from 'js-logger'
import { omit } from 'lodash';
import { SALESMODEL } from '../salesmodels/schema'

// const createOffer = {
//   data: [
//     new schema.Entity(
//       'offers',
//       {},
//       {
//         idAttribute: 'productId',
//         processStrategy: entity => ({
//           _id: entity.productId,
//           created: entity.created          
//         })
//       }
//     )
//   ]
// };

const offerItem = new schema.Entity('offerItems', {}, {
  idAttribute: '_id',
  processStrategy: entity => ({
    parent: entity._id,    
  })});


export const OFFER = new schema.Entity('offers', 
{ 
  salesModels: [{
    salesModel: SALESMODEL
  }]
}, 
{ idAttribute: '_id' });


// const offers = new schema.Entity(
//   'offers',
//   {children: [OFFER]},
//   {
//     idAttribute: '_id'
//   }
// );



const offerArraySchema = { data: [OFFER] };


function flattenOfferPayload(offer) {  
  let children = (offer.children || []).sort((a, b)=>{
    return a.displaySequence>b.displaySequence
  })
  logger.info('flattenOfferPayload==================', offer.children, children)
  let childrenIds = children.map((child)=> child._id);  
  let childOffers = [];
  for(var offr of children) {
    childOffers = [...childOffers, ...flattenOfferPayload(offr)]
  }
  // logger.info('offer==================', childOffers)
  return  [{...offer, children: [...childrenIds]}, ...childOffers]
}

export function normalizeOffer(response, state) {
  let mainOffer = response.data || {}  
  
  let transformedOffer = flattenOfferPayload(mainOffer);
  logger.info('mainOffer==================', transformedOffer)
  let res = normalize(transformedOffer, [OFFER]);  
  logger.info('mainOffer==================', transformedOffer, res)
  return { ...res, result: mainOffer._id};
}




export default {
  OFFER_ARRAY: offerArraySchema,
  OFFER,  
  // CREATE_OFFER: createOffer,  
};
