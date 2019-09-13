import React, {Component} from 'react';
import styles from './ModalWindow.css'

class ModalWindow extends Component {
  render() {
    let {
      className = 'modal-window',
      wide,
      title = '',
      show=false,
      subTitle = '',
      hint = '',
      children,
      cancelButton,
      okButton,
      disabled
    } = this.props;

    return (
      <div className={ `${className} ${show ? 'show' : ''} ${wide ? 'wide' : ''}`}>
        <div className="content">
          {title ? <div className="title" dangerouslySetInnerHTML={{__html: title}}></div> : null}
          {subTitle ? <div className="subtitle" dangerouslySetInnerHTML={{__html: subTitle}}></div> : null}
          {hint ? <p id="hint" className="hint">{hint}</p> : null}
          {children}
          <div className="buttons">
            {cancelButton ? <a className="cancel-btn" onClick={() => {
              cancelButton.onClick();
            }}>{cancelButton.label}</a> : null}
            {okButton ? <a className={`set-btn ${(disabled ? 'disabled' : '')}`} onClick={() => {
              okButton.onClick();
            }}>{okButton.label}</a> : null}            
          </div>
        </div>
      </div>
    )
  }
}

export default ModalWindow        