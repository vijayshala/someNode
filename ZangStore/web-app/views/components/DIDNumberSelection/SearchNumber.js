import React, { Component } from 'react';
// import styles from './SectionTitle.css'

const WAIT_INTERVAL = 1000;
let timer = null;

class SearchNumber extends Component {

  // function that searches once the user stops typing
  handleChange(ref) {
    //clearTimeout(timer);

    // timer = setTimeout( () => console.log(ref), WAIT_INTERVAL); 
    // FIXME
  }

  render() {
    let {
      maxLength = 3,
      disabled = false,
      onSearch,
    } = this.props;

    return (
      <div className="input-group" >
        <input
          ref={(searchNumber) => { this.searchNumber = searchNumber }}
          type="number"
          name="searchText"
          placeholder={global.localizer.get('ENTER_AREA_CODE_US_AND_CANADA_ONLY')}
          maxLength={maxLength}
          className="form-control input-lg"
          onChange={this.handleChange}
          onKeyDown={(e) => {
          // Allow: backspace, delete, tab, escape, enter and .
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
              // Allow: Ctrl/cmd+A
              (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
              // Allow: Ctrl/cmd+C
              (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
              // Allow: Ctrl/cmd+X
              (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
              // Allow: home, end, left, right
              (e.keyCode >= 35 && e.keyCode <= 39)) {
              // let it happen, don't do anything
              return;
            }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
          }}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              onSearch(this.searchNumber.value)
            }
          }} />
        <span className="input-group-btn searchText-container" >
          <button className={`btn btn-primary btn-lg searchText-btn ${disabled ? 'disabled' : ''}`}
            onClick={() => {
              if (disabled) {
                return false;
              }
              onSearch(this.searchNumber.value)
            }}>
            <i className="fa fa-search"></i>
          </button>
        </span>
      </div>
    )
  }
}

export default SearchNumber