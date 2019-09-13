import React, {Component} from 'react';
import styles from './PageTitle.css'
import Link from '../Link'
class PageTitle extends Component {
  render(){
    let {label='', rightNavItems=[]} = this.props; 
    return (
    <div className='page-title'>
        <h1>
          {label}
          <div className='right-nav'>{rightNavItems.map((navItem, index) => {
            return <Link
              key={'nav-item-' + navItem.to}
              className="nav-item"
              to={navItem.to}
              isExternal={navItem.isExternal} >{navItem.component}</Link>
          })}</div>
        </h1>
        
    </div> )
  }
} 


export default PageTitle