import React, {Component} from 'react';
import styles from './SellableSalesModelItems.css'


class SellableSalesModelItems extends Component {
  render() {
    let { children, className=''} = this.props; 
    return (<div className={`sellable-salesmodel-items ${className}`}>
      {children}
    </div>)
  }
}


export default SellableSalesModelItems