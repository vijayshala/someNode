const ns = '[QuoteRegionProductSelectorContainer]';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import logger from 'js-logger'
import cookie from 'react-cookie';
//utils
import { FetchRest } from '../../../redux-state/middleware/fetchRest';
const fetchRest = new FetchRest();

// components
import { QuoteRegionProductSelector } from '../../components/Quotes';
import { linkGo } from '../../components/Link';
import ModalWindow from '../../components/ModalWindow';

// actions
import { selectOffer } from '../../../redux-state/features/offers/actions';
import { fetchAllRegionInfo, preloadCurrentRegion } from '../../../redux-state/features/regions/actions';


const mapStateToProps = (state, props) => {
    let { regions } = state.status;
    return {
        regions
    }
}

const mapDispatchToProps = {
    fetchAllRegionInfo,
    preloadCurrentRegion
};
class QuoteRegionProductSelectorContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRegion: {},
            offersAvailableInRegion: [],
            selectedOffer: '',
            partnerId: props.partnerId
        }
    }

    setRegionByCode(regions, shortCode) {
        let fn = `${ns}[setRegionByCode]`;
        logger.info(fn, 'regions', regions);
        if (regions.length) {
            let region = regions.find(o => o.shortCode === shortCode);
            this.initSelectedRegion(region);
        }
    }

    setRegionById(regionId, regionList = []) {
        let fn = `${ns}[setRegionById]`;
        logger.info(fn, regionId);
        let regions = regionList || this.props.regions.data;
        let region = regions.find(o => o._id === regionId);
        this.initSelectedRegion(region);
    }

    initSelectedRegion(region) {
        let fn = `${ns}[initSelectedRegion]`;
        logger.info(fn, region);
        this.props.preloadCurrentRegion({ data: null }); //reset currentRegion to be loaded by configuratir
        this.loadRegionOffers(region);
        this.setState({ selectedRegion: region });
    }

    onRegionChange = (e) => {
        let fn = `${ns}[onRegionChange]`
        let regions = this.props.regions.data;
        logger.info(fn, 'begin', e.target.value, regions);
        this.setRegionById(e.target.value);
    }

    loadRegionOffers(region) {
        let fn = `${ns}[loadRegionsOffers]`
        if (region && region.shortCode) {
            let url = `/clientapi/offers/region/${region.shortCode}`
            fetchRest.fetch(url, { method: 'GET' }).then(response => {
                logger.info(fn, '----OFFERS --->', response);
                if (response.error === false) {
                    this.setState({ offersAvailableInRegion: response.data, selectedOffer: response.data[0] })
                }
            }).catch((error) => {
                logger.error(fn, error);
            })
        }
    }

    onProductsChange = (e) => {
        let fn = `${ns}[onProductsChange]`
        let offerId = e.target.value;
        // logger.info(fn, 'begin', offerId, 'offersAvailableInRegion', this.state.offersAvailableInRegion);
        let offer = (this.state.offersAvailableInRegion || []).find(o => o._id === offerId);
        logger.info(fn, 'begin', offerId, 'offer', offer);
        this.setState({ selectedOffer: offer });
    }

    componentWillReceiveProps(nextProps) {
        let fn = `${ns}[componentWillReceiveProps]`
        let { regions } = this.props;
        let { regions: newRegions } = nextProps;
        logger.info(fn, { regions, newRegions });
        if (!regions.data || !regions.data.length
            && newRegions.data && newRegions.data.length) {
            //load countries
            var userRegion = cookie.load('USER_REGION') || cookie.load('VIEWER_ORIGIN') || 'US';
            logger.info(fn, '', 'userRegion', userRegion.toUpperCase());
            if (newRegions.data[0]._id) {
                //this.setRegionByCode(newRegions.data, userRegion.toUpperCase());
                this.setRegionById(newRegions.data[0]._id, newRegions.data);
            }
        }
    }
    componentDidMount() {
        let fn = `${ns}[componentDidMount]`
        let { regions } = this.props;
        logger.info(fn, 'regions', regions);
        if (!regions.data || !regions.data.length) {
            this.props.fetchAllRegionInfo(this.state.partnerId);
        }

        if (regions.data && regions.data.length) {
            //load countries
            var userRegion = cookie.load('USER_REGION') || cookie.load('VIEWER_ORIGIN') || 'US';
            logger.info(fn, 'userRegion', userRegion);
            if (regions.data[0]._id) {
                //this.setRegionByCode(regions.data, userRegion.toUpperCase());
                this.setRegionById(regions.data[0]._id, regions.data);
            }
        }
    }

    render() {
        //let regions = this.props.regions;
        let offers = this.state.offersAvailableInRegion;
        return (
            <ModalWindow {...{
                title: '',
                subTitle: '',
                show: true,
                disabled: ((offers && offers.length > 0) ? false : true),
                okButton: {
                    label: global.localizer.get('SELECT'),
                    onClick: () => {
                        linkGo(`${this.props.url}/new/` + this.state.selectedOffer.identifier);
                        this.props.onClose();
                    }
                },
                cancelButton: {
                    label: global.localizer.get('CLOSE'),
                    onClick: () => {
                        this.props.onClose();
                    }
                }
            }} >
                <QuoteRegionProductSelector {...{
                    selectedRegion: this.state.selectedRegion,
                    regions: this.props.regions.data,
                    offers,
                    onRegionsChange: e => {
                        this.onRegionChange(e);
                    },
                    onProductsChange: e => {
                        logger.info(ns, 'onProductsChange', e);
                        this.onProductsChange(e)
                    }
                }} />
            </ModalWindow>

        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuoteRegionProductSelectorContainer);