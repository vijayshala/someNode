$(function () {
  function setStates(el, country, selected) {
    var statesToRender = states.filter(function (state, i) {
      return state.metadata.country === country;
    }).sort(function (a, b) {
      if (a.keyValue < b.keyValue) return -1;
      if (a.keyValue > b.keyValue) return 1;
      return 0;
    });
    var html = "<option value=''>- Select One -</option>";
    statesToRender.forEach(function (state, i) {
      html += "<option value='" + $('<div/>').text(state.keyValue).html() + "' " + (state.keyValue === selected ? "selected='selected'" : '') + ">" + $('<div/>').text(state.description).html() + "</option>"
    });

    el.html(html);
  }

  function showStatesHelper(country, field, input) {
    if (country[0] != 'DE') {
      $(input).show();
      setStates(field, country[1], null);
    } else {
      $(input).hide();
    }
  }

  if ($('[name="states"]').val()) {
    var states = JSON.parse($('[name="states"]').val()),
      selectedBillingStateProvince = $('[name="selectedBillingStateProvince"]').val(),
      selectedShippingStateProvince = $('[name="selectedShippingStateProvince"]').val(),
      selectedE911StateProvince = $('[name="selectedE911StateProvince"]').val();


    //setStates($('[name="billingStateProvince"]'), $('[name="billingCountry"]').val(), selectedBillingStateProvince);
    //setStates($('[name="shippingStateProvince"]'), $('[name="shippingCountry"]').val(), selectedShippingStateProvince);
    //setStates($('[name="e911StateProvince"]'), $('[name="e911Country"]').val(), selectedE911StateProvince);

    //setStates($('[name="companyStateProvince"]'), $('[name="companyCountry"]').val(), null);
    //setStates($('[name="operationalStateProvince"]'), $('[name="operationalCountry"]').val(), null);
    //setStates($('[name="bankStateProvince"]'), $('[name="bankCountry"]').val(), null);
  }
  $('[name="billingCountry"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="billingStateProvince"]'), $(this).val(), selectedBillingStateProvince);
  });

  $('[name="shippingCountry"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="shippingStateProvince"]'), $(this).val(), selectedShippingStateProvince);
  });

  $('[name="companyCountry"]').on('change', function (e) {
    e.preventDefault()
    showStatesHelper($(this).val().split('-'), $('[name="companyStateProvince"]'), '.stateRegion');
  });

  $('[name="e911Country"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="e911StateProvince"]'), $(this).val(), null);
  });

  $('[name="operationalCountry"]').on('change', function (e) {
    e.preventDefault()
    showStatesHelper($(this).val().split('-'), $('[name="operationalStateProvince"]'), '.stateRegionOperational');
  });

  $('[name="bankCountry"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="bankStateProvince"]'), $(this).val(), null);
  });
})