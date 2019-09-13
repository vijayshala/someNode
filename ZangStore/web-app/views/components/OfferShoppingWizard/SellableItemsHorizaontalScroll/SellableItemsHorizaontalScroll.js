import React, { Component } from 'react';
import PerfectScrollbar  from 'perfect-scrollbar';
// import pscss from 'perfect-scrollbar/css/perfect-scrollbar.css'
import styles from './SellableItemsHorizaontalScroll.css'
import SellableItemView from '../SellableItemView'

const SCROLL_JUMP = 100;
class SellableItemsHorizaontalScroll extends Component {
  componentDidMount() {
    // let container = $('.sellable-items-horizontal')[0]
    this.ps = new PerfectScrollbar(this.container, {
      wheelSpeed: 1,
      wheelPropagation: true,
      minScrollbarLength: 20,
      useBothWheelAxes: true
    });
    // this.container.addEventListener('ps-y-reach-end', (e) => {
    //   console.log('ps-y-reach-end', e);
    // })
    // this.container.addEventListener('ps-x-reach-start', (e) => {
    //   console.log('ps-x-reach-start', e);
    // })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.addons.length != this.props.addons.length) {
      this.ps.update();
    }
  }

  componentWillUnmount() {
    this.ps.destroy();
    this.ps = null; // to make sure garbages are collected
  }

  render() {
    let { children, addons } = this.props;

    return (<div className='sellable-items-horizontal'>
      
      <button className="btn leftButton" onClick={e => {
        let sl = this.container.scrollLeft - SCROLL_JUMP;//(this.container.width / 2)
        this.container.scrollLeft = sl < 0 ? 0 : sl;
        //this.ps.update({ scrollLeft: sl < 0 ? 0 : sl });
      }}>&#9664;</button>
      <div ref={c => this.container = c} className='sellable-scroller'>
        {addons.map((item, index) => {
          return <SellableItemView key={`addon-key-${index}`} {...item } />
        })}
      </div>
      <button className="btn rightButton" onClick={e => {
        let sl = this.container.scrollLeft + SCROLL_JUMP;//(this.container.width / 2)
        this.container.scrollLeft= sl > this.container.scrollWidth ? this.container.scrollWidth : sl
        //this.ps.update({ scrollLeft: sl > this.container.scrollWidth ? this.container.scrollWidth : sl });
      }}>&#9654;</button>
      {children}        
    </div>)
  }
} 


export default SellableItemsHorizaontalScroll