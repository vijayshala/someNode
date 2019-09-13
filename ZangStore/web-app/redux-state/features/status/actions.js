const ns = '[status/actions]';
import logger from 'js-logger'
import { ACTION_TYPES } from './constants';
import { initStepperOptionsState } from './utils';
import {  getSalesModelItemsByTag, getPrimarySalesItemAttributesByTag } from '../salesmodels/selectors';

export const authSuccess = () => ({
  type: ACTION_TYPES.AUTH_REQUEST_SUCCESS
});

export const authFail = () => ({
  type: ACTION_TYPES.AUTH_REQUEST_FAIL
});

export const signout = () => ({
  type: ACTION_TYPES.SIGN_OUT
});

export function preloadConfigs(configs) {
  let fn = `${ns}[initCartStepper]`
  return (dispatch, getState) => {
    const state = getState();
    return dispatch({
      type: ACTION_TYPES.SET_CONFIGURATIONS,
      payload: configs,
      loaded: true
    })
  }
}

export function initCartStepper(offer, salesModel, steps) {
  let fn = `${ns}[initCartStepper]`
  return (dispatch, getState) => {
    const state = getState();
    let { cartByOffer, selectedOffer } = state.status;  

    var validSteps = [];
    var stepNumber = 1;
    for (var step of steps) {      
      switch (step.component) {        
        // case 'StepUsersDeviceSelectionContainer':                  
        case 'StepDevicesContainer': 
        case 'StepSelectDIDContainer':  
          let nonePrimarySalesItems = getSalesModelItemsByTag(state, {
            salesModelId: salesModel._id,
            tagName: step.tagName
          });
          logger.info(fn, 'nonePrimarySalesItems', nonePrimarySalesItems);
          
          if (nonePrimarySalesItems.length) {
            validSteps.push({
              ...step,
              number: stepNumber++
            });
          }
          break;  
        
          
        case 'StepUsersDeviceSelectionContainer':
        case 'StepSelectAddonsContainer':
          let sellableAttributes = getPrimarySalesItemAttributesByTag(state, {
            salesModelId: salesModel._id,
            tagName: step.tagName
          });
          if (sellableAttributes.length) {
            validSteps.push({
              ...step,
              number: stepNumber++
            });
          }
          break;  
        default:
        validSteps.push({
            ...step,
            number: stepNumber++
          });
      }
    }


    

    
    let stepperDef = initStepperOptionsState(validSteps);
    dispatch({
      type: ACTION_TYPES.INIT_STEPPER,
      payload: stepperDef,
      offerIdentifier: offer.identifier
    })
  }
}

export function setCurrentStep(offerIdentifier, stepNumber) {
  return {
    type: ACTION_TYPES.SET_CURRENT_STEP,
    payload: {stepNumber},
    offerIdentifier
  }
}

export function setStepStatus(offerIdentifier, stepNumber, status={completed:true}) {
  return {
    type: ACTION_TYPES.SET_STEP_STATUS,
    payload: {stepNumber, status},
    offerIdentifier
  }
}


