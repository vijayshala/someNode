import React, {Component} from 'react';
import styles from './SellableAttributes.css'
import SellableAttribute from '../SellableAttribute'

class SellableAttributes extends Component {
  render(){
    let {children, addons} = this.props; 

    return (<div className='sellable-addons'>
            {addons.map((item, index)=>{
              return <SellableAttribute key={`addon-key-${index}`} {...{...item}} />
            })}              
    {children}
    </div> )
  }
} 


export default SellableAttributes