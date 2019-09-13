import React, {Component} from 'react';
import styles from './UserTypeDevicesSelection.css'
import InputSpinner from '../../InputSpinner';
import CheckBoxDiv from '../../CheckBoxDiv'
import Price from '../../Price'
import TextResource from '../../TextResource'
import SectionTitle from '../../SectionTitle'
import { getLableFromDescriptions } from '../../../../redux-state/utils';
class UserTypeDevicesSelection extends Component {
  render() {
    let { currency, quantity = 0, onChange, salesModelItem = {}, onAdd,  noOfSelectedDevices, salesModelItemQty, showAddButton=true, children } = this.props;
    let { title = {} } = salesModelItem
     let shortTitle = getLableFromDescriptions(salesModelItem, 'title-plural') || title
    let addButtonLabel = noOfSelectedDevices ? 'EDIT_DEVICE_SELECTION' : 'ADD_DEVICES'
    // addButtonLabel = noOfSelectedDevices == salesModelItemQty ? 'EDIT_DEVICE_SELECTION' : addButtonLabel;
    return (
      <div className={`usertype-devices-selection ${noOfSelectedDevices > 0 ? 'selected' : ''}`}>
        <TextResource {...{
          className: 'item-label',
          ...shortTitle
        }}> <span> (<b>{quantity}</b>) </span>
        {showAddButton ? <a className="btn btn-add-device" onClick={e => {
            onAdd()
          }}>{global.localizer.get(addButtonLabel)}</a> : null}
        </TextResource>        
        {children ? <div className="user-type-addons">          
          {children}
        </div> : null}
      </div>
    )
  }
} 
  
export default UserTypeDevicesSelection