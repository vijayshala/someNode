$(function () {

  function Response(cls, show, text) {
    $('.response')
      .removeClass('alert-success')
      .removeClass('alert-warning')
      .removeClass('alert-danger')
      .removeClass('alert-info')
      .addClass(cls)
    $('.response')[show ? 'removeClass' : 'addClass']('hidden');
    $('.response').html('').text(text);
  }

  function onFormSubmit(e) {
    e.preventDefault();
    Response('alert-info', true, localizer.get('SENDING_INVITATION_EMAIL'))

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
        Response('alert-success', true, response.message)
        setTimeout(function () {
          try{
            $('#partnerInvitationModalAgent').modal('hide');
            $('#partnerInvitationModalCompany').modal('hide');
            clearForms();
          } catch(e) {
            console.log(e)
          }
        }, 1500)
      },
      error:function (error) {
        Response('alert-danger', true, error.responseJSON.message)
      }
    })
  }

  function clearForms(e) {
    if(e) {
      e.preventDefault();
    }
    $("#CompanyInvitationForm")[0].reset();
    $("#AgentInvitationForm")[0].reset();
    $('.response').addClass('hidden');
    $('.response').html('');
  }


  $("#CompanyInvitationForm").on("submit", onFormSubmit);
  $("#AgentInvitationForm").on("submit", onFormSubmit);


  $(".cancel-invitation-btn").on('click', clearForms);
  $('button.close').on('click', clearForms);

});
