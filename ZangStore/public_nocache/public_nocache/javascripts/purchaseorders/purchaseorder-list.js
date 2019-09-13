$(function () {
  var csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  // Get country info based on country shortCode
  function getCountryInfo(code, cb) {
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
        console.info('response:', response);
        cb(response.data)
      },
      error: function (err) {
        console.error(err)
      }
    });
  }

  // create the new states dropdown
  function setStates(el, states) {
    var html = "<option value=''>- Select One -</option>";
    states.forEach(function (state, i) {
      html += "<option value='" + $('<div/>').text(state.name).html() + ">" + $('<div/>').text(state.name).html() + "</option>"
    });

    el.html(html);
  }

  $('[name="billingAddress.country"]').on('change', function (e) {
    e.preventDefault()
    getCountryInfo($(this).val().split('-')[1], (data) => {
      setStates($('[name="billingAddress.state"]'), data.states);
    })
  });

  function showSuccess(message) {
    if (message) {
      $('.successMSG h4').text(message);
    } else {
      $('.successMSG h4').text("Purchase Order Saved");
    }
    $('.successMSG').show();
    location.reload();
  }

  function createUpdatePurchaseOrder(fn, billingAccountID, requestData) {
    $('.successMSG').hide();
    $('.failMSG').hide();
    $('.loader').show()
    $('.loader').html('<div class="loader--spin"><img class="loading-tax" src="/public_nocache/images/loading-spinner-grey.gif" /></div>');
    $('#savepo').hide();
    // Create/Update the purchase order
    $.ajax({
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      url: `/clientapi/billingaccount/${billingAccountID}/po`,
      dataType: 'json',
      processData: false,
      data: JSON.stringify(requestData),
      method: 'POST',
      success: function (response) {
        // show message once the Creation was a success
        $(window).scrollTop(0);
        ClearFormValidation();
        showSuccess();
        if (response && response.error) {
          return;
        }
      },
      error: function (err) {
        displayWarnings(err.responseJSON);
        $('.loader').hide()
        $('#savepo').show();
        console.error(fn, err);
      }
    });
  }

  // dont show the hidden input in the html
  $('[name="purchase-order"]').hide();
  $('.successMSG').hide();
  $('.failMSG').hide();

  // when admin saves the purchase order of a user
  $('#savepo').on('click', function () {
    var poaccount = JSON.parse($('[name="purchase-order"]').val());

    // validate errors
    validateInputs(true);

    var requestData = {
      status: $('[name="po-status"]').val(),
      approvedLimit: $('[name="purchase-order-limit"]').val(),
      refNumber: $('[name="purchaseOrderRefNumber"]').val(),
      billingAddress: {
        address1: $('[name="billingAddress.address1"]').val(),
        city: $('[name="billingAddress.city"]').val(),
        state: $('[name="billingAddress.state"]').val(),
        country: $('[name="billingAddress.country"]').val().split('-')[0],
        countryISO: $('[name="billingAddress.country"]').val().split('-')[1],
        zip: $('[name="billingAddress.zip"]').val()
      },
      company: {
        name: $('[name="company.name"]').val(),
        isIncorporated: JSON.parse($('[name="company.isIncorporated"]:checked').val())
      },
      contact: {
        firstName: $('[name="contact.firstName"]').val(),
        lastName: $('[name="contact.lastName"]').val(),
        email: $('[name="contact.email"]').val(),
        phone: $('[name="contact.phone"]').val()
      }
    }

    Object.assign(poaccount.purchaseOrder, requestData);

    var fn = "[approvedPurchaseOrder]";
    if (poaccount.members[0].permission === 'ADMIN')
      createUpdatePurchaseOrder(fn, poaccount._id, poaccount.purchaseOrder);
  })

  // When user adds a new purchase order
  $('#addNewPurchaseOrder').on('submit', function (e) {
    e.preventDefault();

    // validate errors
    validateInputs(false);

    var requestData = {
      approvedLimit: 0,
      refNumber: $('[name="purchaseOrderRefNumber"]').val(),
      billingAddress: {
        address1: $('[name="billingAddress.address1"]').val(),
        city: $('[name="billingAddress.city"]').val(),
        state: $('[name="billingAddress.state"]').val(),
        country: $('[name="billingAddress.country"]').val(),
        zip: $('[name="billingAddress.zip"]').val()
      },
      company: {
        name: $('[name="company.name"]').val(),
        isIncorporated: JSON.parse($('[name="company.isIncorporated"]:checked').val())
      },
      contact: {
        firstName: $('[name="contact.firstName"]').val(),
        lastName: $('[name="contact.lastName"]').val(),
        email: $('[name="contact.email"]').val(),
        phone: $('[name="contact.phone"]').val()
      }
    }

    var billingAccountID = $('[name="billingAccount"]').val();

    var fn = "[addNewPurchaseOrder]";
    createUpdatePurchaseOrder(fn, billingAccountID, requestData);

  })

  // close modal
  $('#cancelDelete').on('click', function (e) {
    e.preventDefault();
    $('#deletedModal').css('display', 'none', 'important');
  })

  // open modal
  $('#delete').on('click', function (e) {
    e.preventDefault();
    $('#deletedModal').css('display', 'block', 'important');
  })

  // When user confirms delete
  $('#deletePurchaseOrder').on('click', function (e) {
    e.preventDefault();

    var billingAccountID = $('[name="billingAccount"]').val();

    var fn = "[deletePurchaseOrder]";

    // Create/Update the purchase order
    $.ajax({
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      url: `/clientapi/billingaccount/${billingAccountID}/po`,
      dataType: 'json',
      processData: false,
      method: 'DELETE',
      success: function (response) {
        $('#deletedModal').css('display', 'none', 'important');
        $(window).scrollTop(0);
        showSuccess("Purchase Order Successfully Deleted");
        console.info(fn, 'response:', response)
        if (response && response.error) {
          return;
        }
      },
      error: function (err) {
        console.error(fn, err);
      }
    });

  })

  function displayWarnings(response) {
    var fn = '[displayWarnings]';

    if (response.redirect) {
      window.location.href = response.redirect
      return;
    }
    let errMessages = [];
    let msg = '';
    let firstInputResource = '';

    let errors = response.warnings;
    if (response.errors) {
      errors = response.errors;
    } else if (response.error) {
      errors = [response.error];
    }

    for (var warning of errors) {
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
      AlertUser('danger', errMessages.join('<br/>'));
    }
  }

  function AlertUser(cls, message) {
    $(window).scrollTop(0);
    // handle limit error message
    if (message == 'Not all subscription payment success') {
      message = 'Warning: Order total exceeds purchase order limit';
    }
    $('.failMSG').show().find('h4').text(message);
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

  function validateInputs(isAdmin) {
    let warnings = [];

    // verify the limit blank field
    if (isAdmin) {
      isValidInput('purchase-order-limit', warnings);
    }

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

    // check to see if phone number is a number
    /*     var phoneNumberFormat = /^\d{10}$/;
        if (!($('[name="contact.phone"]').val().match(phoneNumberFormat))) {
          warnings.push({
            code: 'INVALID_PHONE_NUMBER',
            message: localizer.get('INVALID_PHONE_NUMBER'),
            reference: "contact.phone",
          })
        } */

    isValidInput('purchaseOrderRefNumber', warnings);

    isValidInput('billingAddress.address1', warnings);
    isValidInput('billingAddress.country', warnings);
    isValidInput('billingAddress.city', warnings);
    isValidInput('billingAddress.state', warnings);
    isValidInput('billingAddress.zip', warnings);

    isValidInput('company.isIncorporated', warnings);

    // var k = document.getElementByI
    if (isUndefined($('[name="company.isIncorporated"]:checked').val())) {
      warnings.push({
        code: 'THIS_FIELD_IS_REQUIRED',
        message: localizer.get('THIS_FIELD_IS_REQUIRED'),
        reference: 'company.isIncorporated',
      })
    }

    if (warnings.length) {
      displayWarnings({ warnings });
      throw (warnings);
    }
  }

  // Remove the error tags on success
  function ClearFormValidation() {
    $('[name="billingAddress.address1"]').parents('.form-group').removeClass('has-error');
    $('[name="billingAddress.city"]').parents('.form-group').removeClass('has-error');
    $('[name="billingAddress.state"]').parents('.form-group').removeClass('has-error');
    $('[name="billingAddress.zip"]').parents('.form-group').removeClass('has-error');
    // remove all error messages
    $('.error-msg').html('');
  }

  // check if the inputs contain any server errors
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

  function isUndefined(val) {
    return val == undefined
  }

});
