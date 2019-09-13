import React, { Component } from 'react';
import styles from './VolumeDiscounts.css'



class VolumeDiscounts extends Component {
  render() {
    let { label = '', className = 'volume-discount-table' } = this.props;
    return (
      <div>
        <div className="title">Avaya Cloud UC User Pricing</div>
        <table className={className}>
          <thead className="pricing-chart-header">
            <tr>
              <th>Users</th>
              <th>Essential</th>
              <th>Business</th>
              <th>Power</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1 - 99<div className="users-mini">Users</div></td>
              <td>$24.95</td>
              <td>$29.95</td>
              <td>$39.95</td>
            </tr>
            <tr>
              <td>100 - 999<div className="users-mini">Users</div></td>
              <td>$22.95</td>
              <td>$27.95</td>
              <td>$37.95</td>
            </tr>
            <tr>
              <td>1,000+<div className="users-mini">Users</div></td>
              <td>$19.95</td>
              <td>$24.95</td>
              <td>$34.95</td>
            </tr>
          </tbody>
        </table>
      </div>)
  }
}

export default VolumeDiscounts;