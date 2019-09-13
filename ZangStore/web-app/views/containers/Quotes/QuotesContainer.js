const ns = '[QuoteConfigContainer]';
import logger from 'js-logger'
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import QuoteItem from '../../components/Quote/QuoteItem';
import QuoteRegionProductSelectorContainer from './QuoteRegionProductSelectorContainer';
import { fetchPartnerAgentQuotes, fetchPartnerQuotes } from '../../../redux-state/features/partners/actions';
import { fetchAllRegionInfo } from '../../../redux-state/features/regions/actions';
import './Quotes.css';


// components
import { linkGo } from '../../components/Link';
import Loader from '../../components/Loader';
import ModalWindow from '../../components/ModalWindow';

//utils
import { FetchRest } from '../../../redux-state/middleware/fetchRest';
const fetchRest = new FetchRest();

const mapStateToProps = (state, props) => {
    let { selectedOffer, cartByOffer, partnerQuotes } = state.status
    let { quotes } = state.entities
    let regions = state.status.regions.data

    let quoteArray = []
    if (partnerQuotes) {
        if (partnerQuotes.data && partnerQuotes.data.length > 0) {
            quoteArray = partnerQuotes.data;
        }
    }
    return { ...partnerQuotes, quoteArray, quotes, regions }
}
const mapDispatchToProps = {
    fetchPartnerAgentQuotes,
    fetchPartnerQuotes,
    fetchAllRegionInfo
};

class QuotesContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            offersAvailableInRegion: [],
            showRegionsProductSelection: false,
            prevPageUrlFalse: (this.props.prevPageUrl ? false : true)
        }
    }

    componentWillMount() {
        let { partnerId, agentId, partnerQuotes } = this.props.match.params;
        if (partnerId) {
            this.props.fetchPartnerAgentQuotes({ partnerId, agentId })
        }
    }

    // will switch view to the quote composer 
    openQuoteComposer = () => {
        this.setState({ openQuoteComposer: !this.state.openQuoteComposer })
    }

    // get the next few quotes for the next page
    fetchNextPage = () => {
        let { partnerId, agentId, partnerQuotes } = this.props.match.params;
        let nextUrl = this.props.nextPageUrl;
        // Enable the previous page
        logger.info(ns, 'fetchNextPage', nextUrl);
        // Don't go to the next page if the number of quotes are less than the limit
        if (partnerId && nextUrl && this.props.quoteArray.length >= 30) {
            this.props.fetchPartnerAgentQuotes({ partnerId, agentId }, nextUrl);
            this.setState({
                prevPageUrlFalse: false
            })
        } 
    }

    // get the previous page quotes
    fetchPrevPage = () => {
        let { partnerId, agentId, partnerQuotes } = this.props.match.params;
        let prevUrl = this.props.previousPageUrl;
        logger.info(ns, 'fetchPrevPage', prevUrl);
        if (partnerId && prevUrl) {
            this.props.fetchPartnerAgentQuotes({ partnerId, agentId }, prevUrl);
            let prev = prevUrl.split('&')[2].split('=')[1] || false;
            this.setState({
                prevPageUrlFalse: (prev ? true: false)
            })
        }
    }

    render() {
        let { quoteArray, fetching } = this.props;
        const activeTableState = quoteArray.length > 0 ? (
            <tbody>
                {
                    quoteArray.map((id) => {
                        return (
                            <QuoteItem
                                quote={this.props.quotes[id]}
                                key={id}
                                url={`${this.props.match.url}/view/${id}`}
                            />
                        )
                    })
                }
            </tbody>
        ) : null

        const createQuoteForm = (
            <div className="quote-form-container">
                <a className="btn btn-danger text-400" onClick={() => {
                    this.setState({ showRegionsProductSelection: true });
                    //if(!this.props.regions) {
                    //    this.props.fetchAllRegionInfo();
                    //}
                    //this.goToCreateQuoteLink()
                    // linkGo(`${this.props.match.url}/new`);
                }}>
                    {global.localizer.get('ADD_QUOTE')}
                </a>
            </div>
        )

        return (
            <div className="menu-quote">
                {createQuoteForm}

                <table className="table zs-main-table partner-table">
                    <thead>
                        <tr>
                            <th>{global.localizer.get('COMPANY_NAME')}</th>
                            <th>{global.localizer.get('EMAIL')}</th>
                            <th>{global.localizer.get('PHONE_NUMBER')}</th>
                            <th>{global.localizer.get('STATUS')}</th>
                            {/*<th>Actions</th>*/}
                        </tr>
                    </thead>

                    {activeTableState}

                </table>
                {/* if no items found show placeholder */}

                {
                    ((quoteArray.length == 0) && (fetching)) ?
                        (<Loader className="loader-container" />) : null
                }

                {
                    ((quoteArray.length == 0) && (!fetching)) ?
                        (<div className="quotes-no-items-placeholder">
                            <h3>{global.localizer.get('NO_EXISTING_QUOTES_FOUND')}</h3>
                        </div>) : null
                }
                <div className="paginator-container">
                    <button  disabled={this.state.prevPageUrlFalse} className={'btn btn-danger text-400'} onClick={this.fetchPrevPage}>{global.localizer.get('PREVIOUS')}</button>
                    <span className="placeholder--quotes"></span>
                    <button disabled={quoteArray.length >=30 ? false : true} className={'btn btn-danger text-400'} onClick={this.fetchNextPage}>{global.localizer.get('NEXT')}</button>
                </div>

                {
                    this.state.showRegionsProductSelection ?
                        <QuoteRegionProductSelectorContainer
                            onClose={() => {
                                this.setState({ showRegionsProductSelection: false })
                            }}
                            url={this.props.match.url}
                            partnerId={this.props.match.params.partnerId} />
                        : null
                }

            </div>
        )
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QuotesContainer));