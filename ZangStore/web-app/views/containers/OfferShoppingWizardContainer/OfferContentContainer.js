const ns = '[OfferContentContainer]';
import logger from 'js-logger'
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

//constants
import { PRODUCT_TAG_DEVICES, PRODUCT_TAG_ADDON_FEATURES, PRODUCT_TAG_DID_MAIN } from '../../../redux-state/features/salesmodels/constants';

//actions
import { initCartStepper, setStepStatus, setCurrentStep } from '../../../redux-state/features/status/actions';

//selectors
import {  getSelectedOffer,  getOfferDefaultSalesModel } from '../../../redux-state/features/offers/selectors';
import { getCartInfo, getCartPrimarySalesModelQty } from '../../../redux-state/features/cart/selectors';
import { getSalesModelStatus } from '../../../redux-state/features/salesmodels/selectors';

//containers
import OfferStepperContainer from './OfferStepperContainer';
import StepPrimarySalesItemContainer from './StepPrimarySalesItemContainer';
import StepSelectAddonsContainer from './StepSelectAddonsContainer';
import OfferPrimaryItemFeaturesContainer from './OfferPrimaryItemFeaturesContainer'
import OfferContentTotalContainer from './OfferContentTotalContainer'
import StepSelectDIDContainer from './StepSelectDIDContainer'
import StepDevicesContainer from './StepDevicesContainer'
import StepUsersDeviceSelectionContainer from './StepUsersDeviceSelectionContainer'

//components
import { OfferContentWrapper } from '../../components/OfferShoppingWizard';
import Loader from '../../components/Loader';

//utils


const DEFAULT_OFFER = 'uc'
const MAX_NO_OF_STEPS = 5 //steps should come from server
const mapStateToProps = (state, props) => { 
  let fn = `${ns}[mapStateToProps]`
  let { cartByOffer } = state.status;
  let offer = getSelectedOffer(state, props);       
  let salesModel = (offer) ? getOfferDefaultSalesModel(state, { offerId: offer._id }) : null;  
  let salesModelStatus = salesModel ? getSalesModelStatus(state, salesModel.identifier) : { fetching: true }
  let stepperOptions = offer && cartByOffer[offer.identifier] && cartByOffer[offer.identifier].stepperOptions
  logger.info(fn, { offer, salesModel, salesModelStatus });
  return {    
    offer,
    salesModel,
    fetching: salesModelStatus.fetching,
    stepperOptions
  }
};

const mapDispatchToProps = {
  initCartStepper,
  setStepStatus,
  setCurrentStep
};

class OfferContentContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStepNumber:1
    }
  }

  componentWillReceiveProps(nextProps) {
    let fn = `${ns}[componentWillReceiveProps]`
    logger.info(fn, {prevOffer: this.props.offer, newOffer: nextProps.offer})
    if ((!this.props.offer && nextProps.offer
      || (this.props.offer && nextProps.offer && !this.props.offer.loaded && nextProps.offer.loaded)
      || (this.props.offer && nextProps.offer
      && this.props.offer._id != nextProps.offer._id
      && nextProps.offer.loaded)
      || this.props.stepsConfig.length != nextProps.stepsConfig.length
    )// this.props.offer._id != nextProps.offer._id))
      && nextProps.salesModel    
    ) {      
      this.props.initCartStepper(nextProps.offer, nextProps.salesModel, nextProps.stepsConfig)
    }  
  }

  componentWillUpdate(nextProps) {
    // if (   this.props.match.params.productSlug ===
    // nextProps.match.params.productSlug &&   this.props.topic && !nextProps.topic
    // ) {   nextProps.history.replace(`/spaces/dashboard`); }
  }

  componentDidMount() {
    if (this.props.salesModel && this.props.salesModel.loaded) {
      this.props.initCartStepper(this.props.offer, this.props.salesModel, this.props.stepsConfig)
    }
  }

  componentWillUnmount() { 

  }
  
  selectStep(stepNumber) {
    let fn = `${ns}[selectStep]`
    logger.info(fn, 'stepNumber:', stepNumber)
    let { offer, stepperOptions } = this.props;
    if(stepNumber > stepperOptions.totalSteps+2){
      stepNumber = stepperOptions.totalSteps;
    }
    this.props.setCurrentStep(offer.identifier, stepNumber);
    // this.setState({selectedStepNumber: stepNumber})
  }

  selectNextStep(nextStepNumber) {
    this.setStepStatus(nextStepNumber - 1)
    this.selectStep(nextStepNumber)
  }

  setStepStatus(stepNumber = 1) {
    let fn = `${ns}[setStepStatus]`
    logger.info(fn, 'stepNumber:', stepNumber)
    let { offer } = this.props;
    this.props.setStepStatus(offer.identifier, stepNumber, {completed:true});
  }

  getComponentByName(componentName, options = {}) {
    switch (componentName) {
      case 'StepPrimarySalesItemContainer':
        return <StepPrimarySalesItemContainer key={componentName} {...options} />
      
      case 'StepSelectDIDContainer':
        return <StepSelectDIDContainer key={componentName} {...options} />
      
      case 'StepSelectAddonsContainer':
        return <StepSelectAddonsContainer key={componentName} {...options} />
      
      case 'StepDevicesContainer':
        return <StepDevicesContainer key={componentName} {...options} />
      
      case 'StepUsersDeviceSelectionContainer':
      return <StepUsersDeviceSelectionContainer key={componentName} {...options} />
    }
    return null;
  }

  render() {
    let fn = `${ns}[render]`
    let { selectedStepNumber } = this.state;
    let { salesModel, offer, fetching, stepperOptions, cartMode='cart' } = this.props;
    
    if (!salesModel || !offer || !stepperOptions) {
      logger.warn(fn, salesModel, offer, stepperOptions)
      return null;
    }  

    if (fetching) {
      return <Loader className="offer-panel-container loader-container"/>;
    }
    let { stepsStatus = [], currentStep, allStepsDone } = stepperOptions;    

    
    logger.info(fn, 'stepsStatus:', stepsStatus)

    return (
      <OfferContentWrapper>                 
        <OfferStepperContainer>
          {
            Object.keys(stepsStatus).map(stepIndex => {
              let step = stepsStatus[stepIndex];
              return this.getComponentByName(step.component, {
                offer,
                salesModel,
                title: step.title,
                completed: step.completed,
                stepNumber: step.number,
                openState: currentStep == step.number || step.open,
                hideNext: step.hideNext,
                autoComplete: step.autoComplete,
                onSelect: (stepNumber) => {
                  this.selectStep(stepNumber)
                },
                onNext: (nextStepNumber) => {
                  this.selectNextStep(nextStepNumber)
                }
              })
            })
          }
        </OfferStepperContainer>
        <OfferContentTotalContainer {...{offer , salesModel, cartMode, disableCheckout:!allStepsDone}} />
      </OfferContentWrapper>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OfferContentContainer));
//<OfferPrimaryItemFeaturesContainer {...{offer , salesModel}} />       