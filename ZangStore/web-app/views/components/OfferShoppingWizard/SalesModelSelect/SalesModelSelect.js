import React, {Component} from 'react';
import Select from 'react-select';
import styles from './SalesModelSelect.css'
import { getPlanInfo } from '../../../../redux-state/utils';


class SalesModelSelect extends Component {
  renderPlanRow(salesModel) {
    let label = getPlanInfo(salesModel.subscription);
    return {
      value: salesModel.identifier,
      salesModel,
      label: label ? label
        : salesModel.title && salesModel.title.resource
        ? global.localizer.get(salesModel.title.resource)
        : salesModel.title && salesModel.title.text || salesModel.identifier
    } 
  }
  render() {
    let {
      placeholder='', 
      selectedSalesModel,
      onChange,
      salesModels = []
    } = this.props;    
    
    return (
      <Select
        name="form-field-name"
        className="sales-models-select"
        searchable={false}
        clearable ={false}
        placeholder={placeholder}
        value={selectedSalesModel}
        onChange={onChange}
        options={salesModels}
      /> 
    )
  }
}
export default SalesModelSelect

// class SalesModelSelects extends Component {
//   dialinNumberRender = (option) => {
//     var func = ns + '[dialinNumberRender]';
//     Log.info(func, 'begin option', option);
//     let pictureUrl = option.confNum.flag;
//     return (
//       <span>
//         <span style={{ marginRight: 10 }}>
//           <img
//             src={pictureUrl}
//             className="conf-flag"
//             style={{ height: 20 }}
//           />
//         </span>
//         <span>{option.label}</span>
//       </span>
//     );
//   }


//   dialinNumberChange = (option) => {
//     Log.debug(ns + '[dialinNumberChange]', option);

//     let selected = this.state.confNumbers.data.filter(number => {
//       return number._id === option.confNum._id
//     })[0]

//     this.setState({
//       selectedNumber: this.formatSelectedNumber(selected)
//     })


//     // MessageComposerActions.changeField('assignees', selected);
//   }

//   formatSelectedNumber(confNum){
//     return {
//       value: confNum.number + ' ' + confNum.description,
//       label: confNum.number,
//       confNum: confNum
//     };
//   }

//   render(){
//     let {selectedNumber} = this.props; 
//     let assigneesOptions = []
//     //  confNumbers.map((confNum) => {
//     //   dialinInfo += confNum.description + ':\t' + confNum.number + '\r\n';
//     //   return {
//     //     value: confNum.number + ' ' + confNum.description,
//     //     label: confNum.number,
//     //     confNum: confNum
//     //   };
//     // });       
//     return (
//       <Select
//       name="dialinNumbers"
//       multi={false}
//       value={selectedNumber}
//       options={assigneesOptions}
//       optionRenderer={this.dialinNumberRender}
//       valueRenderer={this.dialinNumberRender}
//       onChange={this.dialinNumberChange}
//     />
//     )
//   }
// }

