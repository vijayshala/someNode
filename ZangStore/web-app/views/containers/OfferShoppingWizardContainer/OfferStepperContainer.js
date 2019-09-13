
const ns = '[OfferStepperContainer.controller]';
import logger from 'js-logger'
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import { Step } from '../../components/Stepper';
export default class OfferStepperContainer extends Component {
  constructor(props) {
    super();
    this.state = {

    }
  }
  handleSelectItem(item) {
    for (var item in this.props.items) {
      
    }
  }
  render() {
    let { steps=[], children } = this.props;
    let lstSteps = steps.map((step, index) => {
      return (
        <Step key={`stepper-${index}`} {...step}></Step>
      )
    })
    return (
      <div className="accordion-container">                
        <div  className="rowa stepper-top-header hidden">
          <div className="col-lg-8a main-col1" ></div>  
          <div className="col-lg-4a main-col2">            
            <div className="rowa">
              <div className="col-lg-4a col1"></div>
              <div className="col-lg-4a col2 subtotal-header">{global.localizer.get('ONETIME_FEE')}</div>
              <div className="col-lg-4a col3 subtotal-header">{global.localizer.get('RECURRING_FEE')}</div>
            </div>
          </div>          
        </div>
        {children}
      </div>
    );
  }
};

