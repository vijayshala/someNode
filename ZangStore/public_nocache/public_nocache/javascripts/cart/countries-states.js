$(function () {
  const ns = '[countries-states]'
  var csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  var states = JSON.parse($('[name="states"]').val()),
      selectedBillingStateProvince = $('[name="selectedBillingStateProvince"]').val(),
    selectedShippingStateProvince = $('[name="selectedShippingStateProvince"]').val(),
    selectedE911StateProvince = $('[name="selectedE911StateProvince"]').val(),
    selectedPOStateProvince = $('[name="selectedPOStateProvince"]').val();
    var currentRegion = JSON.parse($('[name="currentRegion"]').val());

  function setStates(el, country, selected){
    var statesToRender = states.filter(function (state, i) {
      // console.log('state', state);
      return state.metadata.country === country;
    }).sort(function (a, b) {
      if(a.keyValue < b.keyValue) return -1;
      if(a.keyValue > b.keyValue) return 1;
      return 0;
    });
    var html = "<option value=''>- Select One -</option>";
    statesToRender.forEach(function (state, i) {
      html+= "<option value='" + $('<div/>').text(state.keyValue).html() + "' " + (state.keyValue === selected ? "selected='selected'" : '') + ">" + $('<div/>').text(state.description).html() + "</option>"
    });

    el.html(html);
  }

  function initStates(el, country, selected){
    var statesToRender = country.states || [];
    
    el.append($('<option>', {
      value: '',
      text: localizer.get('SELECT_ONE')
    }));

    // var html = "<option value=''>- Select One -</option>";
    statesToRender.forEach(function (state, i) {
      el.append($('<option>', {
        value: state.shortCode,
        text: state.name,
        selected: selected == state.shortCode
      }).attr('data-state', JSON.stringify(state)));
      //html+= "<option value='" + $('<div/>').text(state.shortCode).html() + "' " + (state.shortCode === selected ? "selected='selected'" : '') + ">" + $('<div/>').text(state.name).html() + "</option>"
    });
    // el.html(html);
  }

  function getCountryInfo(code, cb) {    
    var fn = ns + '[getCountryInfo]'
    $.ajax({
      headers: {        
        Authorization: 'abcd',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': csrf
      },
      url: '/clientapi/regions/countries/code/' + encodeURIComponent(code),// + code,// form.attr('action'),
      dataType: 'json',      
      method: 'GET',
      success: function (response) {
        console.info(fn, 'response:', response);
        cb(response.data)     
      },
      error: function (err) {
        console.error(fn, err)        
      }
    });
  }
 
  // if ($('[name="postate"]').val() === undefined) 
  //   setStates($('[name="billingAddress.state"]'), $('[name="billingAddress.country"]').val(), selectedBillingStateProvince);
  
  // setStates($('[name="shippingAddress.state"]'), $('[name="shippingAddress.country"]').val(), selectedShippingStateProvince);
  // setStates($('[name="e911Address.state"]'), $('[name="e911Address.country"]').val(), selectedE911StateProvince);
 
  setStates($('[name="companyStateProvince"]'), $('[name="companyCountry"]').val(), null);
  setStates($('[name="operationalStateProvince"]'), $('[name="operationalCountry"]').val(), null);
  setStates($('[name="bankStateProvince"]'), $('[name="bankCountry"]').val(), null);

  $('[name="billingAddress.country"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="billingAddress.state"]'), $(this).val(), selectedBillingStateProvince);
  });

   $('[name="billingAddress.country"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="billingAddress.state"]'), $(this).val(), selectedPOStateProvince);
  }); 


  $('[name="shippingAddress.country"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="shippingAddress.state"]'), $(this).val(), selectedShippingStateProvince);
  });

  $('[name="companyCountry"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="companyStateProvince"]'), $(this).val(), null);
  });

  $('[name="e911Address.country"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="e911Address.state"]'), $(this).val(), null);
  });

  $('[name="operationalCountry"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="operationalStateProvince"]'), $(this).val(), null);
  });

  $('[name="bankCountry"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="bankStateProvince"]'), $(this).val(), null);
  });

  $('[name="billingAddress.stateISO"]').on('change', function (e) {
    e.preventDefault();    
    var state = $('[name="billingAddress.stateISO"]').find(':selected').data('state');
    console.info('state', state);
    $('[name="billingAddress.state"]').val(state.name);    
  });

  $('[name="shippingAddress.stateISO"]').on('change', function (e) {
    e.preventDefault();    
    var state = $('[name="shippingAddress.stateISO"]').find(':selected').data('state');
    console.info('state', state);
    $('[name="shippingAddress.state"]').val(state.name);    
  });

  $('[name="e911Address.stateISO"]').on('change', function (e) {
    e.preventDefault();    
    var state = $('[name="e911Address.stateISO"]').find(':selected').data('state');
    console.info('state', state);
    $('[name="e911Address.state"]').val(state.name);    
  });

  if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1) {
    // getCountryInfo($('[name="billingAddress.country"]').val());
    getCountryInfo($('[name="billingAddress.countryISO"]').val(), function (country) {
      initStates($('[name="billingAddress.stateISO"]'), country, selectedBillingStateProvince);
      initStates($('[name="shippingAddress.stateISO"]'), country, selectedShippingStateProvince);
      initStates($('[name="e911Address.stateISO"]'), country, selectedE911StateProvince);
    });    
  } 

})
