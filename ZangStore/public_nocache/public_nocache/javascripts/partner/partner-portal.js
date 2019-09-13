$(function () {

  $("#partnerLink").on("click", function (e) {
    e.preventDefault();
    document.getElementById('partnerLink').select()
    window.document.execCommand('copy');
  });


  $('[data-toggle="tooltip"]').tooltip()


  $('.collapse').collapse();

  $('.agent-trigger-link').on('click', function (e) {
    $(this).find('.agent-trigger').toggleClass('collapsed');
  });

  

  

});
