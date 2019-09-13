$(function () {

  var patterns = {
    visa: {
      number: '{{9999}} {{9999}} {{9999}} {{9999}}',
      cvv: '{{999}}'
    },
    amex: {
      number: '{{9999}} {{999999}} {{99999}}',
      cvv: '{{9999}}'
    },
    mastercard: {
      number: '{{9999}} {{9999}} {{9999}} {{9999}}',
      cvv: '{{999}}'
    }
  }

  $('[name="creditCardBrand"]').on('change', function (e) {
    $('[name="creditCardNumber"]').val('');
    $('[name="creditCardSecurityCode"]').val('');
    var brand = $(this).val();
    $("[name='creditCardNumber']").formatter().resetPattern(patterns[brand].number);
    $("[name='creditCardSecurityCode']").formatter().resetPattern(patterns[brand].cvv);
  });

  $("[name='creditCardNumber']").formatter({
    'pattern': patterns['visa'].number
  });

  $("[name='creditCardSecurityCode']").formatter({
    'pattern': patterns['visa'].cvv
  });

  function setCCExpirationMonths(year){
    year = parseInt(year);
    var currentMonth = new Date().getMonth();
    var selected = parseInt($('[name="creditCardExpirationMonth"]').val());
    var currentYear = new Date().getFullYear();
    var monthIndex = year === currentYear ? currentMonth+1 : 1;
    var html = "";
    for(var i=monthIndex;i<=12;i++){
      var txt = i<10?'0'+i:i;
      html += "<option value='" + $('<div/>').text(i).html() + "' " + (selected === i ? "selected='selected'" : "")  + " >" + $('<div/>').text(txt).html() + "</option>";
    }
    $('[name="creditCardExpirationMonth"]').html(html);
  }

  $('[name="creditCardExpirationYear"]').on("change", function (e) {
    e.preventDefault();
    setCCExpirationMonths($(this).val())
  })

  setCCExpirationMonths($('[name="creditCardExpirationYear"]').val());

});
