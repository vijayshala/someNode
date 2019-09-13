$(function () {

  var ERROR_CODES = JSON.parse($("[name='ERROR_CODES']").val());
  var SameAsCompany = localStorage.getItem('SameAsCompany') ? (localStorage.getItem('SameAsCompany') === "true" ? true : false) : false;

  //var localizer = JSON.parse($('[name="LOCALIZER"]').val());

  function AlertUser(message) {
    $('#errorPrompt').find('span').text(message)
    $("#errorPrompt").slideDown();
  }

  function SuccessResponse(response){
    $("#SubmitBtn").hide();
    $("#LoadingBtn").html(localizer.get('REDIRECTING') + "...");
    localStorage.removeItem('SameAsCompany')
    window.location.href = response.redirect
  }

  function ErrorResponse(response) {
    $("#SubmitBtn").show();
    $("#LoadingBtn").hide();
    var errors = response.errors;
    for(var i=0;i<errors.length;i++){
      var error = errors[i]
      var field = $("[name='" + error.field + "']")
      if(field.is(":radio")){
        $("[data-parentof='" + error.field + "']").addClass('has-error').find('span.error-msg').text(error.message).show()
      } else {
        field.parent().addClass('has-error');
        field.parent().find('span.error-msg').text(error.message).show();
      }
    }
    var topPos = $("[name='" + errors[0].field + "']").offset().top
    $("html, body").animate({ scrollTop: (topPos-100) + "px" })
  }

  function SetOperationalFieldsValue(fields, checked){

    for(var i=0;i<fields.length;i++){
      var field = fields[i];
      var name = field.name;
      if(name.indexOf('operational') > -1){
        var tempName = name.replace('operational', '')
        if(checked){
          $('[name="operational' + tempName + '"]').val('').parent().hide();
        } else {
          $('[name="operational' + tempName + '"]').val('').parent().show();
        }
      }
    }
  }

  function formatStaticFields() {

    var config = {
      pattern: "+1({{999}}){{999}}-{{9999}}"
    }

    //$("[name='companyPhoneNumber']").formatter(config);
  }

  $('#copyCompanyAddress').on('change', function (e) {
    var checked = $(this).is(':checked');
    localStorage.setItem('SameAsCompany', checked)
    SetOperationalFieldsValue($('#PartnerApplicationForm').serializeArray(), checked);
  });

  $("[name='isAvayaPartner']").on("change", function (e) {
    e.preventDefault();
    if($(this).val() === "yes"){
      $("[name='avayaPartnerId']").val("").parent().show();
    } else {
      $("[name='avayaPartnerId']").val("").parent().hide();
    }
  })

  $("#PartnerApplicationForm").on("submit", function (e) {
    e.preventDefault();
    $("#ProcessModal").fadeIn(100);
    $("#errorPrompt").slideUp();
    $("#SubmitBtn").hide();
    $("#LoadingBtn").show();
    $.ajax({
      method: $(this).attr('method'),
      headers: {
        'X-CSRF-Token': $('[name="_csrf"]').val()
      },
      url: $(this).attr('action'),
      data:{
        fields: JSON.stringify($(this).serializeArray())
      },
      success: function (response) {
        console.log(response)
        $("#ProcessModal").fadeOut(100);
        if(response.errors){
          ErrorResponse(response)
        } else {
          SuccessResponse(response)
        }
      },
      error:function (error) {
        $("#ProcessModal").fadeOut(100);
        $("#LoadingBtn").hide();
        console.error(error);

        var responseMessage = $("[name='APPLICATION_GENERAL_FATAL_ERROR']").val()
        if(error.responseJSON){
          responseMessage = error.responseJSON.message
        }
        var message = ERROR_CODES[responseMessage] ? ERROR_CODES[responseMessage] : $("[name='APPLICATION_GENERAL_FATAL_ERROR']").val()
        AlertUser(message);
      }
    })
  });

  $(".multi-choise-checkbox").on("change", function (e) {
    e.preventDefault();
    var fieldName = $(this).data('field');
    var fieldValue = $("[name='" + fieldName + "']").val().split(",");
    var value = $(this).val();
    var idx = fieldValue.indexOf(value)
    if(idx > -1){
      fieldValue.splice(idx, 1)
    } else {
      fieldValue.push(value)
    }
    $("[name='" + fieldName + "']").val(fieldValue.join(","));
    $("[name='" + fieldName + "']").parent().removeClass('has-error').find('span.error-msg').html("").hide()
  });


  $("[name='isAvayaPartner']").on("change", function (e) {
    e.preventDefault();
    if($("[name='avayaPartnerId']").parent().hasClass('has-error')){
      $("[name='avayaPartnerId']").parent().removeClass('has-error')
    }

    $("[name='avayaPartnerId']").parent().find("span.error-msg").html("").hide();

    if($("[name='avayaPartnerId']").next('span.error-msg').is(':visible')){
      $("[name='avayaPartnerId']").next('span.error-msg').html('').hide();
    }
  });

  $(".yes-no-radio").on("change", function (e) {
    e.preventDefault();
    var fieldName = $(this).attr("name");
    $("[data-parentof='" + fieldName + "']").removeClass("has-error").find("span.error-msg").html("").hide();
  })


  $("[value='None']").on("change", function (e) {
    e.preventDefault();
    var isChecked = $(this).is(":checked");
    var fieldValue = $(this).val();
    var dataField = $(this).data('field');
    var dataFieldObjs = $("[data-field='" + dataField + "']")
    $("[name='" + dataField + "']").val(isChecked ? $(this).val() : "");
    $("[name='" + dataField + "Extra']").attr("disabled", isChecked);
    if(isChecked){
      $("[name='" + dataField + "Extra']").val("");
    }
    dataFieldObjs.each(function (i, field) {
      if($(field).val() !== fieldValue) {
        $(field).attr("checked", !isChecked);
        $(field).attr("disabled", isChecked);
      }
    });
  });

  $("[value='Other']").on("change", function (e) {
    e.preventDefault();
    var isChecked = $(this).is(":checked");
    var dataField = $(this).data('field');
    var dataFieldOther = $("[name='" + dataField + "Extra']");
    dataFieldOther.attr("disabled", !isChecked);
    if(isChecked){
      dataFieldOther.focus();
    } else {
      dataFieldOther.val("");
    }
  });


  SetOperationalFieldsValue($('#PartnerApplicationForm').serializeArray(), SameAsCompany);
  formatStaticFields()

  $("[name='avayaPartnerId']").parent().hide();


});
