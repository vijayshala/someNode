$(function () {

  var initialStatus = $("[name='partnerStatus']").val();

  $("#SaveStatusBtn").on("click", function (e) {
    e.preventDefault();
    var status = $("[name='partnerStatus']").val();
    if(status !== initialStatus){
      var url = $("[name='partnerStatus']").data('url').replace('{PARTNER_STATUS_TYPE}', status)
      window.location.href = url;
    }
  });


  $(".remove-partner-btn").on("click", function (e) {
    e.preventDefault();
    var url = $(this).attr("href");
    $("#ConfirmationModal .extra-text").html("Deleting this partner will delete all of the partner's connections to orders and customers.");
    $("#ConfirmationModal").show();

    $("#ConfirmationModalYesBtn").unbind("click");
    $("#ConfirmationModalYesBtn").on("click", function (e) {
      e.preventDefault();
      window.location.href = url;
    })
  })


  $(".delete-connection-btn").on("click", function (e) {
    e.preventDefault();
    var url = $(this).attr("href");
    $("#ConfirmationModal").show();

    $("#ConfirmationModalYesBtn").unbind("click");
    $("#ConfirmationModalYesBtn").on("click", function (e) {
      e.preventDefault();
      window.location.href = url;
    })
  });


});
