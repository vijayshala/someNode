$(function () {

  $(window).scrollTop(0);

  function AlertUser(cls, message){
    /*$('.checkoutAlert')
    .removeClass('alert-success')
    .removeClass('alert-info')
    .removeClass('alert-warning')
    .removeClass('alert-danger')
    .addClass('alert-' + cls).html(message);*/
    $('#errorPrompt').show().find('span').text(message)

  }

  function SuccessResponse(response){
    AlertUser('success', response.message);
    window.location.href = response.redirect;
  }

  function ErrorResponse(response){
    AlertUser('danger', response.message);
    if(response.errors[0].param !== 'tosAgree'){
      $('html, body').animate({ scrollTop: 0 })
    }
    if(response.errors.length === 1) {
      var error = response.errors[0]
      if(error.param === null){
        AlertUser('danger', error.msg)
      } else {
        $('[name="' + error.param + '"]').parent().addClass('has-error');
        $('[name="' + error.param + '"]').next('span').text(error.msg).show();
      }
      return;
    }
    for(var i=0;i<response.errors.length;i++){
      var error = response.errors[i];
      if(error.param){
        $('[name="' + error.param + '"]').parent().addClass('has-error');
        $('[name="' + error.param + '"]').next('span').text(error.msg).show();
      }
    }
  }

  function ClearFormValidation(){
    var fields = $('#PlaceOrderForm').serializeArray();
    for(var i=0;i<fields.length;i++){
      var field = fields[i];
      $('[name="' + field.name + '"]').parent().removeClass('has-error')
      $('[name="' + field.name + '"]').next('span').text('').hide();
    }
  }

  function formatStaticFields() {

    $("[name='chosenNumber']").formatter({
      'pattern' : '+1{{999}}{{999}}{{9999}}'
    });

    $("[name='phoneNumber']").formatter({
      'pattern' : '+1{{999}}{{999}}{{9999}}'
    });

    $("[name='postalCode']").on('keyup', function (e) {
      $(this).val($(this).val().toUpperCase());
    });
  }


  function getCheckoutProgress(){

  }

  $('#PlaceOrderForm').on('submit', function (e) {
    e.preventDefault();
    $("#CheckoutSubmitBtn").attr('disabled', true);
    ClearFormValidation();

    $('#errorPrompt').hide()
    AlertUser('info', 'Placing Your order');

    $('.zs-progress-modal').fadeIn(500);

    $.ajax({
      headers: {
        'X-CSRF-Token': $('[name="_csrf"]').val()
      },
      url: $(this).attr('action'),
      dataType: 'json',
      data: $(this).serialize(),
      method:$(this).attr('method'),
      success: function (response) {
        console.log(this)
        $("#CheckoutSubmitBtn").attr('disabled', false);
        $('.zs-progress-modal').fadeOut(500);
        if(response.error){
          ErrorResponse(response);
        } else {
          SuccessResponse(response);
        }
      },
      error: function (err) {
        clearInterval(ProgressInterval)
        $("#CheckoutSubmitBtn").attr('disabled', false);
        $('.zs-progress-modal').fadeOut(500);
        AlertUser('danger', 'There was an error placing your order or creating your Zang Office account. Please contact Zang support for more information');
      }
    });

  });


  function SetShippingFieldsValue(fields, empty){
    for(var i=0;i<fields.length;i++){
      var field = fields[i];
      var name = field.name;
      if(name.indexOf('billing') > -1){
        var tempName = name.replace('billing', '');
        $('[name="shipping' + tempName + '"]').val(empty ? '' : field.value);
      }
    }

    if(!empty){
      setStates($('[name="shippingStateProvince"]'), $('[name="shippingCountry"]').val(), $('[name="billingStateProvince"]').val());
    }
  }


  $('#copyBillingAddress').on('change', function (e) {
    SetShippingFieldsValue($('#PlaceOrderForm').serializeArray(), !$(this).is(':checked'));
  });

  $('[data-toggle="tooltip"]').tooltip({trigger: 'focus'})
  formatStaticFields();

  /*$('.place-order-form .form-control').prev('label').each(function (lbl) {
    var html = $(this).html();
    var newHtml = "<span class='text-danger'>&#10035;</span>" + html;
    $(this).html(newHtml);
  });*/

  var states = JSON.parse($('[name="states"]').val()),
      selectedBillingStateProvince = $('[name="selectedBillingStateProvince"]').val(),
      selectedShippingStateProvince = $('[name="selectedShippingStateProvince"]').val();

  function setStates(el, country, selected){
    var statesToRender = states.filter(function (state, i) {
      return state.metadata.country === country;
    }).sort(function (a, b) {
      if(a.keyValue < b.keyValue) return -1;
      if(a.keyValue > b.keyValue) return 1;
      return 0;
    });
    var html = "";
    statesToRender.forEach(function (state, i) {
      html+= "<option value='" + $('<div/>').text(state.keyValue).html() + "' " + (state.keyValue === selected ? "selected='selected'" : '') + ">" + $('<div/>').text(state.description).html() + "</option>"
    });

    el.html(html);
  }

  setStates($('[name="billingStateProvince"]'), $('[name="billingCountry"]').val(), selectedBillingStateProvince);
  setStates($('[name="shippingStateProvince"]'), $('[name="shippingCountry"]').val(), selectedShippingStateProvince);

  $('[name="billingCountry"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="billingStateProvince"]'), $(this).val(), selectedBillingStateProvince);
  });

  $('[name="shippingCountry"]').on('change', function (e) {
    e.preventDefault()
    setStates($('[name="shippingStateProvince"]'), $(this).val(), selectedShippingStateProvince);
  });





});
