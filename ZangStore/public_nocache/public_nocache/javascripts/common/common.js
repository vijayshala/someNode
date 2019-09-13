String.prototype.ucFirst = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

Number.prototype.formatMoney = function(c, d, t){
  var n = this,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt(n = (Math.round((Number(n) || 0) * 100) / 100).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;
     return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
   };


 Number.prototype.formatDollars = function (c) {
   return this.formatMoney(c, '.', ',')
 }


 String.prototype.formatUSPhone = function () {
   var phoneTest = new RegExp(/^((\+1)|1)? ?\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})( ?(ext\.? ?|x)(\d*))?$/);

     //this = this.trim();
     var results = phoneTest.exec(this);
     if (results !== null && results.length > 8) {

         return "+1(" + results[3] + ") " + results[4] + "-" + results[5] + (typeof results[8] !== "undefined" ? " x" + results[8] : "");

     }
     else {
          return this;
     }
 }



function ZsGlobalMask(text){
  if(text) {
    $('.zs-global-mask').show();
    $('.zs-global-mask h1').text(text);
  } else {
    $('.zs-global-mask').hide();
    $('.zs-global-mask h1').text('');
  }

}

var utag_data = null;
function update_utag_data(utag){
  utag_data =  utag;
}

function loadTealium(){
  var username = $('#usernameInput').val();
  if (username){
    var tag_data = {
      LeadID: username
    };
    update_utag_data(tag_data);
    (function(a,b,c,d){
      var env = $('#envInput').val();    
      a='//tags.tiqcdn.com/utag/avaya/main/qa/utag.js';
      if (env == 'production'){
        a = '//tags.tiqcdn.com/utag/avaya/main/prod/utag.js';
      }
      b=document;c='script';d=b.createElement(c);d.src=a;
      d.type='text/java'+c;d.async=true;
      a=b.getElementsByTagName(c)[0];a.parentNode.insertBefore(d,a)
    })();
  }
}
loadTealium();
window.localizer = {
  defaultLocale: JSON.parse($('[name="DEFAULT_LOCALE"]').val()),
  messages: JSON.parse($('[name="LOCALIZER"]').val()),
  get: function (key) {
    if(!this.messages[key]) {
      return this.defaultLocale[key] ? this.defaultLocale[key] : key
    } else {
      return this.messages[key]
    }
  }
};
$(function () {
  function ClearValidationMessage(e) {
    e.preventDefault();
    if ($(this).parent().hasClass('has-error')) {
      $(this).parent().removeClass('has-error')
    }

    $(this).parent().find("span.error-msg").html("").hide();

    if ($(this).next('span.error-msg').is(':visible')) {
      $(this).next('span.error-msg').html('').hide();
    }
  }
  

  $('[name="search"]').focus();

  $('.go-up-btn').on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, 500);
  })

  $(function () {
    $('.zs-main-table').stickyTableHeaders();
  });


  window.getAppVersion = function () {
    console.warn($('[name="APP_VERSION"]').val())
  }

  $('#ConfirmationModalNoBtn').on('click', function (e) {
    e.preventDefault();
    $('#ConfirmationModal').hide();
    $('#ZangOfficeCheckoutConfirmationModal').hide();
  });

  $('.form-control').on('keyup change', ClearValidationMessage);



  $('.tos-link').on('click', function (e) {
    e.preventDefault();
    $('#ProductTermsModaliFrame').attr('src', $(this).attr('href'))
    $('#ProductTermsModal').modal();
  });

  $('.marketing-link').on('click', function (e) {
    e.preventDefault();
    $('#ProductTermsModaliFrame').attr('src', $(this).attr('href'))
    $('#ProductTermsModal').modal()
    try {
      var ifr = $('#ProductTermsModaliFrame')[0];
      ifr.contentDocument.getElementsByTagName('header')[0].remove();
    } catch (e) {
      console.log('Could not remove the contentDocument header');
      console.warn(e);
    }
  })

  $("#ProductTermsModal .print-legal-btn").on("click", function (e) {
    e.preventDefault();
    var url = $('#ProductTermsModaliFrame').attr('src').replace('headless/', '')
    window.open(url, "_blank")
  })

  $("[name='tosAgree']").on("change", ClearValidationMessage);
  $("[name='agentProgramAgree']").on("change", ClearValidationMessage);


  $(".zs-progress-modal .zs-modal-close").on("click", function (e) {
    e.preventDefault();
    $(this).parent().parent().hide()
  })

  // console.log("%c --SALESFORCE-- ", "color:red;font-size:21px;");
  

});


regSwitcher.init();