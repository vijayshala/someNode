import React, {Component} from 'react';
import styles from './UserTypeDevices.css'
import UserTypeDevice from '../UserTypeDevice'

class UserTypeDevices extends Component {
  render() {
    let { children, addons } = this.props;
    let addButtonLabel = addons.length ? 'SELECT_MORE_DEVICES' : 'ADD_DEVICES'
    return (
      <div className='usertype-devices'>
        {addons.map((item, index) => {
          return <UserTypeDevice key={`addon-key-${index}`} {...{ ...item }} />
        })}
        {children}        
      </div>
    )
  }
}


export default UserTypeDevices