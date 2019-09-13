import React, { Component } from 'react';
import Link from '../Link';
import './MainSubMenu.css';


export default class MainSubMenu extends Component {
  render() {
    let { backLink = {}, menuItems = [] } = this.props;
    return (
      <div className="main-sub-menu">
        <div className="back-link">
          {backLink.url ? <Link to={backLink.url} external={backLink.isExternal}>{backLink.label}</Link> : null }
        </div>
        <ul className="main-sub-menu-items">
          {menuItems.map(menuItem => {
            return (
              <li className="sub-menu-item">
                <Link to={menuItem.url} isExternal={menuItem.isExternal}>{menuItem.label}</Link>
              </li>  
            )
          })}          
        </ul>
      </div>
    )
  }
}
