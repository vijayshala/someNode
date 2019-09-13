import React, {Component} from 'react';
import styles from './ContentLimitView.css'

class ContentLimitView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    }
  }
  render() {
    let { 
      className,
      children, 
      showMore
   } = this.props; 

   showMore = showMore || {
    open: {
      label: global.localizer.get('HIDE')
    },
    close: {
      label: global.localizer.get('SHOW_MORE')
    },
  }

    let { open } = this.state;

    return (
      <div className={`content-limit-view ${open ? 'open' : ''} ${className}`}>
        {children}    
        <div className='showhide-toggle' onClick={
          (e) => {
            this.setState({open:!open})
          }
        }  >          
          <a >{!open ? showMore.close.label : showMore.open.label} 
            <span className="arrow-down">&#x25BC;</span>
            <span className="arrow-up">&#x25B2;</span>
          </a>
        </div>
    </div> )
  }
} 


export default ContentLimitView