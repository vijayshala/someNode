const ns = '[OfferRegionAutoDetectContainer]';
import logger from 'js-logger'
import React, { Component } from 'react';
import cookie from 'react-cookie';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom';

import {FetchRest} from '../../../redux-state/middleware/fetchRest';

import Loader from '../../components/Loader';
import { OfferRegionAutoDetect } from '../../components/OfferShoppingWizard';
import { linkGo } from '../../components/Link';

const mapStateToProps = (state, props) => {
  return {}
}
const mapDispatchToProps = {
}

class OfferRegionAutoDetectContainer extends Component {
  constructor(props) {
    super();
    this.fetchRest = new FetchRest();
    this.state = {
      fetching: true,
      availableOffers:[]
    }
  }

  async loadUserRegion() {
    var fn = ns + '[loadUserRegion]'
    let response = await fetch('https://onesnatesting.esna.com/api/1.0/user/location',
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        // mode: 'cors',
        // credentials: "same-origin",
        // dataType: 'json',
        method: 'GET'
      });
    let userLocation =await response.json();
    logger.info(fn, 'userLocation:', userLocation)
    return userLocation;
  }

  async loadOffersByTag(tag) {
    var fn = ns + '[loadUserRegion]'
    var response = await this.fetchRest.fetch('/clientapi/offers/tags/' + tag);
    logger.info(fn, 'begin', response);
    return response && response.data || [];
  }

  async componentDidMount() {
    let fn = `${ns}[componentDidMount]`
    let {match} = this.props
    logger.info(fn, 'begin', match.params);

    let userRegion = cookie.load('USER_REGION');
    let viewerOrigin = cookie.load('VIEWER_ORIGIN');
    logger.info(fn, 'viewerOrigin', viewerOrigin, userRegion);
    if (!viewerOrigin) {
      let res = await this.loadUserRegion();
      viewerOrigin = res.country;
      logger.info(fn, 'viewerOrigin:', viewerOrigin); 
      userRegion = viewerOrigin;
    }

    userRegion = userRegion || viewerOrigin;

    let offers = await this.loadOffersByTag(match.params.offerTag);
    if (!offers.length) {
      logger.error(fn, 'offer not found');
      //go to not found page

    }
    let viewerRegionOffer = offers.filter((offer) => {
      return offer.allowed_regions.indexOf(userRegion.toUpperCase())>-1
    })
    logger.info(fn, 'viewerRegionOffer:', viewerRegionOffer); 
    if (viewerRegionOffer && viewerRegionOffer.length) {
      let offerReg = viewerRegionOffer[0].allowed_regions[0].toLowerCase();
      let identifier = viewerRegionOffer[0].identifier;
      //linkGo(`/${offerReg}/shop/configure/${identifier}`);
      //return;
    }

    //offer not supported in this region
    this.setState({
      availableOffers: offers,
      fetching: false
    })

  }

  render() {
    let { fetching, availableOffers } = this.state;
    let {  } = this.props;
    if (fetching) {
      return <Loader className="offer-panel-container loader-container"/>;
    }
    
    return (
      <OfferRegionAutoDetect {...{ availableOffers }}>
      </OfferRegionAutoDetect>
    );
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OfferRegionAutoDetectContainer));