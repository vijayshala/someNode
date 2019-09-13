$(function () {

  var UI_ONLY_DATE_FORMAT = $('[name="UI_ONLY_DATE_FORMAT"]').val();
  var CURRENCY_SYMBOL = $('[name="CURRENCY_SYMBOL"]').val();
  var children = [];

  try {
    children = JSON.parse($('[name="children"]').val());
  } catch (e) {

  }

  var orderRowTemplate = [
    '<tr>',
    '<td>',
    '<h5 class="text-500">{AGENT_NAME}</h5>',
    '<h5 class="text-400">{PARTNER_COMPANY_NAME}</h5>',
    '<h6 class="text-300 text-muted">{AGENT_ID}</h6>',
    '</td>',
    '<td>',
    '<h5 class="text-500">{ORDER_DATE}</h5>',
    '<h5 class="text-400">{CUSTOMER_NAME} - {CUSTOMER_COMPANY_NAME}</h5>',
    '<h6 class="text-300">{BILLING_ADDRESS},{BILLING_CITY},{BILLING_STATE},{BILLING_COUNTRY},{BILLING_POSTAL_CODE}</h6>',
    '</td>',
    '<td>',
    '<h5 class="text-500">Con# {ORDER_CONFIRMATION_NUMBER}</h5>',
    '<h5 class="text-400">{PRODUCT_TITLE} : {PLAN_OPTION}</h5>',
    '{USER_BREAKDOWN}',
    '{DEVICE_BREAKDOWN}',
    '</td>',
    '<td>',
    '<h5 class="text-400 text-center text-uppercase">{ONE_TIME_FEE_LABEL}</h5>',
    '<h4 class="text-500 text-center">{ONE_TIME_FEE}</h4>',
    '</td>',
    '<td>',
    '<h5 class="text-400 text-center text-uppercase">{MONTHLY_FEE_LABEL}</h5>',
    '<h4 class="text-500 text-center">{INTERVAL_FEE}</h4>',
    '</td>',
    '</tr>'
  ].join('\n');

  function createItemUsersHTML(order) {
    if (order.details && order.details.users) {
      var html = "<h6 class='text-400'>" + localizer.get('USERS') + ": {USER_BREAKDOWN}</h6>";
      var breakdownHTML = ""
      for (var p in order.details.users) {
        if (order.details.users.hasOwnProperty(p)) {
          var qty = order.details.users[p]
          breakdownHTML += "(" + qty + "x) " + p;
        }
      }
      html = html.replace('{USER_BREAKDOWN}', breakdownHTML);
      return html;
    } else {
      return ""
    }
  }

  function createItemDevicesHTML(order) {
    if (order.details && order.details.devices) {
      var html = "<h6 class='text-400'>" + localizer.get('DEVICES') + ": {DEVICE_BREAKDOWN}</h6>";
      var breakdownHTML = ""
      for (var p in order.details.devices) {
        if (order.details.devices.hasOwnProperty(p)) {
          var qty = order.details.devices[p]
          breakdownHTML += "(" + qty + "x) " + p;
        }
      }
      html = html.replace('{DEVICE_BREAKDOWN}', breakdownHTML);
      return html;
    } else {
      return ""
    }
  }

  function applyData(data) {
    console.log(data);
    $('#partnerOrdersTableBody').html();
    if (data.orders.length === 0) {
      $('#partnerOrdersTableBody').html("<tr><td colspan='10'><h4 class='text-center text-400 text-danger'>" + localizer.get('NO_SALES_FOUND') + "</h4></td></tr>");
      return;
    }
    var html = "";
    var oneTimeTotal = 0;
    var intervalTotal = 0;
    var currencyCode = (data.query.region ? data.query.region : 'USD');


    var orders = data.orders.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.created.on) - new Date(a.created.on);
    });

    for (var i = 0; i < orders.length; i++) {
      var order = data.orders[i];

      if (order.order) {
        var item = order.order.items[0]
        var planOption = item.product.planOptions.filter(function (po) {
          return po.value === item.product.planOption;
        })[0]

        oneTimeTotal += order.oneTimeFee;
        intervalTotal += order.intervalFee;
        html += orderRowTemplate
          .replace('{AGENT_NAME}', $('<div/>').text(order.agent.user.account.displayname).html())
          .replace('{PARTNER_COMPANY_NAME}', $('<div/>').text(order.partner.fields.companyName).html())
          .replace('{AGENT_ID}', $('<div/>').text('ID: ' + order.agent._id).html())
          .replace('{ORDER_DATE}', $('<div/>').text(moment(order.created).format(UI_ONLY_DATE_FORMAT)).html())
          .replace('{CUSTOMER_NAME}', $('<div/>').text(order.order.accountInformation.firstName + ' ' + order.order.accountInformation.lastName).html())
          .replace('{CUSTOMER_COMPANY_NAME}', $('<div/>').text(order.order.accountInformation.companyName).html())
          .replace('{BILLING_ADDRESS}', $('<div/>').text(order.order.billingInformation.billingAddress).html())
          .replace('{BILLING_CITY}', $('<div/>').text(order.order.billingInformation.billingCity).html())
          .replace('{BILLING_STATE}', $('<div/>').text(order.order.billingInformation.billingStateProvince).html())
          .replace('{BILLING_COUNTRY}', $('<div/>').text(order.order.billingInformation.billingCountry).html())
          .replace('{BILLING_POSTAL_CODE}', $('<div/>').text(order.order.billingInformation.billingPostalCode).html())
          .replace('{ORDER_CONFIRMATION_NUMBER}', $('<div/>').text(order.order.confirmationNumber).html())
          .replace(/\{PRODUCT_TITLE\}/g, $('<div/>').text(item.product.title).html())
          .replace('{PLAN_OPTION}', $('<div/>').text(localizer.get(planOption.label)).html())
          .replace(/\{CURRENCY_SYMBOL\}/g, $('<div/>').text(CURRENCY_SYMBOL).html())
          .replace(/\{INTERVAL_FEE\}/g, $('<div/>').text((order.intervalFee / 100).formatDollars()).html())
          .replace(/\{ONE_TIME_FEE\}/g, $('<div/>').text((order.oneTimeFee / 100).formatDollars()).html())
          .replace(/\{ONE_TIME_FEE_LABEL\}/g, $('<div/>').text(localizer.get('ONE_TIME_FEE')).html())
          .replace(/\{MONTHLY_FEE_LABEL\}/g, $('<div/>').text(localizer.get('MONTHLY_FEE')).html())
          .replace('{USER_BREAKDOWN}', $('<div/>').text(createItemUsersHTML(order)).html())
          .replace('{DEVICE_BREAKDOWN}', $('<div/>').text(createItemDevicesHTML(order)).html())
      } else {
        oneTimeTotal += order.onetime.subTotal * 100;
        intervalTotal += order.subscriptions[0].subTotal * 100;
        var offerTitle;
        for (var oi in order.items) {
          var item = order.items[oi];
          if (item.level == 0) {
            offerTitle = item.title.resource ? localizer.get(item.title.resource) : item.title.text
          }
        }
        var currencySymbol = webApp.findCurrency(1, order.currency).symbol;
        var oneTime = webApp.formatCurrency(order.onetime.subTotal, { code: order.currency });
        var intervalTime = webApp.formatCurrency(order.subscriptions[0].subTotal, { code: order.currency });
        html += orderRowTemplate
          .replace('{AGENT_NAME}', $('<div/>').text(order.partnerAgent ? order.partnerAgent.user.account.displayname : localizer.get('NO_AGENT')).html())
          .replace('{PARTNER_COMPANY_NAME}', $('<div/>').text(order.partner.fields.companyName).html())
          .replace('{AGENT_ID}', $('<div/>').text(order.partnerAgent ? 'ID: ' + order.partnerAgent._id : '').html())
          .replace('{ORDER_DATE}', $('<div/>').text(moment(order.created.on).format(UI_ONLY_DATE_FORMAT)).html())
          .replace('{CUSTOMER_NAME}', $('<div/>').text(order.contact.firstName + ' ' + order.contact.lastName).html())
          .replace('{CUSTOMER_COMPANY_NAME}', $('<div/>').text(order.company.name).html())
          .replace('{BILLING_ADDRESS}', $('<div/>').text(order.billingAddress.address1).html())
          .replace('{BILLING_CITY}', $('<div/>').text(order.billingAddress.city).html())
          .replace('{BILLING_STATE}', $('<div/>').text(order.billingAddress.state).html())
          .replace('{BILLING_COUNTRY}', $('<div/>').text(order.billingAddress.country).html())
          .replace('{BILLING_POSTAL_CODE}', $('<div/>').text(order.billingAddress.zip).html())
          .replace('{ORDER_CONFIRMATION_NUMBER}', $('<div/>').text(order.confirmationNumber).html())
          .replace(/\{PRODUCT_TITLE\}/g, $('<div/>').text(offerTitle ? offerTitle : localizer.get('PRODUCT_NOT_FOUND')).html())
          .replace('{PLAN_OPTION}', $('<div/>').text(localizer.get('BILLED_' + order.subscriptions[0].billingPeriod.toUpperCase())).html())
          .replace(/\{CURRENCY_SYMBOL\}/g, $('<div/>').text(currencySymbol).html())
          .replace(/\{INTERVAL_FEE\}/g, $('<div/>').text(intervalTime).html())
          .replace(/\{ONE_TIME_FEE\}/g, $('<div/>').text(oneTime).html())
          .replace(/\{ONE_TIME_FEE_LABEL\}/g, $('<div/>').text(localizer.get('ONE_TIME_FEE')).html())
          .replace(/\{MONTHLY_FEE_LABEL\}/g, $('<div/>').text(localizer.get('MONTHLY_FEE')).html())
          .replace('{USER_BREAKDOWN}', '')
          .replace('{DEVICE_BREAKDOWN}', '')
      }


    }

    // Format the total one time and sub costs
    var formattedOneTime = webApp.formatCurrency((oneTimeTotal / 100), { code: currencyCode });
    var formattedIntervalTime = webApp.formatCurrency((intervalTotal / 100), { code: currencyCode });

    $('#partnerOrdersTableBody').html(html);
    $('.partnerTotal').text(localizer.get('TOTAL') + ' (' + currencyCode + ')');
    $('#oneTimeTotal').text(formattedOneTime);
    $('#intervalTotal').text(formattedIntervalTime);
    if (data.query.region) {
      $('.partnerFooter').show();
    } else {
      $('.partnerFooter').hide();
    }
  }

  function getData() {

    var url = "/partners/orders/" + $('[name="filterType"]').val();

    var $parentPartner = $('[name="parentPartner"]');
    var partner = $('[name="partner"]').val();
    var agent = $('[name="agent"]').val();
    var from = $('[name="from"]').val();
    var to = $('[name="to"]').val();
    var product = $('[name="product"]').val();
    var region = $('[name="region"]').val();

    console.log("Partner-order: ", region);

    if (partner === "") {
      if ($parentPartner.length) {
        if ($parentPartner.val() === "") {
          return
        } else {
          url += "?parent=" + $parentPartner.val()
        }
      } else {
        return;
      }
    } else {
      url += "?partner=" + partner;
    }

    if (product != "") {
      url += "&product=" + product;
    }

    if (agent !== "") {
      url += "&agent=" + agent;
    }

    if (region !== "") {
      url += "&region=" + region;
    }



    if (from !== "" && to !== "") {
      url += "&from=" + from + "&to=" + to
    } else if (from != "") {
      url += "&from=" + from
    } else if (to != "") {
      url += "&to=" + to
    }

    console.log("URL:", url);

    $('#partnerOrdersTableBody').html("<tr><td colspan='10'><h4 class='text-center text-400 text-danger'>Loading...</h4></td></tr>");
    $('#oneTimeTotal').text('$ ' + (0).formatDollars());
    $('#intervalTotal').text('$ ' + (0).formatDollars());



    $.ajax({
      headers: {
        'X-CSRF-Token': $('[name="_csrf"]').val()
      },
      url: url,
      dataType: 'json',
      method: 'GET',
      success: function (data) {
        if (data.orders.length > 0) {
          $('.export-report-btn').attr('href', url + "&export=true");
        } else {
          $('.export-report-btn').attr('href', "#");
        }
        applyData(data)
      },
      error: function (err) {
        console.error(err)
        $('#partnerOrdersTableBody').html("<tr><td colspan='10'><h4 class='text-center text-400 text-danger'>" + localizer.get('NO_SALES_FOUND') + "</h4></td></tr>");
      }
    })
  }

  $('[name="partner"]').on('change', function (e) {
    var value = $(this).val()

    if (value === '') {
      window.location.href = window.location.href;
    }

    if ($('[name="parentPartner"]').length) {
      $('[name="parentPartner]').val("");
    }

    var child = children.filter(function (ch) {
      return ch._id === value
    })[0]

    var opts = "<option value=''>" + localizer.get('SELECT_AGENT') + "</option>";

    // Create dropdown if you have the  agents
    if (child.agents) {
      for (var i = 0; i < child.agents.length; i++) {
        opts += "<option value='" + $('<div/>').text(child.agents[i]._id).html() + "'>" + $('<div/>').text(child.agents[i].user.account.displayname).html() + "</option>"
      }
    }

    $('[name="agent"]').html(opts);
    getData();

  });

  $('[name="agent"]').on('change', getData);
  $('[name="product"]').on('change', getData);
  $('[name="region"]').on('change', getData);

  try {
    $('[name="from"]').datepicker().on('change', getData);
    $('[name="to"]').datepicker().on('change', getData);
  } catch (e) {
    console.log(e)
  }

});