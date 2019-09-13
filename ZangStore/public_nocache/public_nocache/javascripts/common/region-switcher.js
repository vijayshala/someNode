var regSwitcher = (function () {
  const ns = '[region-switcher]'
  var activeRegions = JSON.parse($('[name="activeRegions"]').val());
  var csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
  var isChooseRegionPage = location.href.indexOf('/regions/choose') > -1;
  function formatState(country) {
    console.info('formatState', country);
    if (!country._id) {
      let data = $(country.element).attr('data');
      console.info('data', data)
      if (!data) {
        return country.text
      } else {
        country = JSON.parse(data);
      }
    }
    var countryName = country.name.resource ? localizer.get(country.name.resource) : country.name.text;
    var flagUrl = "/public_nocache/images/regions-flags/" + country.shortCode.toUpperCase() + ".svg";
    var image = country.shortCode ? '<img src="' + flagUrl + '" class="img-flag" width="32" onerror="this.style.display=\'none\'" />' : ''
    var $state = $(
      '<span class="country-select2-option"><div class="country-flag">' + image + '</div>' + countryName + '</span>'
    );
    return $state;
  };

  function initSwitcher() {
    $('#countries-switcher').select2({
      templateResult: formatState,
      templateSelection: formatState,
      data: activeRegions,
      ajax2: {
        url: '/clientapi/regions',
        delay: 250,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('x-csrf-token', csrf);
        },

        data: function (params) {
          var query = {
            search: params.term,
            type: 'public'
          }
          // Query parameters will be ?search=[term]&type=public
          return query;
        },
        processResults: function (resp) {
          // Tranforms the top-level key of the response object from 'items' to 'results'

          var results = (resp.data || []).map(function (item) {
            item.id = item._id;
            return item
          })

          console.info('resp', resp, 'results', results);
          return {
            results: results
          };
        }
      }
    });
  }


  // function getCookie(cname) {
  //   var name = cname + "=";
  //   var decodedCookie = decodeURIComponent(document.cookie);
  //   var ca = decodedCookie.split(';');
  //   for(var i = 0; i <ca.length; i++) {
  //       var c = ca[i];
  //       while (c.charAt(0) == ' ') {
  //           c = c.substring(1);
  //       }
  //       if (c.indexOf(name) == 0) {
  //           return c.substring(name.length, c.length);
  //       }
  //   }
  //   return "";
  // }

  function getCountryByCode(code) {
    var fn = ns + '[getCountryByCode]'
    $.ajax({
      headers: {
        Authorization: 'abcd',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': csrf
      },
      url: '/clientapi/regions/code/' + code, // form.attr('action'),
      dataType: 'json',
      method: 'GET',
      success: function (response) {
        console.info(fn, 'response:', response);
        if (response && response.data) {
          var data = response.data;
          data.id = data._id;
          // data.text = data.name;
          data.selected = true;
          $('#countries-switcher').select2({
            templateResult: formatState,
            templateSelection: formatState,
            data: [data]
          })
          // $('#countries-switcher').trigger({
          //   type: 'select2:select',
          //   params: {
          //     data: data
          //   }
          // });
          $('#countries-switcher').trigger({
            type: 'select2:select',
            params: {
              data: data
            }
          });
          $('.region-sw-continue').attr('href', '/' + data.shortCode.toLowerCase()); //+ '/home'
          //$('#countries-switcher').select2('val', data.id);//.trigger('change.select2');
          // console.info(fn, 'dddd', ddd);

        }
      },
      error: function (err) {
        console.error(fn, err)
      }
    });
  }
  function initLangSelect(divId, defaultLang, onChange) {
    var fn = ns + '[initLangSelect]'
    for (var i = 0; i < webApp.SYSTEM_AVAILABLE_LANGUEAGES.length; i++){
      var lang = webApp.SYSTEM_AVAILABLE_LANGUEAGES[i];
      $(divId).append($('<option>', {
        value: lang.code,
        text: lang.description
      }));
    }  
    $(divId).val(defaultLang);
    $(divId).on('change', function (evt) {
      onChange($(divId).val());
    });
  }
  function getViewerCurrentRegion() {
    var fn = ns + '[getViewerCurrentRegion]'
    var regionCode = $.cookie('VIEWER_ORIGIN') || $.cookie('USER_REGION')  || '';
    for (var i = 0; i < activeRegions.length; i++) {
      console.info(fn, 'activeRegions', activeRegions[i], 'regionCode', regionCode);
      if (activeRegions[i].shortCode.toUpperCase() === regionCode.toUpperCase()) {
        return activeRegions[i];
      }
    }
    return null;
  }

  function initLanguages() {
    var fn = ns + '[initLanguages]'
    var currentRegion = getViewerCurrentRegion()
    console.log(ns, 'VIEWER_LANGUAGE', $('[name="VIEWER_LANGUAGE"]').val(), 'currentRegion', currentRegion);
    
    initLangSelect('#langauge-switcher', (
      (currentRegion && currentRegion.defaultLanguage)
      || $('[name="VIEWER_LANGUAGE"]').val()
      || 'en-US'
    ), function (val) {
      // $('#langauge-switcher2').val(val);
    });
    initLangSelect('#langauge-switcher2', $('[name="VIEWER_LANGUAGE"]').val(), function (val) {
      webApp.setViewerLanguage($('#langauge-switcher2').val());
      // $('#langauge-switcher').val(val);
    });
  }

  function getListOfCountries(code) {
    var fn = ns + '[getListOfCountries]'

    showCountriesLoader();

    $.ajax({
      headers: {
        // Authorization: 'abcd',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': csrf
      },
      url: '/clientapi/regions', // + code,// form.attr('action'),
      dataType: 'json',
      method: 'GET',
      success: function (response) {
        console.info(fn, 'response:', response);
        if (response && response.data) {
          var data = response.data;
          var isRegionFound = false;
          for (i = 0; i < data.length; i++) {
            data[i].id = data[i]._id;
            if (data[i].shortCode == code) {
              data[i].selected = true;
              isRegionFound = true;
            }
          }
          if (!isRegionFound) {
            console.error(fn, 'this region is not supported');
          }
          $('#countries-switcher').select2({
            templateResult: formatState,
            templateSelection: formatState,
            data: data
          })

          $('#countries-switcher').trigger({
            type: 'select2:select',
            params: {
              data: data
            }
          });
          //$('.region-sw-continue').attr('href', '/' + data.shortCode.toLowerCase() + '/home');
          //$('#countries-switcher').select2('val', data.id);//.trigger('change.select2');
          // console.info(fn, 'dddd', ddd);
          hideCountriesLoader();
        }
      },
      error: function (err) {
        hideCountriesLoader();
        console.error(fn, err)
      }
    });
  }

  function loadUserRegion() {
    var fn = ns + '[loadUserRegion]';
    showLoader();
    $.ajax({
      headers: {
        Authorization: 'abcd',
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      url: 'https://onesnatesting.esna.com/api/1.0/user/location', // form.attr('action'),
      dataType: 'json',
      method: 'GET',
      success: function (response) {
        hideLoader();        
        console.info(fn, 'response:', response);
        $.cookie('VIEWER_ORIGIN', response.country, {
          path: '/'
        });
        showSwitcherIfNotSameCountry(response.country || '');
      },
      error: function (err) {
        hideLoader();
        console.error(fn, err)
      }
    });
  }

  function showSwitcherIfNotSameCountry(viewerOrigin, ignoreViewerOrigin) {
    var region = $.cookie('USER_REGION') || '';
    if ($.cookie('SUPPRESS_SWITCHER')) {
      return;
    }
    // initContinueLink(viewerOrigin);
    if (viewerOrigin.toUpperCase() != region.toUpperCase() || ignoreViewerOrigin) {      
      if (!activeRegions.length) {
        getListOfCountries(viewerOrigin);
      } else {
        initWithActiveRegions(viewerOrigin);
      }
      $('.region-switcher').addClass('show');
    }
    else {
      $('.region-switcher').removeClass('show');
    }
  }

  function initWithActiveRegions(code) {
    for (i = 0; i < activeRegions.length; i++) {
      activeRegions[i].id = activeRegions[i]._id;
      if (activeRegions[i].shortCode == code) {
        activeRegions[i].selected = true;
        isRegionFound = true;
      }
    }
    $('#countries-switcher').select2({
      templateResult: formatState,
      templateSelection: formatState,
      data: activeRegions
    })

    // $('#countries-switcher').trigger({
    //   type: 'select2:select',
    //   params: {
    //     data: activeRegions
    //   }
    // });
  }
  // function initMainMenuFlag(countryISO) {
  //   var flagUrl = "/public_nocache/images/flags/" + countryISO + ".svg";
  //   $('.main-menu-region-flag').attr('src', flagUrl);
  // }

  function init() {
    var region = $.cookie('USER_REGION');
    console.info('USER_REGION', region, isChooseRegionPage);
    if (isChooseRegionPage) {
      return;
    }
    var viewerOrigin = $.cookie('VIEWER_ORIGIN');
    if (!viewerOrigin) {
      loadUserRegion();
    } else {
      showSwitcherIfNotSameCountry(viewerOrigin);
    }


    $('.countries-switcher').on('change', function (evt) {
      if ($('.countries-switcher').select2('val') != null) {
        var data = $('.countries-switcher').select2('data')[0];
        $('#langauge-switcher').val(data.defaultLanguage);
        // initContinueLink(data.shortCode);
      }
    });

    $('.region-sw-continue').click(function () {
      $('#region-sw-continue').hide();
      $('.region-sw-load').css('display', 'flex', 'important');
      webApp.setViewerLanguage($('#langauge-switcher').val(), function (error, res) {
        if ($('.countries-switcher').select2('val') != null) {
          var data = $('.countries-switcher').select2('data')[0];
          console.log('data', data);
          $.cookie('USER_REGION', data.shortCode.toLowerCase(), {
            path: '/'
          });
          window.location.href = '/' + data.shortCode.toLowerCase();
        }
      });
    })

    $('.region-sw-close').click(function () {
      $.cookie('SUPPRESS_SWITCHER', true, {
        path: '/'
      });
      $('.region-switcher').removeClass('show');
    })

    $('.choose-your-region .region_link').click(function (e) {
      // console.log('begin....',  e.currentTarget)
      var data = JSON.parse($(e.currentTarget).attr('data'));
      console.log('data....', data)
      $.cookie('SUPPRESS_SWITCHER', '', { path: '/' });
      $.cookie('USER_REGION', data.shortCode.toLowerCase(), {
        path: '/'
      });
    })
    // $('.nav-flag-icon').click(function () {
    //   $.cookie('SUPPRESS_SWITCHER', '', { path: '/' });
    // })

    

  }


  function updateLanguage(lang) {
    // console.info('', 'SYSTEM_AVAILABLE_LANGUEAGES', webApp.SYSTEM_AVAILABLE_LANGUEAGES);
    webApp.setViewerLanguage(lang);
  }

  function showCountriesLoader() {
    // $('.page-loader-switcher').css('display', 'flex');
  }

  function hideCountriesLoader() {
    // $('.page-loader-switcher').css('display', 'none');
  }

  function showLoader() {
    $('.page-loader-switcher').css('display', 'flex');
  }

  function hideLoader() {
    $('.page-loader-switcher').css('display', 'none');
  }

  function initContinueLink(shortCode) {
    shortCode = shortCode || 'us';
    $('.region-sw-continue').attr('href', '/' + shortCode.toLowerCase()); //+ '/home'
  }

  var region = $.cookie('USER_REGION');
  var viewerOrigin = $.cookie('VIEWER_ORIGIN');
  
  viewerOrigin = viewerOrigin && viewerOrigin.toLowerCase()
  console.info('USER_REGION', region, 'viewerOrigin', viewerOrigin, isChooseRegionPage);
  if (!isChooseRegionPage) {
    if (region != viewerOrigin && !$.cookie('SUPPRESS_SWITCHER')) {
      console.info(ns, 'showing switcher');
      setTimeout(function () {
        $('.region-switcher').addClass('show');
      }, 10)
  
    }
  }
  if (!viewerOrigin) {
    showLoader();
  }


  $('document').ready(function () {
    initLanguages();
  })

  // setTimeout(function () {
  //   var num = webApp.formatCurrency(55.20, { code: 'EUR' });
  //   console.warn('num', num);
  // }, 1000)
  return {
    init: init
  }
})(jQuery);
