$(function () {

    var minimumInputLength = 3;
    var partnerConnection = null
    if($("#partnerConnection").val()){
      partnerConnection = JSON.parse($("#partnerConnection").val());
    }

    var partnersList = [];//JSON.parse($("#partners").val());
    var partners = [];
    var PICTURE_URL_DOMAIN = $("#PICTURE_URL_DOMAIN").val();
    var NO_PICTURE_URL = $("#NO_PICTURE_URL").val();
    var bucket = $("#bucket").val();

    function resolvePictureUrl(picturefile){
      if (!picturefile || picturefile === "") {
         return NO_PICTURE_URL;
      }
      if (picturefile.indexOf('http://') > -1 || picturefile.indexOf('https://') > -1) {
         return picturefile;
      }
      return PICTURE_URL_DOMAIN + bucket + '/' + picturefile;
    }

    function matcher(params, data) {
      if ($.trim(params.term) === '') {
        return data;
      }
      if(data.text.toLowerCase().indexOf(params.term.toLowerCase()) > -1) {
        return data;
      }

      return null;
    }


    function partnerTemplate(partner){

      var emptyText = $(
        "<span class='empty-partner'>- No Agent -</span>"
      )

      if (!partner.id || partner.id === "-1") {
          return emptyText
      }
      return $(
        "<span class='partner'>" +
          "<div class='img'>" +
            "<img src='" + resolvePictureUrl(partner.logo) + "' class='img-responsive img-circle' onerror='this.src=\"" + NO_PICTURE_URL + "\"' />" +
          "</div>" +
          "<div class='info'>" +
            "<div class='company'>" + partner.text + "</div>" +
            "<div class='type'>" + partner.type + "</div>" +
          "</div>" +
        "</span>"
      )
    }

    function initPartnersList(){

      var noAgentItem = {
        logo: "",
        id: '-1',
        text: '- No Agent -',
        type: ""
      }

      if(partnerConnection){
        partnerConnection.partner.id = partnerConnection.partner._id
        partnerConnection.partner.text = partnerConnection.partner.fields.companyName
        var idx = partners.findIndex(function (item) {
          return item._id === partnerConnection.partner._id
        })
        if(idx < 0){
          partners.unshift(partnerConnection.partner)
        }
      } else if(partnersList.length === 1) {
        partnersList[0].id = partnersList[0]._id
        partnersList[0].text = partnersList[0].fields.companyName

        var idx = partners.findIndex(function (item) {
          return item._id === partnersList[0]._id
        })

        if(idx < 0) {
          partners.unshift(partnersList[0])
        }

      } else {
        partners.unshift(noAgentItem)
      }

      

      $("#partnersList").select2({
        data: partners,
        minimumInputLength: minimumInputLength,
        ajax: {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': $('[name="_csrf"]').val()
          },
          delay: 1000,
          url: '/clientapi/partners/search',
          data: function (params) {
            return {
              search: params.term,
              region: $.cookie('USER_REGION') || 'US'
            }
          },
          processResults: function (resp) {
              console.log(resp);
              return {
                results: resp.data
              }
          }
        },
        templateResult: partnerTemplate,
        templateSelection: partnerTemplate,
        //formatState: partnerTemplate,
        language: {
          inputTooShort: function (args) {
            return localizer.get('PLEASE_TYPE_AT_LEAST_PLACEHOLDER_CHARACTERS_TO_SEARCH_FOR_AN_AGENT').replace('{chars}', minimumInputLength)
          },
          noResults: function () {
            return localizer.get('NO_RESULTS_FOUND')
          },
          errorLoading: function () {
            return localizer.get('RESULTS_COULD_NOT_BE_LOADED')
          }
        }
      });

      if(partnerConnection){
        $("#partnersList").val(partnerConnection.partner._id).trigger("change");
        //$(".mask").show();
        //$(".select2-selection__arrow").hide();
      } else if(partnersList.length === 1) {
        $("#partnersList").val(partnersList[0]._id).trigger("change");
      }

      $(".clear-agent-btn").on("click", function (e) {
        e.preventDefault();
        $("#partnersList").val("-1").trigger("change");
        $("#partnersList").select2("close");
      })
    }




    initPartnersList()

});
