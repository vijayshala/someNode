window.cartCheckout = (function () {
  const ns = '[cart-checkout]'
  const DID_TYPE_EXISTING = 'did-existing';
  const DID_TYPE_TOLLFREE = 'did-tollfree';
  const DID_TYPE_LOCAL = 'did-local';
  $(window).scrollTop(0);


  // default form values from local storage
  var BillingSameAsAccount = localStorage.getItem('BillingSameAsAccount') ? (localStorage.getItem('BillingSameAsAccount') === "true" ? true : false) : true;
  var ShippingSameAsAccount = localStorage.getItem('ShippingSameAsAccount') ? (localStorage.getItem('ShippingSameAsAccount') === "true" ? true : false) : true;
  var SameAsBilling = localStorage.getItem('SameAsBilling') ? (localStorage.getItem('SameAsBilling') === "true" ? true : false) : true;
  // var SameAsBilling = JSON.parse($('[name="cart"]').val());
  var E911SameAsBilling = localStorage.getItem('E911SameAsBilling') ? localStorage.getItem('E911SameAsBilling') : 'billing';
  var PaymentMethod = localStorage.getItem('paymentType') ? localStorage.getItem('paymentType') : 'creditCard';
  //var localizer = JSON.parse($('[name="LOCALIZER"]').val());
  var cart = JSON.parse($('[name="cart"]').val());
  var currentRegion = JSON.parse($('[name="currentRegion"]').val());
  var creditCartGateWay = $('[name="creditCartGateWay"]').val();
  var companies = JSON.parse($('[name="companies"]').val());
  var userContactInfo = JSON.parse($('[name="userContactInfo"]').val());
  var creditCards = JSON.parse($('[name="creditCards"]').val());
  // var cartItemDetails = JSON.parse($('[name="cartItemDetails"]').val());

  function AlertUser(cls, message) {
    $(window).scrollTop(0);
    /*$('.checkoutAlert')
    .removeClass('alert-success')
    .removeClass('alert-info')
    .removeClass('alert-warning')
    .removeClass('alert-danger')
    .addClass('alert-' + cls).html(message);*/
    $('.temperror').remove();
    var messages = message.split('\n');
    if (messages[0]) {
      var e = $('<div class="temperror"></div>').addClass('inline-display').text(messages[0]);
      $('#errorPrompt').append(e);
    }
    for (var i = 1; i < messages.length; i++) {
      var e = $('<div class="temperror" ></div>').text(messages[i]);
      $('#errorPrompt').append(e);
    }

    $('#errorPrompt').show();

  }

  function SuccessResponse(response) {
    // AlertUser('success', response.message);
    window.location.href = '/orders/' + response.data._id;
  }

  const ERROR_CODES = {
    'VIOLATION.FIELD_IS_EMPTY': '',
    'VIOLATION.FIELD_VALUE_INVALID': '',
    'VIOLATION.TAX_CALCULATION_FAILED': '',
    'VIOLATION.AGREE_ON_LEGAL_DOC': '',
    'VIOLATION.CART_IS_EMPTY': '',
    'VIOLATION.CART_IS_TOO_BIG': '',
  }

  function isLegalDocAgreed(cart, doc) {
    var legalDocumentConsents = cart.legalDocumentConsents || [];
    for (var i in legalDocumentConsents) {
      if (legalDocumentConsents[i].identifier == doc.identifier) {
        return legalDocumentConsents[i].consent || false;
      }
    }
    return false;
  }
  function initLegalDocsByCart(cart) {
    var fn = '[initLegalDocsByCart]'
    var items = cart.items || [];
    var legals = $('.checkout-legal-checks')[0];
    var checkboxes = '';
    if (legals) {
      for (var i in items) {
        var item = items[i];
        if (item.legalDocuments && item.legalDocuments.length) {
          for (var j in item.legalDocuments) {
            var doc = item.legalDocuments[j];
            console.log(fn, 'doc', doc)
            let title = doc.content ? doc.content.resource ? localizer.get(doc.content.resource) : doc.content.text || '' : '';
            if (title == '') {
              title = doc.title ? doc.title.resource ? localizer.get(doc.title.resource) : doc.title.text || '' : '';
            }
            var row = $('<label class="tos-container form-group"></label>').data('legal', doc)
              .append($('<input type="checkbox" />')
                .attr('name', 'legalDocumentConsents[' + doc.identifier + ']')
                .prop('checked', isLegalDocAgreed(cart, doc))
              )
              .append($('<div class="checker"></div>'))
              .append($('<div class="box" /></div>'))
              .append(!doc.url && !doc.pdf ? '<p class="inlineTOS">&nbsp;&nbsp;' + title + '</p>' : '')
              .append(doc.url || doc.pdf ? $('<a href="javascript:void;"></a>').text(title) : '')
              .append($('<span class="error-msg"></span>'));


            $('.checkout-legal-checks').append(row);
          }
        }
      }

      $(document).on("tap click", 'label a', function (event, data) {
        event.stopPropagation();
        event.preventDefault();
        window.open($(this).attr('href'), $(this).attr('target'));
        return false;
      });
    }
  }

  function getUserLegalConcents(cart) {
    var fn = '[getUserLegalConcents]'
    var items = cart.items || [];
    var legals = $('.checkout-legal-checks');
    var legalDocumentConsents = [];
    var warnings = [];
    // console.log(fn, 'children', $('.checkout-legal-checks').children())
    $('.checkout-legal-checks').children().each(function (index, obj) {
      var doc = $(obj).data('legal');
      var domId = '[name="legalDocumentConsents[' + doc.identifier + ']"]';
      console.log(fn, 'doc', doc, 'isChecked', $(domId).is(':checked'));
      if ($(domId).is(':checked')) {
        legalDocumentConsents.push({
          consent: $(domId).is(':checked'),
          identifier: doc.identifier,
          _id: doc._id
        })
      } else {
        warnings.push({
          code: 'VIOLATION.AGREE_ON_LEGAL_DOC',
          message: localizer.get('VIOLATION.AGREE_ON_LEGAL_DOC').replace('{1}', localizer.get(doc.title.resource || doc.title.text)),
          reference: 'legalDocumentConsents[' + doc.identifier + ']',
        });
      }
    })
    if (warnings.length) {
      displayWarnings({ warnings });
      throw (warnings);
    }

    return legalDocumentConsents;
  }

  function getWarnMessage(message) {
    var msg = message;
    if (message.resource && message.resource.length) {
      var errTemplate = localizer.get(message.resource[0]);
      for (var i = 1; i < message.resource.length; i++) {
        errTemplate = errTemplate.replace('{' + i + '}', localizer.get(message.resource[i]));
      }
      msg = errTemplate
    }
    else {
      if (message.text) {
        msg = message.text
      }
    }
    return msg;
  }

  function displayWarnings(response, filterResources = []) {
    var fn = '[displayWarnings]'
    $("#CheckoutSubmitBtn").attr('disabled', false);
    $('#ProcessModal').fadeOut(500);

    // AlertUser('danger', '');

    if (response.redirect) {
      window.location.href = response.redirect
      return;
    }

    let errMessages = [];
    let msg = '';
    let firstInputResource = '';
    for (var warning of response.warnings) {
      if (warning) {
        msg = getWarnMessage(warning.message);
        console.log(fn, 'msg', msg)
        if ($('[name="' + warning.reference + '"]')[0]) {
          $('[name="' + warning.reference + '"]').parents('.form-group').addClass('has-error');
          $('[name="' + warning.reference + '"]').parents('.form-group').find('span.error-msg').text(msg).show();
          if (!firstInputResource) {
            firstInputResource = warning.reference
            $('[name="' + warning.reference + '"]').focus();
          }
          console.log('warning', warning.reference, $('[name="' + warning.reference + '"]').parents('.form-group').find('span.error-msg'))
        }
        else {
          if (msg) {
            errMessages.push(msg);
          }
        }
      }
    }
    if (errMessages.length) {
      AlertUser('danger', errMessages.join('\n'));
    }
    return response.warnings.length > 0;
  }

  function isUndefined(val) {
    return val == undefined || val === ''
  }

  function ClearFormValidation() {
    var fields = $('#PlaceOrderForm').serializeArray();
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      $('[name="' + field.name + '"]').parents('.form-group').removeClass('has-error')
      $('[name="' + field.name + '"]').parents('.form-group').find('span.error-msg').text('').hide();
    }
  }

  function formatStaticFields() {

    $("[name='chosenNumber']").formatter({
      'pattern': '+1{{999}}{{999}}{{9999}}'
    });

    $("[name='phoneNumber']").formatter({
      'pattern': '+1{{999}}{{999}}{{9999}}'
    });

    $("[name='postalCode']").on('keyup', function (e) {
      $(this).val($(this).val().toUpperCase());
    });
  }


  function e911Check(e) {
    if (e) {
      e.preventDefault();
    }
    var billingCountry = $("[name='billingCountry']").val();
    if (billingCountry === "Canada") {
      $(".e911Check").show();
    } else {
      $(".e911Check").hide();
    }
  }

  function getOneTimeDiscountDiff() {
    return;
    var theCartItem = JSON.parse($('[name="cartItem"]').val());
    var totalOneTimeDiscount = 0;
    var sm = theCartItem.product.salesmodel
    for (var p in sm) {
      if (sm.hasOwnProperty(p) && p !== 'system') {
        var userType = sm[p];
        totalOneTimeDiscount += (theCartItem.product.price.oneTimeDiscount * userType.users.length)
      }
    }
    return totalOneTimeDiscount - cartItemDetails.oneTimeTotalWithoutDiscount
  }

  function validateInputs() {
    let warnings = [];
    // if (currentRegion.shortCode !== 'DE') {
    //   isValidInput('partnerId', warnings, ['-1', '', null]);
    // }

    isValidInput('company.domain', warnings);
    isValidInput('company.name', warnings);
    if ($('#companyIdField').is(':visible')) {
      if (!$('[name="company.nid"]').val()) {
        isValidInput('company.nid', warnings);
      }
    }

    isValidInput('contact.email', warnings);
    isValidInput('contact.firstName', warnings);
    isValidInput('contact.lastName', warnings);

    isValidInput('contact.phone', warnings);

    if (currentRegion.shortCode === 'DE') {
      isValidInput('billingAddress.email', warnings);
      if (!$('[name="billingAddress.sameAsAccount"]').is(':checked')) {
        isValidInput('billingAddress.addressee', warnings);
        isValidInput('billingAddress.address1', warnings);
        isValidInput('billingAddress.country', warnings);
        isValidInput('billingAddress.city', warnings);
        if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1) {
          isValidInput('billingAddress.state', warnings);
        }

        isValidInput('billingAddress.zip', warnings);
      }
    } else {
      isValidInput('billingAddress.address1', warnings);
      isValidInput('billingAddress.country', warnings);
      isValidInput('billingAddress.city', warnings);
      if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1) {
        isValidInput('billingAddress.state', warnings);
      }

      isValidInput('billingAddress.zip', warnings);
    }

    if (currentRegion.shortCode === 'DE') {
      isValidInput('company.vatNumber', warnings);
    } else {
      isValidInput('company.isIncorporated', warnings);
      isValidInput('company.industry', warnings);

      if (isUndefined($('[name="company.isIncorporated"]:checked').val())) {
        warnings.push({
          code: 'THIS_FIELD_IS_REQUIRED',
          message: localizer.get('THIS_FIELD_IS_REQUIRED'),
          reference: 'company.isIncorporated',
        })
      }
    }

    if (!$('[name="shippingAddress.sameAsBilling"]').is(':checked') && !$('[name="shippingAddress.sameAsAccount"]').is(':checked')) {
      if (currentRegion.shortCode === 'DE') {
        isValidInput('shippingAddress.addressee', warnings);
      }
      isValidInput('shippingAddress.address1', warnings);
      isValidInput('shippingAddress.country', warnings);
      isValidInput('shippingAddress.city', warnings);
      if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1) {
        isValidInput('shippingAddress.state', warnings);
      }
      isValidInput('shippingAddress.zip', warnings);
    }

    if (webApp.hasCartItemByTag(cart, 'did-main') && $('[name="e911Address.sameAs"]:checked').val() == 'other') {
      isValidInput('e911Address.address1', warnings);
      isValidInput('e911Address.country', warnings);
      isValidInput('e911Address.city', warnings);
      if (currentRegion.addressFormClass == 0 || currentRegion.addressFormClass == 1) {
        isValidInput('e911Address.state', warnings);
      }
      isValidInput('e911Address.zip', warnings);
    }

    if ($('[name="paymentType"]:checked').val() == 'purchaseOrder') {
      isValidInput('purchaseOrder.refNumber', warnings);
    } else if ($('[name="paymentType"]:checked').val() == 'creditCard') {

      if (creditCards.length) {
        isValidInput('creditCardId', warnings);
      }
      else {
        isValidInput('creditCardName', warnings);
      }
    } else {
      isValidInput('IBAN', warnings);
      if (!$('[name="IBANAuthorization"]').is(':checked')) {
        warnings.push({
          code: 'THIS_FIELD_IS_REQUIRED',
          message: localizer.get('THIS_FIELD_IS_REQUIRED'),
          reference: 'IBANAuthorization',
        })
      }
    }



    if (warnings.length) {
      displayWarnings({ warnings });
      throw (warnings);
    }
  }

  function isValidInput(reference, warnings, invalidValue = ['', null, 'undefined', undefined], secondaryReference) {
    if (reference && invalidValue.indexOf($("[name='" + reference + "']").val()) > -1
      || isUndefined($("[name='" + reference + "']").val())) {
      warnings.push({
        code: 'THIS_FIELD_IS_REQUIRED',
        message: localizer.get('THIS_FIELD_IS_REQUIRED'),
        reference: secondaryReference || reference,
      })
    }
  }


  function setE911Address(cart) {
    if (!webApp.hasCartItemByTag(cart, 'did-main')) {
      return cart;
    }
    for (var item of cart.items || []) {
      if (item.offer && item.level == 1 && item.salesModelItem && [DID_TYPE_EXISTING, DID_TYPE_TOLLFREE, DID_TYPE_LOCAL].indexOf(item.salesModelItem.identifier) > -1) {
        item.salesModelItem.helper = item.salesModelItem.helper || {}
        item.salesModelItem.helper.e911Address = {
          address1: $('[name="e911Address.address1"]').val(),
          country: $('[name="e911Address.country"]').val(),
          city: $('[name="e911Address.city"]').val(),
          state: $('[name="e911Address.state"]').val(),
          zip: $('[name="e911Address.zip"]').val(),
          countryISO: $('[name="e911Address.countryISO"]').val(),
          stateISO: $('[name="e911Address.stateISO"]').val(),
        }
        var shippingSameAsBilling = $('[name="shippingAddress.sameAsBilling"]').is(':checked');
        if (shippingSameAsBilling) {
          item.salesModelItem.helper.e911Address = {
            address1: $('[name="billingAddress.address1"]').val(),
            country: $('[name="billingAddress.country"]').val(),
            city: $('[name="billingAddress.city"]').val(),
            state: $('[name="billingAddress.state"]').val(),
            zip: $('[name="billingAddress.zip"]').val(),
            countryISO: $('[name="billingAddress.countryISO"]').val(),
            stateISO: $('[name="billingAddress.stateISO"]').val(),
          }
        } else {
          switch ($('[name="e911Address.sameAs"]:checked').val()) {
            case 'billing':
              item.salesModelItem.helper.e911Address = {
                address1: $('[name="billingAddress.address1"]').val(),
                country: $('[name="billingAddress.country"]').val(),
                city: $('[name="billingAddress.city"]').val(),
                state: $('[name="billingAddress.state"]').val(),
                zip: $('[name="billingAddress.zip"]').val(),
                countryISO: $('[name="billingAddress.countryISO"]').val(),
                stateISO: $('[name="billingAddress.stateISO"]').val(),
              }
              break;
            case 'shipping':
              item.salesModelItem.helper.e911Address = {
                address1: $('[name="shippingAddress.address1"]').val(),
                country: $('[name="shippingAddress.country"]').val(),
                city: $('[name="shippingAddress.city"]').val(),
                state: $('[name="shippingAddress.state"]').val(),
                zip: $('[name="shippingAddress.zip"]').val(),
                countryISO: $('[name="shippingAddress.countryISO"]').val(),
                stateISO: $('[name="shippingAddress.stateISO"]').val(),
              }
              break;
          }
        }
      }
    }
    return cart;
  }

  function prepareCartPayload() {
    var fn = ns + '[prepareCartPayload]'
    let partnerId = $("[name='partnerId']").val();
    if (partnerId == '-1') {
      partnerId = null;
    }

    let crt = setE911Address(cart);
    var isExistingCustomer = $('[name="company.isExistingCustomer"]:checked').val();
    var existingCustomerReference = isExistingCustomer != '' ? $('[name="company.existingCustomerReference"]').val() : '';
    console.info(fn, 'crt:', crt);
    let accountAddress = {
      address1: $('[name="company.address1"]').val(),
      country: $('[name="company.country"]').val(),
      city: $('[name="company.city"]').val(),
      state: $('[name="company.state"]').val(),
      zip: $('[name="company.zip"]').val(),
      countryISO: $('[name="company.countryISO"]').val(),
      stateISO: $('[name="company.stateISO"]').val(),
    };
    let billingAddress = $('[name="billingAddress.sameAsAccount"]').is(':checked') ?
      Object.assign({
        addressee: $("[name='company.name']").val(),
        email: $('[name="contact.email"]').val(),
      }, accountAddress) : {
        addressee: $('[name="billingAddress.addressee"]').val(),
        address1: $('[name="billingAddress.address1"]').val(),
        country: $('[name="billingAddress.country"]').val(),
        city: $('[name="billingAddress.city"]').val(),
        state: $('[name="billingAddress.state"]').val(),
        zip: $('[name="billingAddress.zip"]').val(),
        countryISO: $('[name="billingAddress.countryISO"]').val(),
        stateISO: $('[name="billingAddress.stateISO"]').val(),
        email: $('[name="billingAddress.email"]').val(),
      };
    let shippingAddress = $('[name="shippingAddress.sameAsBilling"]').is(':checked') ? Object.assign({}, billingAddress) : $('[name="shippingAddress.sameAsAccount"]').is(':checked') ?
      Object.assign({
        addressee: $("[name='company.name']").val(),
        email: $('[name="contact.email"]').val()
      }, accountAddress) : {
        addressee: $('[name="shippingAddress.addressee"]').val(),
        address1: $('[name="shippingAddress.address1"]').val(),
        country: $('[name="shippingAddress.country"]').val(),
        city: $('[name="shippingAddress.city"]').val(),
        state: $('[name="shippingAddress.state"]').val(),
        zip: $('[name="shippingAddress.zip"]').val(),
        countryISO: $('[name="shippingAddress.countryISO"]').val(),
        stateISO: $('[name="shippingAddress.stateISO"]').val(),
        email: $('[name="shippingAddress.email"]').val(),
      };

    let cartInfo = {
      partner: partnerId,
      legalDocumentConsents: getUserLegalConcents(cart),
      notes: $("[name='notes']").val(),
      contact: {
        allowToContact: $("[name='allowToContact']").is(':checked'),
        firstName: $("[name='contact.firstName']").val(),
        lastName: $("[name='contact.lastName']").val(),
        phone: $("[name='contact.phone']").val(),
        email: $("[name='contact.email']").val(),
      },
      company: Object.assign({
        nid: $("[name='company.nid']").val(),
        domain: $("[name='company.domain']").val(),
        name: $("[name='company.name']").val(),
        industry: $("[name='company.industry']").val(),
        isIncorporated: $('[name="company.isIncorporated"]:checked').val() !== '' ? $('[name="company.isIncorporated"]:checked').val() === 'true' : '',
        vatNumber: $('[name="company.vatNumber"]').val(),
        existingCustomerReference: existingCustomerReference
      }, accountAddress),
      billingAddress: billingAddress,
      shippingAddress: Object.assign({ sameAsBilling: $('[name="shippingAddress.sameAsBilling"]').is(':checked') }, shippingAddress),
      items: crt.items || []
    }

    var paymentType = $('[name="paymentType"]:checked').val();
    if (paymentType == 'creditCard') {
      if (creditCards.length) {
        const userPaymentMethodChoice = $('[name="creditCardId"]').find(':selected').data('payment-method');
        cartInfo.payment = $.extend(cart.payment, userPaymentMethodChoice);
      }
      else {
        cartInfo.newPayment = {
          billingEngine: creditCartGateWay, //'STRIPE'
          metadata: {
            paymentType: "CREDIT_CARD",
            creditCard: {
              token: $('[name="stripeToken"]').val()
            }
          }
        }
      }
    } else if (paymentType == 'purchaseOrder') {
      const POOBJ = {
        metadata: {
          purchaseOrder: {
            contact: {
              firstName: $('[name="contact.firstName"]').val(),
              lastName: $('[name="contact.lastName"]').val(),
              phone: $('[name="contact.phone"]').val(),
              email: $('[name="contact.email"]').val(),
            },
            company: {
              name: $('[name="company.name"]').val(),
              isIncorporated: $('[name="company.isIncorporated"]:checked').val() !== '' ? $('[name="company.isIncorporated"]:checked').val() === 'true' : '',
            },
            billingAddress: {
              address1: $('[name="billingAddress.address1"]').val(),
              city: $('[name="billingAddress.city"]').val(),
              state: $('[name="billingAddress.state"]').val(),
              zip: $('[name="billingAddress.zip"]').val(),
              country: $('[name="billingAddress.country"]').val(),
              countryISO: $('[name="billingAddress.countryISO"]').val(),
              stateISO: $('[name="billingAddress.stateISO"]').val(),
            },
            refNumber: $('[name="purchaseOrder.refNumber"]').val(),
          }
        }
      }
      cartInfo.newPayment = $.extend(cart.payment, POOBJ);
    } else {
      const ibanOBJ = {
        billingEngine: 'GSMB',
        metadata: {
          IBAN: $('[name="IBAN"]').val(),
          IBANAuthorization: $('[name="IBANAuthorization"]').is(':checked')
        }
      }
      cartInfo.newPayment = $.extend(cart.payment, ibanOBJ);
    }

    return cartInfo;
  }

  function resetCreditCardInfo(updatedCart) {
    var fn = ns + '[resetCreditCardInfo]'
    if (!creditCards.length
      && updatedCart.payment
      && updatedCart.payment.metadata
      && updatedCart.payment.metadata.sourceId) {
      let creditCard = updatedCart.payment.metadata.creditCard || updatedCart.payment.creditCard;
      console.info(fn, 'added creditCard', creditCard);
      if (creditCard) {
        creditCards = [{
          id: updatedCart.payment.metadata.sourceId,
          card: {
            holderName: creditCard.holderName,
            expYear: creditCard.expYear,
            expMonth: creditCard.expMonth,
            last4: creditCard.last4,
            brand: creditCard.brand
          },
          paymentMethodObject: updatedCart.payment,
        }]
        console.info(fn, 'creditCards', creditCards);
        $('[name="creditCardId"]').append($('<option>', {
          value: updatedCart.payment.metadata.sourceId,
          text: '**** **** ****' + creditCard.last4 + ' ' + creditCard.brand
        }).data('payment-method', updatedCart.payment));
        $('[name="creditCardId"]').val(updatedCart.payment.metadata.sourceId);
        $('.credit-card-input').hide();
        $('.credit-cards').removeClass('hidden');
      }
    }
  }

  function updateCartInfo(cb) {
    var fn = ns + '[updateCartInfo]'

    let cartInfo = prepareCartPayload();
    // console.info(fn, 'cartInfo:', cartInfo)
    $.ajax({
      headers: {
        'X-CSRF-Token': $('[name="_csrf"]').val(),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      url: '/clientapi/cart/',// form.attr('action'),
      dataType: 'json',
      data: JSON.stringify(cartInfo),
      method: 'POST',//form.attr('method'),
      success: function (response) {
        console.info(fn, 'response:', response)
        if (response && response.error) {
          cb(response.error);
          return;
        }
        resetCreditCardInfo(response.data)
        cb(null, response);
      },
      error: function (err) {
        console.error(fn, err)
        cb(err);
      }
    });
  }

  function placeOrder(cb) {
    var fn = ns + '[placeOrder]'
    $.ajax({
      headers: {
        'X-CSRF-Token': $('[name="_csrf"]').val(),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      url: '/clientapi/orders/',// form.attr('action'),
      dataType: 'json',
      // data: JSON.stringify(cartInfo),
      method: 'POST',//form.attr('method'),
      success: function (response) {
        console.info(fn, 'response:', response)
        if (response && response.error) {
          cb(response.error);
          return;
        }
        cb(null, response);
      },
      error: function (err) {
        console.error(fn, err)
        cb(err);
      }
    });
  }

  function processError(errorType, err, errType = 'error') {
    if (errorType == 'order') {
      $("#CheckoutSubmitBtn").hide();
      $(".clear-order-link").hide();
      AlertUser('danger', $("[name='CHECK_OUT_GENERAL_FATAL_ERROR']").val());
    }
    else {
      $("#CheckoutSubmitBtn").attr('disabled', false);

    }
    $("html, body").animate({ scrollTop: 0 })
    $('#ProcessModal').fadeOut(500);

  }

  function postCreditCardCreation() {
    var fn = ns + '[postCreditCardCreation]'
    $("#CheckoutSubmitBtn").attr('disabled', true);
    $('#ProcessModal').fadeIn(500);
    updateCartInfo(function (cartErr, cartRes) {
      console.info(fn, { cartErr, cartRes });
      if (cartErr) {
        processError('cart', cartErr);// || cartRes && cartRes.error);
        return;
      }

      if (cartRes && cartRes.warnings) {
        displayWarnings(cartRes)
        return;
      }

      placeOrder(function (orderErr, orderRes) {
        if (orderErr) {
          processError('order', orderErr);// || cartRes && cartRes.error);
          return;
        }

        if (orderRes && orderRes.warnings) {
          displayWarnings(orderRes);
        } else {
          SuccessResponse(orderRes);
        }

      })
    });
  }

  function postStripeValidate() {
    var fn = ns + '[postStripeValidate]'
    let warnings = [];
    isValidInput('stripeToken', warnings, ['', null], 'creditCard');
    console.error(fn, warnings);
    if (warnings.length) {
      displayWarnings(warnings);
      return false;
    }
    return true
  }

  function processCheckout(form) {
    var fn = ns + '[processCheckout]'

    ClearFormValidation();
    $('#errorPrompt').hide()
    // AlertUser('info', 'Placing Your order');



    validateInputs();
    var existingCards = creditCards.length > 0;
    var paymentType = $('[name="paymentType"]:checked').val()
    // console.log(fn, 'stripeSubmit', stripeSubmit, 'existingCards:', existingCards)
    if (!existingCards && paymentType == 'creditCard' && stripeSubmit) {
      stripeSubmit(document.getElementById('PlaceOrderForm'), function () {
        if (!postStripeValidate()) {
          $('#ProcessModal').fadeOut(500);
        }
        else {
          postCreditCardCreation();
        }
      });
    } else {
      postCreditCardCreation();
    }
  }




  function SetShippingFieldsValue(fields, checked) {

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var name = field.name;
      if (name.indexOf('shippingAddress.') > -1
        && name != 'shippingAddress.sameAsBilling' && name != 'shippingAddress.sameAsAccount') {
        // var tempName = name.replace('shipping', '')
        console.info('SetShippingFieldsValue', name, checked)
        if (checked) {
          $('[name="' + name + '"]').val('').parent().hide();
        } else if (checked == false) {
          $('[name="shippingAddress.country"]').val(currentRegion.name.text);
          $('[name="shippingAddress.countryISO"]').val(currentRegion.countryISO);
          $('[name="' + name + '"]').val('').parent().show();
        }
      }

      /*if(name.indexOf('billing') > -1){
        var tempName = name.replace('billing', '');
        $('[name="shipping' + tempName + '"]').val(empty ? '' : field.value);
      }*/
    }

    /*if(!empty){
      setStates($('[name="state"]'), $('[name="shippingCountry"]').val(), $('[name="billingStateProvince"]').val());
    }*/
  }

  function SetBillingFieldsValue(fields, checked) {

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var name = field.name;
      if (name.indexOf('billingAddress.') > -1
        && name != 'billingAddress.sameAsAccount' && name != 'billingAddress.email') {
        // var tempName = name.replace('shipping', '')
        console.info('SetBillingFieldsValue', name, checked)
        if (checked) {
          $('[name="' + name + '"]').val('').parent().hide();
        } else if (checked == false) {
          $('[name="billingAddress.country"]').val(currentRegion.name.text);
          $('[name="billingAddress.countryISO"]').val(currentRegion.countryISO);
          $('[name="' + name + '"]').val('').parent().show();
        } else {
          $('[name="billingAddress.country"]').val(currentRegion.name.text);
          $('[name="billingAddress.countryISO"]').val(currentRegion.countryISO);
        }
      }

      /*if(name.indexOf('billing') > -1){
        var tempName = name.replace('billing', '');
        $('[name="shipping' + tempName + '"]').val(empty ? '' : field.value);
      }*/
    }

    /*if(!empty){
      setStates($('[name="state"]'), $('[name="shippingCountry"]').val(), $('[name="billingStateProvince"]').val());
    }*/
  }

  function SetE911FieldsValue(fields, val) {
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var name = field.name;
      if (name.indexOf('e911Address.') > -1
        && name != 'e911Address.sameAs') {
        var tempName = name.replace('e911', '')
        if (val != 'other') {
          $('[name="' + name + '"]').val('').parent().hide();
        } else {
          $('[name="e911Address.country"]').val(currentRegion.name.text);
          $('[name="e911Address.countryISO"]').val(currentRegion.countryISO);
          $('[name="' + name + '"]').val('').parent().show();
        }
      }

      /*if(name.indexOf('billing') > -1){
        var tempName = name.replace('billing', '');
        $('[name="shipping' + tempName + '"]').val(empty ? '' : field.value);
      }*/
    }

    /*if(!empty){
      setStates($('[name="state"]'), $('[name="shippingCountry"]').val(), $('[name="billingStateProvince"]').val());
    }*/
  }
  // hide/show the correct payment fields
  function SetPaymentFieldValue(fields, val) {
    if (val != 'creditCard') {
      $(".credit-card-area").hide();
      $(".purchase-order-area").show();
    } else {
      $(".purchase-order-area").hide();
      $(".credit-card-area").show();
    }
  }

  function initE911Options(cart) {
    if (webApp.hasCartItemByTag(cart, 'did-main', 'no-config')) {
      //show e911 options
      $('.e911-address').show();
      e911Check();
      $("[name='billingCountry']").on("change", e911Check);
    }
    else {
      //hide e911
      $('.e911-address').hide();
    }
  }

  function initCheckout() {


    $('#PlaceOrderForm').on('submit', function (e) {
      e.preventDefault();
      // var oneTimeDiscountDiff = getOneTimeDiscountDiff()

      // if(oneTimeDiscountDiff > 0 && cartItem.product.price.frequencyCount > 1) {
      //   var html = $('#IPOfficeCheckoutConfirmationModal .extra-text').html();
      //   html = html.replace('{PLACEHOLDER}', '<b>' + currencySymbol + (oneTimeDiscountDiff/100).formatDollars(2) + '</b>')
      //   $('#IPOfficeCheckoutConfirmationModal .extra-text').html(html)
      //   $('#IPOfficeCheckoutConfirmationModal').show();
      //   return;
      // }


      processCheckout($('#PlaceOrderForm'));
      //return false;
    });

    $('#ConfirmationModalYesBtn').on('click', function (e) {
      e.preventDefault()
      $('#IPOfficeCheckoutConfirmationModal').hide();
      processCheckout($('#PlaceOrderForm'))
    })
    // store selected form values into browser storage

    $('[name="shippingAddress.sameAsBilling"]').on('change', function (e) {
      var checked = $(this).is(':checked');
      console.log('shippingAddress.sameAsBilling:', checked)
      localStorage.setItem('SameAsBilling', checked)
      SetShippingFieldsValue($('#PlaceOrderForm').serializeArray(), checked);
    });

    $('[name="shippingAddress.sameAsAccount"]').on('change', function (e) {
      var checked = $(this).is(':checked');
      console.log('shippingAddress.sameAsAccount:', checked)
      localStorage.setItem('ShippingSameAsAccount', checked)
      SetShippingFieldsValue($('#PlaceOrderForm').serializeArray(), checked);
    });

    $('[name="billingAddress.sameAsAccount"]').on('change', function (e) {
      var checked = $(this).is(':checked');
      console.log('billingAddress.sameAsAccount:', checked)
      localStorage.setItem('billingSameAsAccount', checked)
      SetBillingFieldsValue($('#PlaceOrderForm').serializeArray(), checked);
    });

    $('[name="e911Address.sameAs"]').on('change', function (e) {
      var val = $(this).val();
      localStorage.setItem('E911SameAsBilling', val)
      SetE911FieldsValue($('#PlaceOrderForm').serializeArray(), val);
    });

    $('[name="paymentType"]').on('change', function (e) {
      var val = $(this).val();
      localStorage.setItem('paymentType', val)
      SetPaymentFieldValue($('#PlaceOrderForm').serializeArray(), val);
    });

    $("[name='company.nid']").on('change', function (e) {
      e.preventDefault();
      var selectedCompanyId = $(this).val();
      var company = companies.filter(function (c) {
        return c.id === selectedCompanyId
      })[0]
      console.info('company.nid.onChange', company);
      if (!company) {
        return;
      }

      var domain = company.domains[0]
      var domainValue = ""
      var readOnly = false

      if (domain) {
        domainValue = domain.domain
        readOnly = true
      }
      $("[name='company.domain']").val(domainValue).attr('readonly', readOnly);
      $("[name='company.domain']").focus();
      $("[name='company.name']").val(company.name);

    });


    $("a.add-new-company").on('click', function (e) {
      e.preventDefault();
      $('#companyNameField').show();
      $('#companyIdField').hide();
      $("[name='company.nid']").val("");
      $("[name='company.name']").val("").focus();
      $("[name='company.domain']").val($("[name='contact.email']").val().split('@')[1]);
      $("[name='company.domain']").attr('readonly', false);
      $("[name='contact.companyType']").val("new");
    });

    $("a.choose-an-existing-company").on('click', function (e) {
      e.preventDefault();
      $('#companyNameField').hide();
      $('#companyIdField').show();
      $("[name='company.nid']").val("");
      $("[name='company.name']").val("");
      $("[name='company.domain']").val("");
      $("[name='contact.companyType']").val("existing");
    });

    $('[data-toggle="tooltip"]').tooltip({ trigger: 'focus' })
    formatStaticFields();
    if (SameAsBilling === true) {
      $("input[name='shippingAddress.sameAsBilling']").attr("checked", true);
      //SetShippingFieldsValue($('#PlaceOrderForm').serializeArray(), $("input[name='shippingAddress.sameAsBilling']").is(':checked'))
    }

    if (ShippingSameAsAccount) {
      $("input[name='shippingAddress.sameAsAccount']").attr("checked", true);
    }

    if (BillingSameAsAccount) {
      $("input[name='billingAddress.sameAsAccount']").attr("checked", true);
    }

    let isShippingChecked = ($("input[name='shippingAddress.sameAsBilling']").is(':checked') || $("input[name='shippingAddress.sameAsAccount']").is(':checked'));
    SetShippingFieldsValue($('#PlaceOrderForm').serializeArray(), isShippingChecked)
    //console.log('shippingAddress.sameAsBilling', $('[name="shippingAddress.sameAsBilling"]').is(':checked'), SameAsBilling)
    // console.log('E911SameAsBilling:', E911SameAsBilling);

    // Default Radio Button Value
    $("input[name='e911Address.sameAs'][value='" + E911SameAsBilling + "']").prop('checked', true);
    $("input[name='paymentType'][value='" + PaymentMethod + "']").prop('checked', true);

    // SetShippingFieldsValue($('#PlaceOrderForm').serializeArray(), $("input[name='shippingAddress.sameAsBilling']").is(':checked'))
    SetE911FieldsValue($('#PlaceOrderForm').serializeArray(), $('[name="e911Address.sameAs"]:checked').val())
    SetBillingFieldsValue($('#PlaceOrderForm').serializeArray(), $('[name="billingAddress.sameAsAccount"]:checked').val())
    SetPaymentFieldValue($('#PlaceOrderForm').serializeArray(), $('[name="paymentType"]:checked').val())

    /*$('.place-order-form .form-control').prev('label').each(function (lbl) {
      var html = $(this).html();
      var newHtml = "<span class='text-danger'>&#10035;</span>" + html;
      $(this).html(newHtml);
    });*/
    initE911Options(cart);




    $('[name="industry"]').on('change', function (e) {
      var value = $(this).val();
      if (value === "Healthcare") {
        $(this).parent().addClass('has-error');
        $(this).parent().find('span.error-msg').text(localizer.get('HEALTHCARE_DENY_MESSAGE')).show();
      } else {
        $(this).parent().removeClass('has-error')
        $(this).parent().find('span.error-msg').text('').hide();
      }
    });

    // console.info('cart.billingAddress.country:', cart.billingAddress.country);
    if (cart && cart.billingAddress && cart.billingAddress.country) {
      $('[name="billingAddress.country"]').val(cart.billingAddress.country);
      $('[name="billingAddress.countryISO"]').val(cart.billingAddress.countryISO);
      $('[name="billingAddress.state"]').val(cart.billingAddress.state);
      $('[name="billingAddress.stateISO"]').val(cart.billingAddress.stateISO);
    }

    //TODO: Ray
    //Currently we enforce all transactions to selected region, but 
    // if we decide to decouple any of them we need to change this logic
    $('[name="billingAddress.country"]').val(currentRegion.name.text);
    $('[name="billingAddress.countryISO"]').val(currentRegion.countryISO);

    $('[name="shippingAddress.country"]').val(currentRegion.name.text);
    $('[name="shippingAddress.countryISO"]').val(currentRegion.countryISO);

    $('[name="e911Address.country"]').val(currentRegion.name.text);
    $('[name="e911Address.countryISO"]').val(currentRegion.countryISO);


    initLegalDocsByCart(cart);
    // initZipFormat('shippingAddress');
    // initZipFormat('billingAddress');
    // initZipFormat('e911Address');
  }

  function initZipFormat(inputPrefix) {
    var pattern = '';
    switch (currentRegion.shortCode) {
      case 'US':
        pattern = '{{99999}}';
        break;
      case 'CA':
        pattern = '{{a9a}} {{9a9}}';
        break;
    }

    if (pattern) {
      $('[name="' + inputPrefix + '.zip"]').formatter({
        'pattern': pattern
      });
    }

  }

  $('document').ready(function () {
    console.log('cart-checkout document.ready begin');
    initCheckout();
  });





  return {
    displayWarnings: displayWarnings
  }

})();
