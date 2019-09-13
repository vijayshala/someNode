import React, {Component} from 'react';
import styles from './SectionTitle.css'

class SectionTitle extends Component {
  render() {
    let { label = '', className = 'section-title', rightLabel = '' } = this.props;
    return (
      <div className={className}>
        <div className="line"></div>  
        <div className="section-label">{label}</div>
        {rightLabel ? <div className="section-label-right">{rightLabel}</div> : null}
      </div>)
  }
}


export default SectionTitle