$(function (){

  // var cart = JSON.parse($('[name="cart"]').val());
  var creditCards = JSON.parse($('[name="creditCards"]').val());
  //displayTax();
  var currentRegion = JSON.parse($('[name="currentRegion"]').val());

  var lastTaxRequest = 0;
  function displayTax() {
    var fn = '[get-checkout-totals][displayTax]';

    displayTaxCalculationProgress(true);
    ClearFormValidation();
    var cartInfo = {
      billingAddress: {
        address1: $('[name="billingAddress.address1"]').val(),
        country: $('[name="billingAddress.country"]').val(),
        city: $('[name="billingAddress.city"]').val(),
        state: $('[name="billingAddress.state"]').val(),
        zip: $('[name="billingAddress.zip"]').val(),
        countryISO: $('[name="billingAddress.countryISO"]').val(),
        stateISO: $('[name="billingAddress.stateISO"]').val(),
      },
      shippingAddress: {
        sameAsBilling: $('[name="shippingAddress.sameAsBilling"]').is(':checked'),
        address1: $('[name="shippingAddress.sameAsBilling"]').is(':checked')
          ? $('[name="billingAddress.address1"]').val()
          : $('[name="shippingAddress.address1"]').val(),
        country: $('[name="shippingAddress.sameAsBilling"]').is(':checked')
          ? $('[name="billingAddress.country"]').val()
          : $('[name="shippingAddress.country"]').val(),
        city: $('[name="shippingAddress.sameAsBilling"]').is(':checked')
          ? $('[name="billingAddress.city"]').val()
          : $('[name="shippingAddress.city"]').val(),
        state: $('[name="shippingAddress.sameAsBilling"]').is(':checked')
          ? $('[name="billingAddress.state"]').val()
          : $('[name="shippingAddress.state"]').val(),
        zip: $('[name="shippingAddress.sameAsBilling"]').is(':checked')
          ? $('[name="billingAddress.zip"]').val()
          : $('[name="shippingAddress.zip"]').val(),
        countryISO: $('[name="shippingAddress.sameAsBilling"]').is(':checked')
          ? $('[name="billingAddress.countryISO"]').val()
          : $('[name="shippingAddress.countryISO"]').val(),
        stateISO: $('[name="shippingAddress.sameAsBilling"]').is(':checked')
          ? $('[name="billingAddress.stateISO"]').val()
          : $('[name="shippingAddress.stateISO"]').val(),
      },
      company:{        
        nid: $("[name='company.nid']").val(),
        domain: $("[name='company.domain']").val(),
        name: $("[name='company.name']").val(),
        industry: $("[name='company.industry']").val(),
        isIncorporated: $('[name="company.isIncorporated"]:checked').val() !== '' ? $('[name="company.isIncorporated"]:checked').val() === 'true' : ''
      }
    }

    const currentTaxRequest = ++lastTaxRequest;

    $.ajax({
      headers: {
        'X-CSRF-Token': $('[name="_csrf"]').val(),
        // 'x-csrftoken': cookie.load('_csrf'),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      url: '/clientapi/cart/',// + cartItem._id,
      method: 'POST',
      data: JSON.stringify(cartInfo),
      success: function (response) {
        if (currentTaxRequest != lastTaxRequest) {
          return;
        }
        // ZsGlobalMask(null)
        // displayTaxCalculationProgress(true);
        if(!response.error) {
          displayTaxCalculationProgress(false);
        }
        if (cartCheckout.displayWarnings({
          warnings: displayBillingAddressWarnings(response)
        })) { //checkAddressWarnings
          return;
        }
        //displayTaxCalculationProgress(true);
        $('#CheckoutSubmitBtn').removeClass('disabled');
        var cart = response.data;
        //.onetime.cart-taxes
        var amount = '';
        var html = '';
        var taxDetails = {};
        if(cart.hasOwnProperty('onetime')) {
          amount = (cart.onetime.total);
          console.info(fn, 'onetime total', cart.onetime);
          //webApp.formatCurrency
          html = amountTemplate
            .replace('{VALUE}', $('<div/>').text(webApp.formatCurrency(amount, {code: cart.currency})).html())
          $('.onetime.cart-total').html(html);

          amount = (cart.onetime.tax);
          if (currentRegion.countryISO != 'DE') {
            html = amountTemplate
              .replace('{VALUE}', $('<div/>').text(webApp.formatCurrency(amount, {code: cart.currency})).html())
            $('.onetime.cart-taxes').html(html);
          }

          for (var ti in cart.onetime.taxDetails)  {
            var taxItem = cart.onetime.taxDetails[ti];
            taxDetails[taxItem.tid] = {
              title: taxItem.title.text,
              one: taxItem.amount
            };
          }
        }

        if (cart.hasOwnProperty('subscriptions')) {
          var subscription = cart.subscriptions && cart.subscriptions.length && cart.subscriptions[0] || null;
          console.info(fn, 'subscription total', subscription);
          if (subscription) {
            amount = (subscription.total);
            
            html = amountTemplate.replace('{VALUE}', $('<div/>').text(webApp.formatCurrency(amount, {code: cart.currency})).html())
            $('.subscription.cart-total').html(html);

            amount = (subscription.tax);
            if (currentRegion.countryISO != 'DE') {
              html = amountTemplate.replace('{VALUE}', $('<div/>').text(webApp.formatCurrency(amount, {code: cart.currency})).html())
              $('.subscription.cart-taxes').html(html);
            }
            for (var ti in subscription.taxDetails)  {
              var taxItem = subscription.taxDetails[ti];
              if (taxDetails[taxItem.tid]) {
                taxDetails[taxItem.tid]['sub'] = taxItem.amount;
              } else {
                taxDetails[taxItem.tid] = {
                  title: taxItem.title.text,
                  sub: taxItem.amount
                };
              }
            }
          }                  
        }

        var taxHtml = '';
        var taxRowTemplate = '<tr class="tax-details"><td colspan="2"></td><td style="text-transform: capitalize;">{TAX_TITLE}</td><td class="total" style="font-weight:normal;">{TAX_AMOUNT_ONE_TIME}</td><td class="total" style="font-weight:normal;">{TAX_AMOUNT_SUBSCRIPTION}</td></tr>';
        for (var ti in taxDetails)  {
          var amount = (taxDetails[ti].one ? taxDetails[ti].one : 0);
          var onetime = amountTemplate.replace('{VALUE}', $('<div/>').text(webApp.formatCurrency(amount, {code: cart.currency})).html())
            
            // .replace('{CURRENCY}', $('<div/>').text(currencySymbol).html())
            // .replace('{WHOLE}', $('<div/>').text(amount.split('.')[0]).html())
            // .replace('{DECIMALS}', $('<div/>').text(amount.split('.')[1]).html());
          amount = (taxDetails[ti].sub ? taxDetails[ti].sub : 0);
          var sub = amountTemplate.replace('{VALUE}', $('<div/>').text(webApp.formatCurrency(amount, {code: cart.currency})).html())
          taxHtml += taxRowTemplate.replace('{TAX_TITLE}', localizer.get(taxDetails[ti].title))
            .replace('{TAX_AMOUNT_ONE_TIME}', onetime)
            .replace('{TAX_AMOUNT_SUBSCRIPTION}', sub);
        }
        $('tr.total-divider.taxDetailsBefore').before(taxHtml);
        // $('[name="cartItem"]').val(JSON.stringify(response.cartItem));
      },
      error: function (response) {
        if (currentTaxRequest != lastTaxRequest) {
          return;
        }
        console.error(response);
        // ZsGlobalMask(null)
        displayTaxCalculationProgress(true);
      }
    })
  }

  // var cartItemDetails = JSON.parse($('[name="cartItemDetails"]').val());
  //var localizer = JSON.parse($('[name="LOCALIZER"]').val());
  var amountTemplate = [
    "<div class='currency'>{VALUE}</div>"
  ].join('');
  
  function displayBillingAddressWarnings(response) {
    var fn = '[checkAddressWarnings]'
    var warnings = [];
    console.log(fn, 'warnings', response.warnings);
    for (var warning of (response.warnings || [])) {
      // console.log(fn, 'warning', warning)
      if (warning && warning.reference &&
        (warning.reference.indexOf('billingAddress') > -1
          || warning.reference.indexOf('shippingAddress') > -1)
      ) {
        warnings.push(warning);
      }
    }
    return warnings
  }

  function ClearFormValidation() {
    var fields = $('#PlaceOrderForm').serializeArray();
    for (var i = 0; i < fields.length; i++){      
      var field = fields[i];
      if ((field.name.indexOf('billingAddress') > -1
        || field.name.indexOf('shippingAddress') > -1)) {              
        $('[name="' + field.name + '"]').parents('.form-group').removeClass('has-error')
        $('[name="' + field.name + '"]').parents('.form-group').find('span.error-msg').text('').hide();
      }  
    }
  }

  var onTaxFieldsChange = function(e) {
    var fn = '[get-checkout-totals][onTaxFieldsChange]';
    if(e){
      e.preventDefault();
    }

    var copyBillingAddress = $('[name="shippingAddress.sameAsBilling"]').is(':checked');
    var prefix = copyBillingAddress ? 'billingAddress.' : 'shippingAddress.'
    var addressStreet = $('[name="'+prefix+'address1"]').val(),
        addressCity = $('[name="'+prefix+'city"]').val(),
        addressState = $('[name="'+prefix+'state"]').val(),
        addressPostal = $('[name="'+prefix+'zip"]').val(),
      addressCountry = $('[name="' + prefix + 'country"]').val();
  
    // Check the address and display tax once all fields are populated
    if (addressStreet != '' && addressCity != '' && addressPostal != '' && addressCountry != '' && addressState != '') {
      displayTax();
    }
    
  }

  function displayTaxCalculationProgress(hide) {
    if (hide) {
      console.log("---->I am still calculating");
      $('.tax-details').remove();
      $('.onetime.cart-taxes').html('<div class="loader--spin"><img class="loading-tax" src="/public_nocache/images/loading-spinner-grey.gif" /></div>');
      $('.subscription.cart-taxes').html('<div class="loader--spin"><img class="loading-tax" src="/public_nocache/images/loading-spinner-grey.gif" /></div>');
      $('.total.onetime.cart-total').html('<div class="loader--spin"><img class="loading-tax" src="/public_nocache/images/loading-spinner-grey.gif" /></div>');
      $('.total.subscription.cart-total').html('<div class="loader--spin"><img class="loading-tax" src="/public_nocache/images/loading-spinner-grey.gif" /></div>');
      $('#CheckoutSubmitBtn').addClass('disabled');

      // $('#one-time-tax').addClass('loading-tax');
      // $('.taxCalculation').hide();
      // $('.withTaxField').show();
      // $('#CheckoutSubmitBtn').removeAttr("disabled");       
      // $('.create-a-quote-link').removeAttr("disabled");       
    }
    else {
      console.log("--->Calculation is done");
      $('#CheckoutSubmitBtn').removeClass('disabled');
      // $('#one-time-tax').removeClass('loading-tax');
      // $('.withTaxField').hide();
      // $('.taxCalculation').show();
      // $('#CheckoutSubmitBtn').attr("disabled", true);
      // $('.create-a-quote-link').attr("disabled", true);
    }
  }



  function attachEvents(prefix) {
    // var copyBillingAddress = $('[name="shippingAddress.sameAsBilling"]').is(':checked');
    // var prefix = copyBillingAddress ? 'billingAddress.' : 'shippingAddress.'
    // $('[name="'+prefix+'.address1"]').unbind('change', onTaxFieldsChange);
    // $('[name="'+prefix+'.city"]').unbind('change', onTaxFieldsChange);
    // $('[name="'+prefix+'.state"]').unbind('change', onTaxFieldsChange);
    // $('[name="'+prefix+'.zip"]').unbind('change', onTaxFieldsChange);
    // $('[name="'+prefix+'.country"]').unbind('change', onTaxFieldsChange);

    $('[name="'+prefix+'.address1"]').on('change', onTaxFieldsChange);
    $('[name="'+prefix+'.city"]').on('change', onTaxFieldsChange);
    $('[name="' + prefix + '.state"]').on('change', onTaxFieldsChange);
    $('[name="' + prefix + '.stateISO"]').on('change', onTaxFieldsChange);
    $('[name="' + prefix + '.zip"]').on('change', onTaxFieldsChange);
    $('[name="' + prefix + '.country"]').on('change', onTaxFieldsChange);
    $('[name="' + prefix + '.countryISO"]').on('change', onTaxFieldsChange);
  }

  if (!currentRegion || currentRegion.countryISO != 'DE') {
    $('[name="company.isIncorporated"]').on('change', onTaxFieldsChange);
    var copyBillingAddress = $('[name="shippingAddress.sameAsBilling"]').is(':checked');
    attachEvents('billingAddress');
    attachEvents('shippingAddress');
    $('[name="shippingAddress.sameAsBilling"]').on('change', function (e) {
      e.preventDefault()
      // var copyBillingAddress = $('[name="shippingAddress.sameAsBilling"]').is(':checked');
      // if (copyBillingAddress) {
      //   attachEvents('shippingAddress');  
      // }    
      onTaxFieldsChange();
    });
  }
  

  // setTimeout(function () {
  //   onTaxFieldsChange();
  // }, 1000)



});
