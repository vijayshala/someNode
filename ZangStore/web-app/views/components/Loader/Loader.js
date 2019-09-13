import React from 'react';
import styles from './Loader.css'
const Loader = ({className = ''}) => (
  <div className={className}>
    <img src = "/images/loading-spinner-grey.gif" />
  </div>
);

export default Loader;