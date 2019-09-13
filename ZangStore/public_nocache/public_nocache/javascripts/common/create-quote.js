$(function () {

  var billingFields = [
    'billingAddress',
    'billingStateProvince',
    'billingCity',
    'billingPostalCode',
    'billingCountry'
  ];

  var shippingFields = [
    'shippingAddress',
    'shippingStateProvince',
    'shippingCity',
    'shippingPostalCode',
    'shippingCountry'
  ];



  $('a.create-a-quote-link').on('click', function (e) {
    e.preventDefault();

    var phoneNumber = $('[name="phoneNumber"]').val();
    var copyBillingAddress = $('[name="copyBillingAddress"]').is(':checked');

    var i=0;

    if(!phoneNumber) {
      var topPos = $('[name="phoneNumber"]').offset().top;
      $('html, body').animate({scrollTop: topPos-150});
      $('[name="phoneNumber"]').parent().addClass('has-error');
      $('[name="phoneNumber"]').parent().find('span.error-msg').text($(this).data('error-msg')).show();
      return;
    }

    var partnerId = $('[name="partnerId"]').val()

    if(!partnerId || partnerId === '-1') {
      var topPos = $('[name="partnerId"]').offset().top;
      $('html, body').animate({scrollTop: topPos-150});
      $('[name="partnerId"]').parent().addClass('has-error');
      $('[name="partnerId"]').parent().find('span.error-msg').text($(this).data('partner-error-msg')).show();
      return;
    }

    var url = $(this).attr('href');

    url += '?phoneNumber=' + encodeURIComponent(phoneNumber)
    url += '&partnerId=' + partnerId;

    /*for(i=0;i<billingFields.length;i++){
      var billingField = billingFields[i];
      var billingFieldValue = $('[name="' + billingField + '"]').val();
      if(billingFieldValue) {
        url += "&" + billingField + '=' + encodeURIComponent(billingFieldValue)
      }

    }

    for(i=0;i<shippingFields.length;i++) {
      var shippingField = shippingFields[i];
      var shippingFieldValue = $('[name="' + shippingField + '"]').val();
      var billingField = billingFields[i];
      var billingFieldValue = $('[name="' + billingField + '"]').val();
      if(copyBillingAddress) {
        if(billingFieldValue) {
          url += "&" + shippingField + '=' + encodeURIComponent(billingFieldValue)
        }
      } else {
        if(shippingFieldValue) {
          url += "&" + shippingField + '=' + encodeURIComponent(shippingFieldValue)
        }
      }
    }*/

    var notes = $('[name="notes"]').val();
    url += "&notes=" + encodeURIComponent(notes);

    //console.log(url);

    window.open(url, 'blank');

  });


});
