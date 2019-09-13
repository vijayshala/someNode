import React, {Component} from 'react';
import styles from './Stepper.css'

export default class Step extends Component {
  constructor(props) {
    super()
    this.state =  {
      open: props.open || false,
      class:  props.className || 'stepper-item'
    }
  }
  render() {
    let { 
      className, 
      stepNumber=1, 
      open, 
      completed,
      hideTitle, 
      title, 
      footNote,
      footNoteLink,
      col1 = {}, 
      col2 = {},  
      col3= {}, 
      onSelect,
      onNext,
      disableNext,
      hideNext,
      nextBtnLabel = global.localizer.get('CONTINUE'),
      disableBack,
      onBack,
      backBtnLabel = global.localizer.get('BACK'),
      selectLinkLabel=global.localizer.get('EDIT')
    } = this.props;
    let clsName = this.props.className || 'stepper-item'
    clsName += (this.props.open) ? ' open' : '';
    clsName += (completed) ? ' activated' : '';
    let headerClsName = 'rowb stepper-item-head '  + ((hideTitle) ? 'hidden' : '')
    return (
      <div className={clsName}>        
        <div className={headerClsName} onClick={onSelect} >
          <div className="col-lg-7b stepper-item-head-title" >
            <span className="step-number">{stepNumber}</span> {title} 
          </div>  
          <div className="stepper-item-head-info">            
            <div className="flex-row">
              <div className="stepper-item-head-col1">            
                <div className="col-line1">{col1.line1}</div>
                <div className="col-line2">{col1.line2}</div>
              </div>
              <div className="stepper-item-head-col2">
                <div className="col-line1" dangerouslySetInnerHTML={{__html: col2.line1 || '&nbsp;'}}></div>
                <div className="col-line2" dangerouslySetInnerHTML={{__html: col2.line2 || '&nbsp;'}}></div>
              </div>
              <div className="stepper-item-head-col3">
                <div className="col-line1" dangerouslySetInnerHTML={{__html: col3.line1 || '&nbsp;'}}></div>
                <div className="col-line2" dangerouslySetInnerHTML={{__html: col3.line2 || '&nbsp;'}}></div>
              </div>
            </div>  
          </div>  
        </div>
        <div className="stepper-item-content-wrap">
          <div className="stepper-item-content">
            {this.props.content}
          </div>
        </div>
        <div className={`stepper-item-continue ${!onBack && !onNext || hideNext ? 'hidden' : ''}`}>
          {footNote ?
            <div className="stepper-foot-note">{footNote} {footNoteLink ? <a onClick={footNoteLink.onClick}>{footNoteLink.label}</a> : null} </div> : null}
          {onBack ? <button className={`btn btn-link btn-back hidden ${disableBack? 'disabled' : ''}`} onClick={onBack}>{backBtnLabel}</button> : null}
          {onNext && !hideNext ? <button className={`btn btn-next ${disableNext ? 'disabled' : ''}`} onClick={onNext}>{nextBtnLabel}</button> : null}
        </div>
      </div>
    );
  }
}
