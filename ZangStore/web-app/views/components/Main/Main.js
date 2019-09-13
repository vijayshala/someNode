import React, { Component } from 'react';

// import 'sanitize.css/sanitize.css';
// import 'typeface-roboto';
import './Main.css';
// import '../../assets/css/zang-spaces-icon-font.css';
// import 'react-select/dist/react-select.css';
// import 'font-awesome/css/font-awesome.css';

export default class Main extends Component {
  render() {
    return <div className="app">{this.props.children}</div>;
  }
}
