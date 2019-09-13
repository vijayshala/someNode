var a, c;
"undefined" == typeof Optanon && (Optanon = OneTrust = {});
(function () {
  function L() {
    var b = [],
      e;
    for (e = 0; e < q.length; e += 1) Ba(q[e], ":1") && ha(q[e].replace(":1", "")) && b.push(q[e].replace(":1", ""));
    e = "," + b.toString().toLowerCase() + ",";
    window.OnetrustActiveGroups = e;
    window.OptanonActiveGroups = e;
    "undefined" != typeof dataLayer ? dataLayer.constructor === Array && (dataLayer.push({
      OnetrustActiveGroups: e
    }), dataLayer.push({
      OptanonActiveGroups: e
    })) : (window.dataLayer = [{
      event: "OptanonLoaded",
      OnetrustActiveGroups: e
    }], window.dataLayer = [{
      event: "OptanonLoaded",
      OptanonActiveGroups: e
    }]);
    setTimeout(function () {
      var e = new CustomEvent("consent.onetrust", {
        detail: b
      });
      window.dispatchEvent(e)
    })
  }

  function Ca() {
    var b = M("https://optanon.blob.core.windows.net/skins/default_flat_bottom_two_button_black/v2/css/optanon.css"),
      e = document.createElement("link");
    e.type = "text/css";
    e.href = b;
    e.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(e);
    b = (b = (b = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec("#CC0000")) ? {
        r: parseInt(b[1], 16),
        g: parseInt(b[2], 16),
        b: parseInt(b[3], 16)
      } : null) ? 186 <
      .299 * b.r + .587 * b.g + .114 * b.b ? "#000000" : "#ffffff" : "";
    e = document.createElement("style");
    e.innerHTML = "#optanon ul#optanon-menu li { background-color:  !important }#optanon ul#optanon-menu li.menu-item-selected { background-color:  !important }#optanon #optanon-popup-wrapper .optanon-white-button-middle { background-color: #CC0000 !important }.optanon-alert-box-wrapper .optanon-alert-box-button-middle { background-color: #CC0000 !important; border-color: #CC0000 !important; }#optanon #optanon-popup-wrapper .optanon-white-button-middle a { color: " +
      b + " !important }.optanon-alert-box-wrapper .optanon-alert-box-button-middle a { color: " + b + " !important }#optanon #optanon-popup-bottom { background-color: #F2F2F2 !important }#optanon.modern #optanon-popup-top, #optanon.modern #optanon-popup-body-left-shading { background-color: #F2F2F2 !important }.optanon-alert-box-wrapper { background-color: !important }.optanon-alert-box-wrapper .optanon-alert-box-bg p { color: !important }";
    document.getElementsByTagName("head")[0].appendChild(e)
  }

  function Da() {
    var b =
      u("OptanonConsent", "landingPath");
    if (b && b !== location.href) {
      var b = "true" === u("OptanonConsent", "AwaitingReconsent"),
        e = t(),
        h = F("OptanonAlertBoxClosed"),
        e = e.LastReconsentDate;
      h && e && new Date(e) > new Date(h) && !b ? (G(location.href), B("OptanonConsent", "AwaitingReconsent", !0)) : (G("NotLandingPage"), B("OptanonConsent", "AwaitingReconsent", !1), Ea && Optanon.SetAlertBoxClosed(!0))
    } else G(location.href)
  }

  function G(b) {
    B("OptanonConsent", "landingPath", b)
  }

  function Fa() {
    t();
    // window.jQuery = f = jQuery.noConflict(!0);
    f.fn.on ||
      (f.fn.on = function (b, e, h) {
        return f(e).live(b, h)
      });
    f.fn.prop || (f.fn.prop = function (b, e) {
      return this.attr(b, e)
    });
    f(window).on("load", Optanon.LoadBanner);
    f(window).one("otloadbanner", function () {
      N();
      var b, e = t(),
        h, g, m;
      ia(e);
      f("body").append('\x3cdiv id\x3d"optanon" class\x3d"modern"\x3e\x3c/div\x3e');
      b = '\x3cdiv id\x3d"optanon-popup-bg"\x3e\x3c/div\x3e\x3cdiv id\x3d"optanon-popup-wrapper" role\x3d"dialog" aria-modal\x3d"true" tabindex\x3d"-1"\x3e\x3cdiv id\x3d"optanon-popup-top"\x3e';
      e.ShowPreferenceCenterCloseButton &&
        (b = b + '\x3ca href\x3d"#" onClick\x3d"Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Close Button\');" class\x3d"optanon-close-link optanon-close optanon-close-ui" title\x3d"Close Preference Centre"\x3e\x3cdiv id\x3d"optanon-close" style\x3d"background: url(' + M("https://optanon.blob.core.windows.net/skins/default_flat_bottom_two_button_black/v2/images/optanon-pop-up-close.png") + ');width:34px;height:34px;"\x3e\x3c/div\x3e\x3c/a\x3e');
      b = b + '\x3c/div\x3e\x3cdiv id\x3d"optanon-popup-body"\x3e\x3cdiv id\x3d"optanon-popup-body-left"\x3e\x3cdiv id\x3d"optanon-popup-body-left-shading"\x3e\x3c/div\x3e\x3cdiv id\x3d"optanon-branding-top-logo" style\x3d"background-image: url(' +
        M("https://optanon.blob.core.windows.net/logos/5068/5068:avayamarket.com/avaya-logo.png") + ') !important;"\x3e\x3c/div\x3e\x3cul id\x3d"optanon-menu"\x3e\x3c/ul\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e';
      f("#optanon").html(b);
      e.Language && e.Language.Culture && f("#optanon-popup-wrapper").attr("lang", e.Language.Culture);
      for (m = 0; m < e.Groups.length; m += 1)
        if (b = e.Groups[m], y(b) == C || A(b) && w(b)) {
          h = y(b) == C;
          g = -1 != f.inArray(v(b) + ":1", q);
          h = f('\x3cli class\x3d"menu-item-necessary ' + (h || g ? "menu-item-on" : "menu-item-off") +
            '" title\x3d"' + y(b) + '"\x3e\x3cp\x3e\x3ca href\x3d"#"\x3e' + y(b) + "\x3c/a\x3e\x3c/p\x3e\x3c/li\x3e");
          y(b) == C && h.removeClass("menu-item-necessary").addClass("menu-item-about");
          switch (b.OptanonGroupId) {
            case 2:
              h.removeClass("menu-item-necessary").addClass("menu-item-performance");
              break;
            case 3:
              h.removeClass("menu-item-necessary").addClass("menu-item-functional");
              break;
            case 4:
              h.removeClass("menu-item-necessary").addClass("menu-item-advertising");
              break;
            case 8:
              h.removeClass("menu-item-necessary").addClass("menu-item-social")
          }
          h.data("group",
            b);
          h.data("optanonGroupId", v(b));
          h.click(Ga);
          f("#optanon #optanon-menu").append(h)
        }
      b = f('\x3cli class\x3d"menu-item-moreinfo menu-item-off" title\x3d"' + e.AboutText + '"\x3e\x3cp\x3e\x3ca target\x3d"_blank" href\x3d"' + e.AboutLink + "\" onClick\x3d\"Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Preferences Cookie Policy');\"\x3e" + e.AboutText + "\x3c/a\x3e\x3c/p\x3e\x3c/li\x3e");
      f("#optanon #optanon-menu").append(b);
      f("#optanon #optanon-popup-body").append('\x3cdiv id\x3d"optanon-popup-body-right"\x3e\x3ch2 aria-label\x3d"true"\x3e' +
        e.MainText + '\x3c/h2\x3e\x3cdiv class\x3d"vendor-header-container"\x3e\x3ch3\x3e\x3c/h3\x3e\x3cdiv id\x3d"optanon-popup-more-info-bar"\x3e\x3cdiv class\x3d"optanon-status"\x3e' + Ha(e, "chkMain") + ('\x3cdiv class\x3d"optanon-status-always-active optanon-status-on"\x3e\x3cp\x3e' + e.AlwaysActiveText + "\x3c/p\x3e\x3c/div\x3e") + '\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv id\x3d"optanon-main-info-text"\x3e\x3c/div\x3e' + (e.IsIABEnabled && e.VendorLevelOptOut ? '\x3cdiv id\x3d"optanon-vendor-consent-text"\x3eView Vendor Consent\x3c/div\x3e' :
          "") + '\x3c/div\x3e\x3cdiv class\x3d"optanon-bottom-spacer"\x3e\x3c/div\x3e');
      f("#optanon #optanon-popup-wrapper").append('\x3cdiv id\x3d"optanon-popup-bottom"\x3e \x3ca href\x3d"https://onetrust.com/poweredbyonetrust" target\x3d"_blank"\x3e\x3cdiv id\x3d"optanon-popup-bottom-logo" style\x3d"background: url(' + M("https://optanon.blob.core.windows.net/skins/default_flat_bottom_two_button_black/v2/images/cookie-collective-top-bottom.png") + ');width:155px;height:35px;" title\x3d"powered by OneTrust"\x3e\x3c/div\x3e\x3c/a\x3e\x3cdiv class\x3d"optanon-button-wrapper optanon-save-settings-button optanon-close optanon-close-consent"\x3e\x3cdiv class\x3d"optanon-white-button-left"\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-white-button-middle"\x3e\x3ca href\x3d"#" onClick\x3d"Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Save Settings\');"\x3e' +
        e.AllowAllText + '\x3c/a\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-white-button-right"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-button-wrapper optanon-allow-all-button optanon-allow-all"\x3e\x3cdiv class\x3d"optanon-white-button-left"\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-white-button-middle"\x3e\x3ca href\x3d"#" onClick\x3d"Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Allow All\');"\x3e' + e.ConfirmText + '\x3c/a\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-white-button-right"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e');
      X();
      Ia();
      e = t();
      b = '\x3cdiv class\x3d"optanon-alert-box-wrapper  " style\x3d"display:none"\x3e\x3cdiv class\x3d"optanon-alert-box-bottom-top"\x3e';
      e.showBannerCloseButton && (b += '\x3cdiv class\x3d"optanon-alert-box-corner-close"\x3e\x3ca class\x3d"optanon-alert-box-close" href\x3d"#" title\x3d"Close Banner" onClick\x3d"Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Banner Close Button\');"\x3e\x3c/a\x3e\x3c/div\x3e');
      b += '\x3c/div\x3e\x3cdiv class\x3d"optanon-alert-box-bg"\x3e\x3cdiv class\x3d"optanon-alert-box-logo"\x3e \x3c/div\x3e\x3cdiv class\x3d"optanon-alert-box-body"\x3e';
      e.BannerTitle && (b = b + '\x3cp class\x3d"optanon-alert-box-title"\x3e' + e.BannerTitle + "\x3c/p\x3e");
      b = b + "\x3cp\x3e" + e.AlertNoticeText + '\x3c/p\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-clearfix"\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-alert-box-button-container"\x3e\x3cdiv class\x3d"optanon-alert-box-button optanon-button-close"\x3e\x3cdiv class\x3d"optanon-alert-box-button-middle"\x3e\x3ca class\x3d"optanon-alert-box-close" href\x3d"#"\x3e' + e.AlertCloseText + '\x3c/a\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-alert-box-button optanon-button-allow"\x3e\x3cdiv class\x3d"optanon-alert-box-button-middle"\x3e\x3ca class\x3d"optanon-allow-all" href\x3d"#" onClick\x3d"Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Banner Accept Cookies\');"\x3e' +
        e.AlertAllowCookiesText + '\x3c/a\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-alert-box-button optanon-button-more"\x3e\x3cdiv class\x3d"optanon-alert-box-button-middle"\x3e\x3ca class\x3d"optanon-toggle-display" href\x3d"#" onClick\x3d"Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Banner Open Preferences\');"\x3e' + e.AlertMoreInfoText + '\x3c/a\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"optanon-clearfix optanon-alert-box-bottom-padding"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e';
      f("body").append(b);
      Ja();
      if (0 < f(".optanon-show-settings").length && (f(".optanon-show-settings").attr("href", "#"), f(".optanon-show-settings").wrap('\x3cdiv class\x3d"optanon-show-settings-popup-wrapper"\x3e').wrap('\x3cdiv class\x3d"optanon-show-settings-button"\x3e').wrap('\x3cdiv class\x3d"optanon-show-settings-middle"\x3e'), f(".optanon-show-settings-middle").before('\x3cdiv class\x3d"optanon-show-settings-left"\x3e\x3c/div\x3e'), f(".optanon-show-settings-middle").after('\x3cdiv class\x3d"optanon-show-settings-right"\x3e\x3c/div\x3e'),
          f(".optanon-show-settings-button").addClass("optanon-toggle-display"), Ka(), e = t(), !("ontouchstart" in window || navigator.msMaxTouchPoints || u("OptanonConsent", "dnt") || u("OptanonConsent", "groups"))))
        for (b = 0; b < e.Groups.length; b += 1)
          if (m = e.Groups[b], w(m) && (m = "do not track" == z(m).toLowerCase() && P)) {
            e = f(".optanon-show-settings-button").first();
            ja(e);
            f("#optanon-show-settings-popup").fadeIn(800);
            ka(e);
            la(e);
            Q = !0;
            setTimeout(La, 4E3);
            B("OptanonConsent", "dnt", "true");
            break
          }
      0 < f("#optanon-cookie-policy").length &&
        Ma();
      R();
      u("OptanonConsent", "groups") || D("OptanonConsent")
    });
    ma && Optanon.LoadBanner()
  }

  function N() {
    f("script").filter(function () {
      return f(this).attr("type") && "text/plain" == f(this).attr("type").toLowerCase() && f(this).attr("class") && f(this).attr("class").toLowerCase().match(/optanon-category(-[0-9]+)+($|\s)/)
    }).each(function () {
      var b = f(this).attr("class").toLowerCase().split("optanon-category-")[1].split("-"),
        e = !0;
      if (b && 0 < b.length) {
        for (var h = 0; h < b.length; h++)
          if (!S(b[h], !1)) {
            e = !1;
            break
          }
        e && f(this).replaceWith(f(this).attr("type",
          "text/javascript")[0].outerHTML)
      }
    })
  }

  function Ha(b, e) {
    return '\x3cdiv class\x3d"optanon-status-editable"\x3e\x3cform\x3e\x3cfieldset\x3e\x3cp\x3e\x3cinput type\x3d"checkbox" value\x3d"check" id\x3d"' + e + '" checked class\x3d"optanon-status-checkbox" /\x3e\x3clabel for\x3d"' + e + '"\x3e' + b.ActiveText + "\x3c/label\x3e\x3c/p\x3e\x3c/fieldset\x3e\x3c/form\x3e\x3c/div\x3e"
  }

  function Ga() {
    var b = t(),
      e = f(this).data("group"),
      h = Y(e);
    ia(b);
    f("#optanon #optanon-menu li").removeClass("menu-item-selected");
    f(this).addClass("menu-item-selected");
    f("#optanon h3").text(y(e));
    f("#optanon #optanon-main-info-text").html(T(e));
    if (e && !b.HideToolbarCookieList) {
      var g = t(),
        m = f('\x3cdiv class\x3d"optanon-cookie-list"\x3e\x3c/div\x3e'),
        n, p = Y(e),
        x, q;
      (e.Cookies && 0 < e.Cookies.length || p && 0 < p.length) && m.append('\x3cdiv class\x3d"optanon-cookies-used"\x3e' + g.CookiesUsedText + "\x3c/div\x3e");
      if (e.Cookies && 0 < e.Cookies.length) {
        q = f('\x3cp class\x3d"optanon-group-cookies-list"\x3e\x3c/p\x3e');
        for (n = 0; n < e.Cookies.length; n += 1) x = e.Cookies[n], q.append((x ? x.Name : "") + (n <
          e.Cookies.length - 1 ? ", " : ""));
        m.append(q)
      }
      if (p && 0 < p.length)
        for (n = 0; n < p.length; n += 1) {
          x = f('\x3cp class\x3d"optanon-subgroup-cookies-list"\x3e\x3c/p\x3e');
          var u = na(p[n]);
          q = T(p[n]);
          x.append('\x3cspan class\x3d"optanon-subgroup-header"\x3e' + u + (q ? ":" : "") + " \x3c/span\x3e");
          if ("always active" != z(p[n].Parent).toLowerCase()) {
            var w = g,
              u = p[n],
              A = "chk" + v(u),
              w = f('\x3cfieldset class\x3d"optanon-subgroup-fieldset"\x3e\x3cp\x3e\x3cinput type\x3d"checkbox" value\x3d"check" id\x3d"' + A + '" checked\x3d"" class\x3d"optanon-subgroup-checkbox optanon-status-checkbox"\x3e\x3clabel for\x3d"' +
                A + '"\x3e' + w.ActiveText + "\x3c/label\x3e\x3c/p\x3e\x3c/fieldset\x3e");
            w.find("input").data("group", u);
            w.find("input").data("optanonGroupId", v(u));
            x.append(w)
          }
          u = f('\x3cdiv class\x3d"optanon-subgroup-cookies"\x3e\x3c/div\x3e');
          x.append(u);
          q && x.append('\x3cdiv class\x3d"optanon-subgroup-description"\x3e' + q + "\x3c/div\x3e");
          m.append(x)
        }
      f("#optanon #optanon-main-info-text").append(m)
    }
    oa(e, b);
    if (h && 0 < h.length)
      for (g = 0; g < h.length; g += 1) oa(h[g], b);
    y(e) == C ? f("#optanon #optanon-popup-more-info-bar").hide() : f("#optanon #optanon-popup-more-info-bar").show();
    return !1
  }

  function oa(b, e) {
    if ("always active" == z(b).toLowerCase() || "always active" == z(b.Parent).toLowerCase()) f("#optanon .optanon-status-always-active").show(), f("#optanon .optanon-status-editable").hide();
    else {
      f("#optanon .optanon-status-editable").show();
      f("#optanon .optanon-status-always-active").hide();
      var h = -1 != f.inArray(v(b) + ":1", q),
        g = f(A(b) ? "#chkMain" : "#optanon #chk" + v(b));
      h ? (g.prop("checked", !0), g.parent().addClass("optanon-status-on"), g.next("label").text(e.ActiveText)) : (g.prop("checked", !1), g.parent().removeClass("optanon-status-on"), e.InactiveText && g.next("label").text(e.InactiveText))
    }
  }

  function Ia() {
    var b = t();
    f(document).on("click", ".optanon-close-consent", function () {
      Optanon.Close();
      pa(!0, !0);
      return !1
    });
    f(document).on("click", ".optanon-close-ui", function () {
      H();
      return !1
    });
    f(document).on("click", ".optanon-toggle-display", function () {
      Optanon.ToggleInfoDisplay();
      return !1
    });
    f(document).on("click", ".optanon-allow-all", function () {
      Optanon.AllowAll();
      pa(!0, !0);
      return !1
    });
    f(document).on("keydown",
      "#optanon",
      function (b) {
        27 == b.keyCode && H()
      });
    f("#optanon").on("change", ".optanon-status-checkbox", function () {
      var e = f(this).data("group") || f("#optanon #optanon-menu li.menu-item-selected").data("group");
      f(this).is(":checked") ? (qa(b, e, this), A(e) && Na(b)) : (ra(b, e, this), A(e) && Oa(b));
      X()
    })
  }

  function Na(b) {
    f(".optanon-status-checkbox").each(function () {
      if (!f(this).is(":checked")) {
        f(this).prop("checked", !0);
        var e = f(this).data("group");
        qa(b, e, this)
      }
    })
  }

  function Oa(b) {
    f(".optanon-status-checkbox").each(function () {
      if (f(this).is(":checked")) {
        f(this).prop("checked", !1);
        var e = f(this).data("group");
        ra(b, e, this)
      }
    })
  }

  function v(b) {
    return 0 == b.OptanonGroupId ? b.OptanonGroupId + "_" + b.GroupId : b.OptanonGroupId
  }

  function qa(b, e, h) {
    var g = y(e);
    Optanon.TriggerGoogleAnalyticsEvent("OneTrust Cookie Consent", "Preferences Toggle On", g);
    f("#optanon #optanon-menu li.menu-item-selected").removeClass("menu-item-off");
    f("#optanon #optanon-menu li.menu-item-selected").addClass("menu-item-on");
    f(h).parent().addClass("optanon-status-on");
    f("#optanon-show-settings-popup ul li").each(function () {
      f(h).text() ==
        f("#optanon #optanon-menu li.menu-item-selected ").text() && f(h).find(".icon").removeClass("menu-item-off").addClass("menu-item-on")
    });
    g = U(q, v(e) + ":0"); - 1 != g && (q[g] = v(e) + ":1");
    f(h).next("label").text(b.ActiveText)
  }

  function ra(b, e, h) {
    var g = y(e);
    Optanon.TriggerGoogleAnalyticsEvent("OneTrust Cookie Consent", "Preferences Toggle Off", g);
    f("#optanon #optanon-menu li.menu-item-selected ").removeClass("menu-item-on");
    f("#optanon #optanon-menu li.menu-item-selected").addClass("menu-item-off");
    f(h).parent().removeClass("optanon-status-on");
    f("#optanon-show-settings-popup ul li").each(function () {
      f(h).text() == f("#optanon #optanon-menu li.menu-item-selected ").text() && f(h).find(".icon").removeClass("menu-item-on").addClass("menu-item-off")
    });
    g = U(q, v(e) + ":1"); - 1 != g && (q[g] = v(e) + ":0");
    b.InactiveText && f(h).next("label").text(b.InactiveText)
  }

  function ja(b) {
    var e = t(),
      h, g, m;
    b.parent(".optanon-show-settings-popup-wrapper").append('\x3cdiv id\x3d"optanon-show-settings-popup"\x3e\x3cdiv id\x3d"optanon-show-settings-popup-inner"\x3e\x3cdiv class\x3d"top-arrow"\x3e\x3c/div\x3e\x3cul\x3e\x3c/ul\x3e\x3cdiv class\x3d"menu-bottom-even"\x3e\x3c/div\x3e\x3cdiv class\x3d"bottom-arrow-even"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e');
    for (m = 0; m < e.Groups.length; m += 1) {
      b = e.Groups[m];
      if (A(b) && w(b)) switch (h = -1 != f.inArray(v(b) + ":1", q), g = !F("OptanonConsent") && "do not track" == z(b).toLowerCase() && P, h = f('\x3cli\x3e\x3cspan class\x3d"icon necessary-icon ' + (h ? "menu-item-on" : "menu-item-off") + '"\x3e\x3c/span\x3e' + y(b) + (g ? '\x3cbr\x3e\x3cspan class\x3d"optanon-dnt"\x3eOff by Do Not Track\x3c/span\x3e' : "") + '\x3cdiv class\x3d"menu-item-border"\x3e\x3c/div\x3e\x3c/li\x3e'), b.OptanonGroupId) {
        case 2:
          h.find(".icon").removeClass("necessary-icon").addClass("performance-icon");
          break;
        case 3:
          h.find(".icon").removeClass("necessary-icon").addClass("functional-icon");
          break;
        case 4:
          h.find(".icon").removeClass("necessary-icon").addClass("advertising-icon");
          break;
        case 8:
          h.find(".icon").removeClass("necessary-icon").addClass("social-icon")
      }
      f("#optanon-show-settings-popup ul").append(h)
    }
    f("#optanon-show-settings-popup ul").children(":first").addClass("first");
    f("#optanon-show-settings-popup ul").children(":last").addClass("last");
    f("#optanon-show-settings-popup ul").children(":odd").addClass("even");
    f("#optanon-show-settings-popup ul").children(":even").addClass("odd");
    f("#optanon-show-settings-popup ul").children(":last").hasClass("odd") && (f("#optanon-show-settings-popup .bottom-arrow-even").removeClass("bottom-arrow-even").addClass("bottom-arrow-odd"), f("#optanon-show-settings-popup .menu-bottom-even").removeClass("menu-bottom-even").addClass("menu-bottom-odd"));
    f("#optanon-show-settings-popup ul li.last div").remove(".menu-item-border")
  }

  function Z() {
    f("#optanon-show-settings-popup").remove()
  }

  function La() {
    sa || f("#optanon-show-settings-popup").fadeOut(800, function () {
      Z()
    });
    Q = !1
  }

  function Ka() {
    f(".optanon-show-settings-button").click(function () {
      Optanon.TriggerGoogleAnalyticsEvent("OneTrust Cookie Consent", "Privacy Settings Click")
    });
    "ontouchstart" in window || navigator.msMaxTouchPoints || f(".optanon-show-settings-button").hover(function () {
      Optanon.TriggerGoogleAnalyticsEvent("OneTrust Cookie Consent", "Privacy Settings Hover");
      sa = !0;
      Q || (f("#optanon-show-settings-popup").stop(), Z(), ja(f(this)),
        f("#optanon-show-settings-popup").fadeIn(400), ka(f(this)), la(f(this)))
    }, function () {
      f("#optanon-show-settings-popup").fadeOut(400, function () {
        Q = !1;
        Z()
      })
    })
  }

  function Ja() {
    if (!Optanon.IsAlertBoxClosedAndValid()) {
      var b = t();
      f(".optanon-alert-box-wrapper").show().animate({
        bottom: "0px"
      }, 1E3);
      b.ForceConsent && (Pa(b.AlertNoticeText) || f("#optanon-popup-bg").css({
        "z-index": "7000"
      }).show());
      f(".optanon-alert-box-close").click(function () {
        f(".optanon-alert-box-wrapper").fadeOut(200);
        f("#optanon-popup-bg").hide();
        1 == b.CloseShouldAcceptAllCookies && Optanon.AllowAll();
        Optanon.SetAlertBoxClosed(!0);
        return !1
      })
    }
  }

  function Ma() {
    var b, e, h, g, m, n, p = t(),
      x, q;
    for (h = 0; h < p.Groups.length; h += 1)
      if (b = p.Groups[h], A(b) && w(b)) {
        x = f('\x3cdiv class\x3d"optanon-cookie-policy-group"\x3e\x3c/div\x3e');
        x.append('\x3cp class\x3d"optanon-cookie-policy-group-name"\x3e' + y(b) + "\x3c/p\x3e");
        x.append('\x3cp class\x3d"optanon-cookie-policy-group-description"\x3e' + T(b) + "\x3c/p\x3e");
        if (0 < b.Cookies.length)
          for (x.append('\x3cp class\x3d"optanon-cookie-policy-cookies-used"\x3e' +
              p.CookiesUsedText + "\x3c/p\x3e"), x.append('\x3cul class\x3d"optanon-cookie-policy-group-cookies-list"\x3e\x3c/ul\x3e'), g = 0; g < b.Cookies.length; g += 1) e = (e = b.Cookies[g]) ? e.Name : "", x.find(".optanon-cookie-policy-group-cookies-list").append("\x3cli\x3e" + e + "\x3c/li\x3e");
        b = Y(b);
        if (0 < b.length) {
          p.CookiesText || (p.CookiesText = "Cookies");
          p.CategoriesText || (p.CategoriesText = "Categories");
          p.LifespanText || (p.LifespanText = "Lifespan");
          p.LifespanTypeText || (p.LifespanTypeText = "Session");
          p.LifespanDurationText || (p.LifespanDurationText =
            "days");
          g = f('\x3cdiv class\x3d"optanon-cookie-policy-subgroup-table"\x3e\x3c/div\x3e');
          g.append('\x3cdiv class\x3d"optanon-cookie-policy-subgroup-table-header clearfix"\x3e\x3c/div\x3e');
          e = "";
          p.IsLifespanEnabled && (e = "\x26nbsp;(" + p.LifespanText + ")");
          g.find(".optanon-cookie-policy-subgroup-table-header").append('\x3cdiv class\x3d"optanon-cookie-policy-right"\x3e\x3cp class\x3d"optanon-cookie-policy-subgroup-table-column-header"\x3e' + p.CookiesText + e + "\x3c/p\x3e\x3c/div\x3e");
          g.find(".optanon-cookie-policy-subgroup-table-header").append('\x3cdiv class\x3d"optanon-cookie-policy-left"\x3e\x3cp class\x3d"optanon-cookie-policy-subgroup-table-column-header"\x3e' +
            p.CategoriesText + "\x3c/p\x3e\x3c/div\x3e");
          for (e = 0; e < b.length; e += 1) {
            q = f('\x3cdiv class\x3d"optanon-cookie-policy-subgroup"\x3e\x3c/div\x3e');
            q.append('\x3cdiv class\x3d"optanon-cookie-policy-left"\x3e\x3c/div\x3e');
            m = na(b[e]);
            q.find(".optanon-cookie-policy-left").append('\x3cp class\x3d"optanon-cookie-policy-subgroup-name"\x3e' + m + "\x3c/p\x3e");
            q.find(".optanon-cookie-policy-left").append('\x3cp class\x3d"optanon-cookie-policy-subgroup-description"\x3e' + T(b[e]) + "\x3c/p\x3e");
            q.append('\x3cdiv class\x3d"optanon-cookie-policy-right"\x3e\x3c/div\x3e');
            q.find(".optanon-cookie-policy-right").append('\x3cul class\x3d"optanon-cookie-policy-subgroup-cookies-list"\x3e\x3c/ul\x3e');
            if (p.IsLifespanEnabled)
              for (m = 0; m < b[e].Cookies.length; m += 1) {
                n = b[e].Cookies[m];
                var u = "",
                  u = n.IsSession ? p.LifespanTypeText : 0 === n.Length ? "\x3c 1 " + p.LifespanDurationText : n.Length + " " + p.LifespanDurationText;
                q.find(".optanon-cookie-policy-subgroup-cookies-list").append("\x3cli\x3e" + n.Name + "\x26nbsp;(" + u + ")\x3c/li\x3e")
              } else
                for (m = 0; m < b[e].Cookies.length; m += 1) n = b[e].Cookies[m], q.find(".optanon-cookie-policy-subgroup-cookies-list").append("\x3cli\x3e" +
                  n.Name + "\x3c/li\x3e");
            g.append(q)
          }
          x.append(g)
        }
        f("#optanon-cookie-policy").append(x);
        ta()
      }
    f(window).resize(function () {
      ta()
    })
  }

  function T(b) {
    return b && b.GroupLanguagePropertiesSets && b.GroupLanguagePropertiesSets[0] && b.GroupLanguagePropertiesSets[0].GroupDescription && b.GroupLanguagePropertiesSets[0].GroupDescription.Text ? b.GroupLanguagePropertiesSets[0].GroupDescription.Text.replace(/\r\n/g, "\x3cbr\x3e") : ""
  }

  function y(b) {
    return b && b.GroupLanguagePropertiesSets && b.GroupLanguagePropertiesSets[0] && b.GroupLanguagePropertiesSets[0].GroupName ?
      b.GroupLanguagePropertiesSets[0].GroupName.Text : ""
  }

  function z(b) {
    var e = t();
    return b && b.GroupLanguagePropertiesSets && b.GroupLanguagePropertiesSets[0] && b.GroupLanguagePropertiesSets[0].DefaultStatus ? P && e.IsDntEnabled && b.GroupLanguagePropertiesSets[0].IsDntEnabled ? "do not track" : b.GroupLanguagePropertiesSets[0].DefaultStatus.Text : ""
  }

  function na(b) {
    return b ? y(b) : ""
  }

  function ta() {
    f("#optanon-cookie-policy .optanon-cookie-policy-subgroup").each(function () {
      f(this).find(".optanon-cookie-policy-left").height("auto");
      f(this).find(".optanon-cookie-policy-right").height("auto");
      f(this).find(".optanon-cookie-policy-left").height() >= f(this).find(".optanon-cookie-policy-right").height() ? f(this).find(".optanon-cookie-policy-right").height(f(this).find(".optanon-cookie-policy-left").height()) : f(this).find(".optanon-cookie-policy-left").height(f(this).find(".optanon-cookie-policy-right").height())
    })
  }

  function Qa() {
    f("#optanon #optanon-menu li").removeClass("menu-item-selected");
    f("#optanon #optanon-menu li").each(function () {
      f(this).text() ==
        C && f(this).click()
    });
    X();
    var b = f("#optanon-popup-wrapper"),
      e = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    b.css("margin-top", "10px");
    720 > e ? b.css("top", "10px") : b.outerHeight() > h ? b.css("top", Math.max(0, (h - b.outerHeight()) / 2 + f(window).scrollTop()) + "px") : b.css("top", Math.max(0, (h - b.outerHeight()) / 2) + "px");
    f("#optanon #optanon-popup-bg, #optanon #optanon-popup-wrapper").hide().fadeIn(400);
    b.focus()
  }

  function H(b) {
    f("#optanon #optanon-popup-bg, #optanon #optanon-popup-wrapper").fadeOut(400, b)
  }

  function ua(b) {
    if (z(b)) {
      var e = z(b).toLowerCase();
      b.Parent && (e = z(b.Parent).toLowerCase());
      return "always active" == e || "active" == e || "inactive landingpage" == e || "do not track" == e && !P
    }
    return !0
  }

  function va() {
    var b, e = t(),
      h;
    if (u("OptanonConsent", "groups")) {
      u("OptanonConsent", "groups") && !aa && (aa = !0);
      b = !1;
      var e = I(u("OptanonConsent", "groups")),
        g = I(u("OptanonConsent", "groups").replace(/:0/g, "").replace(/:1/g,
          ""));
      h = t();
      var f, n, p;
      if (u("OptanonConsent", "groups")) {
        for (n = 0; n < h.Groups.length; n += 1) f = h.Groups[n], w(f) && (p = U(g, v(f)), -1 == p && (b = !0, ua(f) ? e.push(v(f) + ":1") : e.push(v(f) + ":0")));
        for (n = e.length - 1; 0 <= n; --n) {
          p = !1;
          for (g = 0; g < h.Groups.length; g += 1)
            if (f = h.Groups[g], w(f) && v(f) == e[n].replace(/:0/g, "").replace(/:1/g, "")) {
              p = !0;
              break
            }
          p || (b = !0, e.splice(n, 1))
        }
        b && D("OptanonConsent", e)
      }
      q = I(u("OptanonConsent", "groups"))
    } else {
      q = [];
      for (h = 0; h < e.Groups.length; h += 1) b = e.Groups[h], w(b) && (ua(b) ? q.push(v(b) + ":1") : q.push(v(b) +
        ":0"));
      aa = !0
    }
  }

  function D(b, e) {
    e ? B(b, "groups", e.toString().toLowerCase()) : B(b, "groups", q.toString().toLowerCase())
  }

  function B(b, e, f) {
    var g = {},
      h = F(b),
      n, p;
    t();
    if (h)
      for (n = h.split("\x26"), h = 0; h < n.length; h += 1) p = n[h].split("\x3d"), g[decodeURIComponent(p[0])] = decodeURIComponent(p[1]).replace(/\+/g, " ");
    g[e] = f;
    g.datestamp = (new Date).toString();
    g.version = "3.6.23";
    e = "";
    for (var q in g) g.hasOwnProperty(q) && ("" != e && (e += "\x26"), e += q + "\x3d" + encodeURIComponent(g[q]).replace(/%20/g, "+"));
    ba(b, e, 365)
  }

  function u(b, e) {
    var f =
      F(b),
      g, m, n;
    if (f) {
      g = {};
      m = f.split("\x26");
      for (f = 0; f < m.length; f += 1) n = m[f].split("\x3d"), g[decodeURIComponent(n[0])] = decodeURIComponent(n[1]).replace(/\+/g, " ");
      return e && g[e] ? g[e] : e && !g[e] ? "" : g
    }
    return ""
  }

  function ba(b, e, f) {
    var g;
    f ? (g = new Date, g.setTime(g.getTime() + 864E5 * f), f = "; expires\x3d" + g.toGMTString()) : f = "";
    g = ["avayamarket.com"];
    1 >= g.length && (g[1] = "");
    document.cookie = b + "\x3d" + e + f + "; path\x3d/" + g[1] + "; domain\x3d." + g[0]
  }

  function F(b) {
    b += "\x3d";
    var e = document.cookie.split(";"),
      f, g;
    for (f = 0; f < e.length; f +=
      1) {
      for (g = e[f];
        " " == g.charAt(0);) g = g.substring(1, g.length);
      if (0 == g.indexOf(b)) return g.substring(b.length, g.length)
    }
    return null
  }

  function S(b, e) {
    var f = null != b && "undefined" != typeof b,
      g, m;
    if (!e) {
      va();
      g = E(q, b + ":1");
      a: {
        m = t();
        var n;
        for (n = 0; n < m.Groups.length; n += 1)
          if (m.Groups[n].OptanonGroupId == b) {
            m = !0;
            break a
          }
        m = !1
      }
      m = !m;
      return f && (g && ha(b) || m) ? !0 : !1
    }
    return !0
  }

  function ha(b) {
    var e = t(),
      f, g;
    for (g = 0; g < e.Groups.length; g += 1)
      if (e.Groups[g].OptanonGroupId == b) {
        f = e.Groups[g];
        break
      }
    return "inactive landingpage" != z(f).toLowerCase() ?
      !0 : (b = u("OptanonConsent", "landingPath")) && b !== location.href ? !0 : !1
  }

  function I(b) {
    return b ? b.toLowerCase().split(",") : []
  }

  function R() {
    var b;
    b = t();
    b.CustomJs && (new Function(b.CustomJs))();
    if ("function" == typeof OptanonWrapper && "undefined" != OptanonWrapper) {
      OptanonWrapper();
      for (b = 0; b < J.length; b += 1) E(da, J[b]) || da.push(J[b]);
      J = [];
      for (b = 0; b < K.length; b += 1) E(ea, K[b]) || ea.push(K[b]);
      K = []
    }
  }

  function ia(b) {
    b.Groups.unshift({
      GroupLanguagePropertiesSets: [{
        GroupName: {
          Text: C
        },
        GroupDescription: {
          Text: b.MainInfoText
        }
      }]
    })
  }

  function wa(b) {
    if (b = document.getElementById(b))
      for (; b.hasChildNodes();) b.removeChild(b.lastChild)
  }

  function V(b) {
    if (b = document.getElementById(b)) b.style.display = "block"
  }

  function xa(b) {
    (b = document.getElementById(b)) && b.parentNode.removeChild(b)
  }

  function E(b, e) {
    var f;
    for (f = 0; f < b.length; f += 1)
      if (b[f].toString().toLowerCase() == e.toString().toLowerCase()) return !0;
    return !1
  }

  function U(b, e) {
    var f;
    for (f = 0; f < b.length; f += 1)
      if (b[f] == e) return f;
    return -1
  }

  function Ba(b, e) {
    return -1 != b.indexOf(e, b.length - e.length)
  }

  function X() {
    var b = 0,
      e, h = t(),
      g;
    for (g = 0; g < h.Groups.length; g += 1)
      if (e = h.Groups[g], w(e) && E(q, v(e) + ":0") && (b += 1, 1 <= b)) return f("#optanon .optanon-allow-all-button").show(), !0;
    f("#optanon .optanon-allow-all-button").hide();
    return !1
  }

  function pa(b, e) {
    f(".optanon-alert-box-wrapper").fadeOut(400);
    b && (ya || !ya && !Optanon.IsAlertBoxClosedAndValid()) && Optanon.SetAlertBoxClosed(e)
  }

  function ka(b) {
    f("#optanon-show-settings-popup").removeClass("optanon-show-settings-popup-top-button");
    f("#optanon-show-settings-popup ul").removeClass("top-button");
    f("#optanon-show-settings-popup .top-arrow, #optanon-show-settings-popup .bottom-arrow-even, #optanon-show-settings-popup .bottom-arrow-odd").hide();
    f("#optanon-show-settings-popup").css("top", "-" + f("#optanon-show-settings-popup-inner").height() + "px");
    var e = f("#optanon-show-settings-popup"),
      h = f(window).scrollTop(),
      e = e.offset().top;
    h >= e - 50 ? (f("#optanon-show-settings-popup").addClass("optanon-show-settings-popup-top-button"), f("#optanon-show-settings-popup ul").addClass("top-button"), f("#optanon-show-settings-popup").css("top",
      b.find(".optanon-show-settings-left").height() + f("#optanon-show-settings-popup .top-arrow").height() - 3 + "px"), f("#optanon-show-settings-popup .top-arrow").css("top", "-" + (f("#optanon-show-settings-popup .top-arrow").height() - 2) + "px"), f("#optanon-show-settings-popup .top-arrow").show()) : f("#optanon-show-settings-popup .bottom-arrow-even, #optanon-show-settings-popup .bottom-arrow-odd").show()
  }

  function la(b) {
    var e = f("#optanon-show-settings-popup-inner");
    b = b.find(".optanon-show-settings-left").width() +
      b.find(".optanon-show-settings-middle").width() + b.find(".optanon-show-settings-right").width();
    var h = f("#optanon-show-settings-popup ul").width() - 3,
      g = f("#optanon-show-settings-popup .top-arrow").width(),
      m, n, p, q;
    e.css("margin-left", "-" + ((h - b) / 2 + b) + "px");
    f("#optanon-show-settings-popup .top-arrow, #optanon-show-settings-popup .bottom-arrow-even, #optanon-show-settings-popup .bottom-arrow-odd").css("margin-left", (h - g) / 2 + "px");
    e.css("left", "0px");
    m = f(window).scrollLeft();
    n = e.offset().left;
    p = m + f(window).width();
    q = n + e.width();
    b < h ? m >= n ? (e.css("margin-left", "-" + b + "px"), f("#optanon-show-settings-popup .top-arrow, #optanon-show-settings-popup .bottom-arrow-even, #optanon-show-settings-popup .bottom-arrow-odd").css("margin-left", (b - g) / 2 + "px")) : p <= q && (e.css("margin-left", "-" + h + "px"), f("#optanon-show-settings-popup .top-arrow, #optanon-show-settings-popup .bottom-arrow-even, #optanon-show-settings-popup .bottom-arrow-odd").css("margin-left", h - (b + g) / 2 + "px")) : p <= q ? e.css("margin-left", "-" + b + "px") : m >= n && e.css("margin-left",
      "-" + h + "px")
  }

  function w(b) {
    var e, f = t(),
      g = !1,
      m, n, p = f.IsIABEnabled ? !0 : null != b.Cookies && 0 < b.Cookies.length;
    if (A(b)) {
      m = (b.Vendors && 0 < b.Vendors.length || b.Purposes && 0 < b.Purposes.length) && f.IsIABEnabled;
      for (n = 0; n < f.Groups.length; n += 1) {
        e = f.Groups[n];
        var q = f.IsIABEnabled ? !0 : null != e.Cookies && 0 < e.Cookies.length;
        if (null != e.Parent && y(b) && y(e.Parent) == y(b) && e.ShowInPopup && q) {
          g = !0;
          break
        }
      }
      return b.ShowInPopup && (p || g || m)
    }
    return b.ShowInPopup && p
  }

  function A(b) {
    return b && null == b.Parent
  }

  function Y(b) {
    var e, f = t(),
      g = [],
      m;
    for (m = 0; m < f.Groups.length; m += 1) {
      e = f.Groups[m];
      var n = f.IsIABEnabled ? !0 : null != e.Cookies && 0 < e.Cookies.length;
      null != e.Parent && y(e.Parent) == y(b) && e.ShowInPopup && n && g.push(e)
    }
    return g
  }

  function t() {
    fa || (fa = {
      cctId: "f7d62e11-d7ab-4d82-8ec6-b6924f7baa33",
      euOnly: !1,
      MainText: "Cookie Preference Centre",
      MainInfoText: "AvayaMarket's Website may request cookies to be set on your device. We use cookies to let us know when you visit our Website, how you interact with us, to enrich your user experience and to customize your relationship with Zang, including providing you with more relevant advertising. Please click on the different category headings to find out more information. You can also change your cookie preferences at any time. Please note that blocking some types of cookies may impact your experience on our Website and the services we are able to offer.",
      AboutText: "Cookie Statement",
      AboutCookiesText: "How Avaya Uses Cookies",
      ConfirmText: "Allow All",
      AllowAllText: "Save Settings",
      CookiesUsedText: "Cookies used",
      ShowAlertNotice: !0,
      AboutLink: "https://www2.avayamarket.com/legal/cookie-statement",
      HideToolbarCookieList: !1,
      ActiveText: "Active",
      AlwaysActiveText: "Always Active",
      AlertNoticeText: 'We use cookies to deliver the best browsing experience, personalize content, serve targeted advertisements and analyse site traffic. You can find out more or switch cookies off if you prefer by clicking "Change Settings". If you continue to use this site without changing settings or clicking "Accept Cookies", you consent to our use of cookies. ',
      AlertCloseText: "Close",
      AlertMoreInfoText: "Cookie Settings",
      AlertAllowCookiesText: "Accept Cookies",
      CloseShouldAcceptAllCookies: !1,
      LastReconsentDate: 1534255711783,
      BannerTitle: null,
      ForceConsent: !1,
      InactiveText: "Inactive",
      CookiesText: "Cookies",
      CategoriesText: "Sub-group",
      HasScriptArchive: !0,
      IsLifespanEnabled: !0,
      LifespanText: "Lifespan",
      IsIABEnabled: !1,
      VendorLevelOptOut: !0,
      Groups: [{
          ShowInPopup: !0,
          Order: 0,
          OptanonGroupId: 1,
          Parent: null,
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Always Active"
            },
            GroupDescription: {
              Text: "These cookies are strictly necessary for the Website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you, which amount to a request for services, such as setting your privacy preferences, logging in, filling in forms, accessing secure areas, etc. These cookies do not gather your personal information that could be used for marketing or remembering where you have been on the internet. You may block or delete these cookies by changing your browser settings (as described under the heading \u201cHow Can You Control Cookies?\u201d in the Cookie Statement), but then the Website will not function properly."
            },
            GroupName: {
              Text: "Strictly Necessary (Essential) Cookies"
            },
            IsDntEnabled: !1
          }],
          Cookies: [],
          Purposes: [],
          GroupId: 146881
        }, {
          ShowInPopup: !0,
          Order: 1,
          OptanonGroupId: 2,
          Parent: null,
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Inactive LandingPage"
            },
            GroupDescription: {
              Text: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Website. They help us to know which pages are the most and least popular and see how visitors move around the Website, whether they receive any error messages, etc. This information is mostly used to improve how a Website works. For clarity purposes web analytics are included into this cookie category. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, we will not know when visitors have accessed our Website and will not be able to monitor its performance."
            },
            GroupName: {
              Text: "Performance and Analytics Cookies"
            },
            IsDntEnabled: !1
          }],
          Cookies: [],
          Purposes: [],
          GroupId: 146877
        }, {
          ShowInPopup: !0,
          Order: 2,
          OptanonGroupId: 3,
          Parent: null,
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Inactive LandingPage"
            },
            GroupDescription: {
              Text: "These cookies allow the Website to remember choices you make (e.g., your user name, language or country you are in, etc.) and provide enhanced, more personal features and functionality. Such cookies can also be used to remember changes you have made to text size, fonts and other parts of Website you customize. They may also be used to provide services you have asked for (e.g., watching a video or commenting on a blog, etc.) in order to enhance your experience. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, then some or all of these services on our Website may not function properly."
            },
            GroupName: {
              Text: "Functionality and Customization Cookies"
            },
            IsDntEnabled: !1
          }],
          Cookies: [],
          Purposes: [],
          GroupId: 146878
        }, {
          ShowInPopup: !0,
          Order: 3,
          OptanonGroupId: 4,
          Parent: null,
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Inactive LandingPage"
            },
            GroupDescription: {
              Text: "These cookies are used to make advertising messages more relevant to you and your interests. They also perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests. These cookies remember that you have visited the Website and this information may be shared with other companies (e.g., advertisers, ad networks, etc.). In addition, targeting or advertising cookies may be lined to the Website functionality provided by the other companies. For further information please see the section of the Cookie Statement entitled \u201cTargeted Online Advertising\u201d. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, you will experience less targeted advertising."
            },
            GroupName: {
              Text: "Advertising (Targeting) Cookies"
            },
            IsDntEnabled: !1
          }],
          Cookies: [],
          Purposes: [],
          GroupId: 146879
        }, {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 1,
            OptanonGroupId: 2,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Inactive LandingPage"
              },
              GroupDescription: {
                Text: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Website. They help us to know which pages are the most and least popular and see how visitors move around the Website, whether they receive any error messages, etc. This information is mostly used to improve how a Website works. For clarity purposes web analytics are included into this cookie category. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, we will not know when visitors have accessed our Website and will not be able to monitor its performance."
              },
              GroupName: {
                Text: "Performance and Analytics Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146877
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: "These cookies are used for analytics and reporting (e.g., numbers of visitors, sessions, pages visited, etc.). They are also used to drive improvements of the Website."
            },
            GroupName: {
              Text: "Webtrends"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
            Name: "WT_FPC",
            Host: ".avayamarket.com",
            IsSession: !1,
            Length: 730
          }],
          Purposes: [],
          GroupId: 146884
        },
        {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 2,
            OptanonGroupId: 3,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Inactive LandingPage"
              },
              GroupDescription: {
                Text: "These cookies allow the Website to remember choices you make (e.g., your user name, language or country you are in, etc.) and provide enhanced, more personal features and functionality. Such cookies can also be used to remember changes you have made to text size, fonts and other parts of Website you customize. They may also be used to provide services you have asked for (e.g., watching a video or commenting on a blog, etc.) in order to enhance your experience. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, then some or all of these services on our Website may not function properly."
              },
              GroupName: {
                Text: "Functionality and Customization Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146878
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: "This cookie is used to determine country location, used for content personalisation."
            },
            GroupName: {
              Text: "Website regionalisation"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
            Name: "SUPPRESS_SWITCHER",
            Host: "avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "USER_REGION",
            Host: "avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "VIEWER_ORIGIN",
            Host: "avayamarket.com",
            IsSession: !0,
            Length: 0
          }],
          Purposes: [],
          GroupId: 150051
        }, {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 1,
            OptanonGroupId: 2,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Inactive LandingPage"
              },
              GroupDescription: {
                Text: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Website. They help us to know which pages are the most and least popular and see how visitors move around the Website, whether they receive any error messages, etc. This information is mostly used to improve how a Website works. For clarity purposes web analytics are included into this cookie category. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, we will not know when visitors have accessed our Website and will not be able to monitor its performance."
              },
              GroupName: {
                Text: "Performance and Analytics Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146877
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: "This cookie is used by the tag management platform related to web analytics."
            },
            GroupName: {
              Text: "Tealium"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
            Name: "wm_cpcode",
            Host: ".avayamarket.com",
            IsSession: !1,
            Length: 29744
          }, {
            Name: "utag_main",
            Host: ".avayamarket.com",
            IsSession: !1,
            Length: 29744
          }, {
            Name: "_gat_tealium_0",
            Host: ".avayamarket.com",
            IsSession: !1,
            Length: 1
          }],
          Purposes: [],
          GroupId: 146885
        }, {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 3,
            OptanonGroupId: 4,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Inactive LandingPage"
              },
              GroupDescription: {
                Text: "These cookies are used to make advertising messages more relevant to you and your interests. They also perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests. These cookies remember that you have visited the Website and this information may be shared with other companies (e.g., advertisers, ad networks, etc.). In addition, targeting or advertising cookies may be lined to the Website functionality provided by the other companies. For further information please see the section of the Cookie Statement entitled \u201cTargeted Online Advertising\u201d. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, you will experience less targeted advertising."
              },
              GroupName: {
                Text: "Advertising (Targeting) Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146879
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: ""
            },
            GroupName: {
              Text: "Adkernel"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
            Name: "ADK_EX_11",
            Host: "www.avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "ADKUID",
            Host: "www.avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "ADK_EX_15",
            Host: "www.avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "SSPR_26",
            Host: "avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "SSPZ",
            Host: "avayamarket.com",
            IsSession: !0,
            Length: 0
          }],
          Purposes: [],
          GroupId: 150050
        }, {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 0,
            OptanonGroupId: 1,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Always Active"
              },
              GroupDescription: {
                Text: "These cookies are strictly necessary for the Website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you, which amount to a request for services, such as setting your privacy preferences, logging in, filling in forms, accessing secure areas, etc. These cookies do not gather your personal information that could be used for marketing or remembering where you have been on the internet. You may block or delete these cookies by changing your browser settings (as described under the heading \u201cHow Can You Control Cookies?\u201d in the Cookie Statement), but then the Website will not function properly."
              },
              GroupName: {
                Text: "Strictly Necessary (Essential) Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146881
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: "These cookies are used for cookie compliance purposes to maintain the cookie preference settings of a visitor. They do not store any unique identifier of such visitor."
            },
            GroupName: {
              Text: "OneTrust"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
            Name: "ARRAffinity",
            Host: ".geolocation.onetrust.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "OptanonConsent",
            Host: "avayamarket.com",
            IsSession: !1,
            Length: 365
          }, {
            Name: "OptanonAlertBoxClosed",
            Host: "avayamarket.com",
            IsSession: !1,
            Length: 365
          }, {
            Name: "_cfduid",
            Host: ".onetrust.com",
            IsSession: !0,
            Length: 0
          }],
          Purposes: [],
          GroupId: 146882
        }, {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 2,
            OptanonGroupId: 3,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Inactive LandingPage"
              },
              GroupDescription: {
                Text: "These cookies allow the Website to remember choices you make (e.g., your user name, language or country you are in, etc.) and provide enhanced, more personal features and functionality. Such cookies can also be used to remember changes you have made to text size, fonts and other parts of Website you customize. They may also be used to provide services you have asked for (e.g., watching a video or commenting on a blog, etc.) in order to enhance your experience. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, then some or all of these services on our Website may not function properly."
              },
              GroupName: {
                Text: "Functionality and Customization Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146878
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: "This cookie is used for credit card validation purposes."
            },
            GroupName: {
              Text: "Stripe"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
            Name: "__stripe_mid",
            Host: "avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "__stripe_sid",
            Host: ".avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "__stripe_orig_props",
            Host: ".stripe.com",
            IsSession: !1,
            Length: 324
          }],
          Purposes: [],
          GroupId: 150053
        }, {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 0,
            OptanonGroupId: 1,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Always Active"
              },
              GroupDescription: {
                Text: "These cookies are strictly necessary for the Website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you, which amount to a request for services, such as setting your privacy preferences, logging in, filling in forms, accessing secure areas, etc. These cookies do not gather your personal information that could be used for marketing or remembering where you have been on the internet. You may block or delete these cookies by changing your browser settings (as described under the heading \u201cHow Can You Control Cookies?\u201d in the Cookie Statement), but then the Website will not function properly."
              },
              GroupName: {
                Text: "Strictly Necessary (Essential) Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146881
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: "These platform session cookies are used for maintaining an anonymous visitor session by the server."
            },
            GroupName: {
              Text: "General session"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
            Name: "connect.sid",
            Host: "www.avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "uid",
            Host: "nat.avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "AUTH_TOKEN_SIG",
            Host: "avayamarket.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "_AUTH_TOKEN",
            Host: "avayamarket.com",
            IsSession: !1,
            Length: 20
          }],
          Purposes: [],
          GroupId: 146883
        }, {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 1,
            OptanonGroupId: 2,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Inactive LandingPage"
              },
              GroupDescription: {
                Text: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Website. They help us to know which pages are the most and least popular and see how visitors move around the Website, whether they receive any error messages, etc. This information is mostly used to improve how a Website works. For clarity purposes web analytics are included into this cookie category. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, we will not know when visitors have accessed our Website and will not be able to monitor its performance."
              },
              GroupName: {
                Text: "Performance and Analytics Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146877
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: "These cookies are used for analytics and reporting (e.g., numbers of visitors, sessions, pages visited, etc.) on the Website."
            },
            GroupName: {
              Text: "Google Analytics"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
              Name: "1P_JAR",
              Host: "www.avayamarket.com",
              IsSession: !0,
              Length: 0
            }, {
              Name: "_ga",
              Host: ".avayamarket.com",
              IsSession: !1,
              Length: 729
            },
            {
              Name: "_gid",
              Host: ".avayamarket.com",
              IsSession: !1,
              Length: 1
            }
          ],
          Purposes: [],
          GroupId: 150052
        }, {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 3,
            OptanonGroupId: 4,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Inactive LandingPage"
              },
              GroupDescription: {
                Text: "These cookies are used to make advertising messages more relevant to you and your interests. They also perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests. These cookies remember that you have visited the Website and this information may be shared with other companies (e.g., advertisers, ad networks, etc.). In addition, targeting or advertising cookies may be lined to the Website functionality provided by the other companies. For further information please see the section of the Cookie Statement entitled \u201cTargeted Online Advertising\u201d. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, you will experience less targeted advertising."
              },
              GroupName: {
                Text: "Advertising (Targeting) Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146879
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: ""
            },
            GroupName: {
              Text: "Doubleclick"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
            Name: "IDE",
            Host: ".doubleclick.net",
            IsSession: !1,
            Length: 685
          }, {
            Name: "DSID",
            Host: ".doubleclick.net",
            IsSession: !1,
            Length: 13
          }],
          Purposes: [],
          GroupId: 149223
        }, {
          ShowInPopup: !0,
          Order: 100,
          OptanonGroupId: 0,
          Parent: {
            ShowInPopup: !0,
            Order: 3,
            OptanonGroupId: 4,
            Parent: null,
            GroupLanguagePropertiesSets: [{
              DefaultStatus: {
                Text: "Inactive LandingPage"
              },
              GroupDescription: {
                Text: "These cookies are used to make advertising messages more relevant to you and your interests. They also perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests. These cookies remember that you have visited the Website and this information may be shared with other companies (e.g., advertisers, ad networks, etc.). In addition, targeting or advertising cookies may be lined to the Website functionality provided by the other companies. For further information please see the section of the Cookie Statement entitled \u201cTargeted Online Advertising\u201d. These cookies do not store information directly identifying an individual, but are based on uniquely identifying your browser and internet device (including other technical details, such as IP address, operating system, internet service provider, referring website, etc.). If you do not allow these cookies, you will experience less targeted advertising."
              },
              GroupName: {
                Text: "Advertising (Targeting) Cookies"
              },
              IsDntEnabled: !1
            }],
            Cookies: [],
            Purposes: [],
            GroupId: 146879
          },
          GroupLanguagePropertiesSets: [{
            DefaultStatus: {
              Text: "Active"
            },
            GroupDescription: {
              Text: ""
            },
            GroupName: {
              Text: "Google"
            },
            IsDntEnabled: !1
          }],
          Cookies: [{
            Name: "APISID",
            Host: ".google.com",
            IsSession: !1,
            Length: 685
          }, {
            Name: "DV",
            Host: ".google.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "HSID",
            Host: ".google.com",
            IsSession: !1,
            Length: 685
          }, {
            Name: "OGPC",
            Host: ".google.com",
            IsSession: !1,
            Length: 15
          }, {
            Name: "S",
            Host: ".google.com",
            IsSession: !0,
            Length: 0
          }, {
            Name: "SAPISID",
            Host: ".google.com",
            IsSession: !1,
            Length: 685
          }, {
            Name: "SID",
            Host: ".google.com",
            IsSession: !1,
            Length: 687
          }, {
            Name: "SIDCC",
            Host: ".google.com",
            IsSession: !1,
            Length: 91
          }, {
            Name: "SSID",
            Host: ".google.com",
            IsSession: !1,
            Length: 687
          }, {
            Name: "NID",
            Host: ".google.com",
            IsSession: !1,
            Length: 175
          }],
          Purposes: [],
          GroupId: 149222
        }
      ],
      ConsentModel: {
        Name: "Owner Defined"
      },
      Language: {
        Culture: "en-GB"
      },
      showBannerCloseButton: !1,
      ShowPreferenceCenterCloseButton: !0,
      FooterDescriptionText: "",
      IsDntEnabled: !1,
      CustomJs: null,
      LifespanTypeText: null,
      LifespanDurationText: null,
      IsConsentLoggingEnabled: !1
    });
    return fa
  }

  function Ra() {
    for (var b = t(), e = document.getElementsByTagName("script"), f = 0; f < e.length; ++f) {
      var g;
      g = e[f];
      var m = b.cctId;
      g = g.getAttribute("src") ? -1 !== g.getAttribute("src").indexOf(m) : !1;
      if (g) {
        W = za(e[f].src);
        break
      }
    }
  }

  function M(b) {
    var e = za(b);
    W && e && W.hostname !== e.hostname && (b = b.replace(e.hostname, W.hostname));
    return b
  }

  function za(b) {
    var e = document.createElement("a");
    e.href = b;
    return e
  }

  function Pa(b) {
    var e = !1,
      h = Aa(window.location.href),
      g = f("\x3cdiv\x3e\x3c/div\x3e");
    g.html(b);
    b = f("a", g);
    for (g = 0; g < b.length; g++)
      if (Aa(b[g].href) == h) {
        e = !0;
        break
      }
    return e
  }

  function Aa(b) {
    return b.toLowerCase().replace(/(^\w+:|^)\/\//, "").replace("www.", "")
  }

  function Sa() {
    "function" != typeof Object.assign && Object.defineProperty(Object, "assign", {
      value: function (b, e) {
        if (null == b) throw new TypeError("Cannot convert undefined or null to object");
        for (var f = Object(b), g = 1; g < arguments.length; g++) {
          var m = arguments[g];
          if (null != m)
            for (var n in m) Object.prototype.hasOwnProperty.call(m,
              n) && (f[n] = m[n])
        }
        return f
      },
      writable: !0,
      configurable: !0
    })
  }

  function Ta() {
    Array.prototype.fill || Object.defineProperty(Array.prototype, "fill", {
      value: function (b, e, f) {
        if (null == this) throw new TypeError("this is null or not defined");
        var g = Object(this),
          h = g.length >>> 0;
        e >>= 0;
        e = 0 > e ? Math.max(h + e, 0) : Math.min(e, h);
        f = void 0 === f ? h : f >> 0;
        for (h = 0 > f ? Math.max(h + f, 0) : Math.min(f, h); e < h;) g[e] = b, e++;
        return g
      }
    })
  }
  var P = "yes" == navigator.doNotTrack || "1" == navigator.doNotTrack || "1" == navigator.msDoNotTrack,
    Q = !1,
    sa = !1,
    ya = function () {
      var b = !0,
        e, f = t(),
        g;
      for (g = 0; g < f.Groups.length; g += 1)
        if (e = f.Groups[g], w(e) && (!z(e) || z(e) && ("active" == z(e).toLowerCase() || "inactive landingpage" == z(e).toLowerCase() || "do not track" == z(e).toLowerCase()))) {
          b = !1;
          break
        }
      return b
    }(),
    Ea = function () {
      var b = !0,
        e, f = t(),
        g;
      for (g = 0; g < f.Groups.length; g += 1)
        if (e = f.Groups[g], w(e) && (e = z(e).toLowerCase(), "inactive landingpage" !== e && "always active" !== e)) {
          b = !1;
          break
        }
      return b
    }(),
    aa = !1,
    q, da = [],
    ea = [],
    J = [],
    K = [],
    C = t().AboutCookiesText,
    W = null,
    ma = !1,
    fa, f;
  this.LoadBanner = function () {
    f ? f(window).trigger("otloadbanner") :
      ma = !0
  };
  this.Init = function () {
    Sa();
    Ta();
    Ra();
    va();
    (function () {
      function b(b, f) {
        f = f || {
          bubbles: !1,
          cancelable: !1,
          detail: void 0
        };
        var e = document.createEvent("CustomEvent");
        e.initCustomEvent(b, f.bubbles, f.cancelable, f.detail);
        return e
      }
      if ("function" === typeof window.CustomEvent) return !1;
      b.prototype = window.Event.prototype;
      window.CustomEvent = b
    })();
    L();
    Ca();
    Da();
    Fa()
  };
  this.InsertScript = function (b, e, f, g, m) {
    var h = null != g && "undefined" != typeof g,
      p;
    if (S(m, h && "undefined" != typeof g.ignoreGroupCheck && 1 == g.ignoreGroupCheck ||
        !1) && !E(da, m)) {
      J.push(m);
      h && "undefined" != typeof g.deleteSelectorContent && 1 == g.deleteSelectorContent && wa(e);
      m = document.createElement("script");
      null != f && "undefined" != typeof f && (p = !1, m.onload = m.onreadystatechange = function () {
        p || this.readyState && "loaded" != this.readyState && "complete" != this.readyState || (p = !0, f())
      });
      m.type = "text/javascript";
      m.src = b;
      switch (e) {
        case "head":
          document.getElementsByTagName("head")[0].appendChild(m);
          break;
        case "body":
          document.getElementsByTagName("body")[0].appendChild(m);
          break;
        default:
          document.getElementById(e) && (document.getElementById(e).appendChild(m), h && "undefined" != typeof g.makeSelectorVisible && 1 == g.makeSelectorVisible && V(e))
      }
      if (h && "undefined" != typeof g.makeElementsVisible)
        for (b = 0; b < g.makeElementsVisible.length; b += 1) V(g.makeElementsVisible[b]);
      if (h && "undefined" != typeof g.deleteElements)
        for (h = 0; h < g.deleteElements.length; h += 1) xa(g.deleteElements[h])
    }
  };
  this.InsertHtml = function (b, e, f, g, m) {
    var h = null != g && "undefined" != typeof g;
    if (S(m, h && "undefined" != typeof g.ignoreGroupCheck &&
        1 == g.ignoreGroupCheck || !1) && !E(ea, m)) {
      K.push(m);
      h && "undefined" != typeof g.deleteSelectorContent && 1 == g.deleteSelectorContent && wa(e);
      m = document.getElementById(e);
      var p;
      m && (p = document.createElement("div"), p.innerHTML = b, m.appendChild(p));
      h && "undefined" != typeof g.makeSelectorVisible && 1 == g.makeSelectorVisible && V(e);
      if (h && "undefined" != typeof g.makeElementsVisible)
        for (b = 0; b < g.makeElementsVisible.length; b += 1) V(g.makeElementsVisible[b]);
      if (h && "undefined" != typeof g.deleteElements)
        for (h = 0; h < g.deleteElements.length; h +=
          1) xa(g.deleteElements[h]);
      null != f && "undefined" != typeof f && f()
    }
  };
  this.Close = function () {
    H();
    G("NotLandingPage");
    D("OptanonConsent");
    N();
    L();
    R()
  };
  this.AllowAll = function (b) {
    var e = t(),
      h;
    q = [];
    for (h = 0; h < e.Groups.length; h += 1) b = e.Groups[h], w(b) && q.push(v(b) + ":1");
    f("#optanon #optanon-menu li").removeClass("menu-item-off");
    f("#optanon #optanon-menu li").addClass("menu-item-on");
    f("#optanon-show-settings-popup ul li").each(function () {
      f(this).find(".icon").removeClass("menu-item-off").addClass("menu-item-on")
    });
    H();
    G("NotLandingPage");
    D("OptanonConsent");
    N();
    L();
    R()
  };
  this.ToggleInfoDisplay = function () {
    f("#optanon #optanon-popup-bg, #optanon #optanon-popup-wrapper").is(":hidden") ? Qa() : (H(), D("OptanonConsent"), N(), L(), R())
  };
  this.BlockGoogleAnalytics = function (b, e) {
    window["ga-disable-" + b] = !S(e)
  };
  this.TriggerGoogleAnalyticsEvent = function (b, e, f, g) {
    "undefined" != typeof _gaq && _gaq.push(["_trackEvent", b, e, f, g]);
    "undefined" != typeof ga && ga("send", "event", b, e, f, g);
    "undefined" != typeof dataLayer && dataLayer.constructor ===
      Array && dataLayer.push({
        event: "trackOptanonEvent",
        optanonCategory: b,
        optanonAction: e,
        optanonLabel: f,
        optanonValue: g
      })
  };
  this.IsAlertBoxClosed = this.IsAlertBoxClosedAndValid = function () {
    var b = t(),
      e = F("OptanonAlertBoxClosed"),
      b = b.LastReconsentDate;
    if (null === e) return !1;
    if (!b) return !0;
    (e = new Date(b) > new Date(e)) && Optanon.ReconsentGroups();
    return !e
  };
  this.ReconsentGroups = function () {
    var b = !1,
      e = I(u("OptanonConsent", "groups")),
      f = I(u("OptanonConsent", "groups").replace(/:0/g, "").replace(/:1/g, "")),
      g = t();
    if (u("OptanonConsent",
        "groups")) {
      for (var m = 0; m < g.Groups.length; m += 1) {
        var n = g.Groups[m];
        if (w(n)) {
          var p = U(f, v(n));
          if (-1 != p) {
            var q = z(n).toLowerCase(); - 1 < ["inactive", "inactive landingpage", "do not track"].indexOf(q) && (b = !0, q = "inactive landingpage" === q ? ":1" : ":0", e[p] = v(n) + q)
          }
        }
      }
      b && D("OptanonConsent", e)
    }
  };
  this.SetAlertBoxClosed = function (b) {
    var e = (new Date).toISOString();
    b ? ba("OptanonAlertBoxClosed", e, 365) : ba("OptanonAlertBoxClosed", e)
  };
  this.GetDomainData = function () {
    return t()
  };
  this.OnConsentChanged = function (b) {
    window.addEventListener("consent.onetrust",
      b)
  }
}).call(Optanon);
Optanon.Init();
