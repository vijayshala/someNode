import { combineReducers } from 'redux';
import offers from './offers/reducers';
import {cart, cartItems} from './cart/reducers';
import { salesModels, salesModelItems, salesModelItemAttributes } from './salesmodels/reducers';
import { products } from './products/reducers';
import { quotes } from './quotes/reducers';
import { countries, states } from './countries/reducers';
export default combineReducers({
  offers,  
  salesModels,
  salesModelItems,
  salesModelItemAttributes,
  products,
  cart,
  cartItems,
  quotes,
  countries,
  states
});
