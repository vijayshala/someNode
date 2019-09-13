import React, {Component} from 'react';
import './QuoteItem.css'

// components
import { linkGo } from '../Link/Link';

export default class QuoteItem extends Component {

    render() {
        let statsClass = "" 
        if (this.props.quote.status == "NEW") {
            statsClass = "success";
        }
        if (this.props.quote.status == "FULFILLED") {
            statsClass = "info";
        }
        if (this.props.quote.status == "Declined") {
            statsClass = "danger";
        }
        if(this.props.quote.contact) {
            return(
                <tr className="quote-row" onClick={() => {
                    linkGo(`${this.props.url}`);
                }}>
                    <td >{this.props.quote.company.name}</td>
                    { this.props.quote.contact ? ( <td >{this.props.quote.contact.email}</td> ): ( <td >fakeemail@email.com</td> ) }
                    <td >{this.props.quote.contact.phone}</td>
                    <td>
                        <span className={`label label-${statsClass}`}>{global.localizer.get(this.props.quote.status)}</span>
                    </td>
                    {/* <td>
                        <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">View Actions 
                                <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                <li><a href="#">Duplicate</a></li>
                                <li><a href="#">Edit</a></li>
                                <li><a href="#">Delete</a></li>
                            </ul>
                        </div>
                    </td> */}
                </tr>
            )
        }

        return(
            <tr className="quote-row" onClick={() => {
                linkGo(`${this.props.url}`);
            }}>
                <td >{this.props.quote.company.name}</td>
                <td >fakeemail@email.com</td>
                <td >416XXXXXX</td>
                <td>
                    <span className={`label label-${statsClass}`}> {this.props.quote.status} </span>
                </td>
                <td>
                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">View
                            <span className="caret"></span>
                        </button>
                        <ul className="dropdown-menu">
                            <li><a href="#">Duplicate</a></li>
                            <li><a href="#">Edit</a></li>
                            <li><a href="#">Delete</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        )
    }
}