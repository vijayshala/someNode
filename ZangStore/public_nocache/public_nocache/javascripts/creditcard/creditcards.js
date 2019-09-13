$(function() {

  $("[name='creditCardSecurityCode']").formatter({
    'pattern': '{{999}}'
  });

  $("[name='creditCardNumber']").formatter({
    'pattern': '{{9999}} {{9999}} {{9999}} {{9999}}',
    //'persistent': true
  });

  $('.delete-credit-card').on('click', function (e) {
    e.preventDefault()
    var url = $(this).attr('href');
    $('.delete-credit-card').remove();
    window.location.href = url;
  })

  $('[data-toggle="tooltip"]').tooltip({trigger: 'focus'})


});
