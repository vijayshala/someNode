$(function () {

    var children = [];

    try{
        children = JSON.parse($('[name="children"]').val());
    } catch(e) {

    }

    var UI_ONLY_DATE_FORMAT = $('[name="UI_ONLY_DATE_FORMAT"]').val();

    var customerRowTemplate = [
        '<tr>',
            '<td>',
                '<h5 class="text-500">{CUSTOMER_DISPLAY_NAME}</h5>',
                '<h6 class="text-300">{CUSTOMER_EMAIL}</h6>',
            '</td>',
            '<td>',
                '<h5 class="text-500">{COMPANY_NAME}</h5>',
                '<h6 class="text-300">{COMPANY_ADDRESS}</h6>',
            '</td>',
            '<td>',
                '<h5 class="text-400">{DATE_CREATED}</h5>',
            '</td>',
            '<td>',
                '<h5 class="text-500">{AGENT_DISPLAY_NAME}</h5>',
                '<h5 class="text-300">{AGENT_COMPANY_NAME}</h5>',
            '</td>',
        '</tr>'
      ].join('\n');

    function applyData(data) {
        console.log(data);
        $('#partnerCustomerTableBody').html();
        if(data.customers.length === 0) {
          $('#partnerCustomerTableBody').html("<tr><td colspan='10'><h4 class='text-center text-400 text-danger'>" + localizer.get('NO_SALES_FOUND') + "</h4></td></tr>");
          return;
        }
        var html = "";
        for(var i=0;i<data.customers.length;i++) {
          var customer = data.customers[i];
         
          html += customerRowTemplate
            .replace('{CUSTOMER_DISPLAY_NAME}', $('<div/>').text(customer.customer ? customer.customer.account.displayname: '').html())
            .replace('{CUSTOMER_EMAIL}', $('<div/>').text(customer.customer ? customer.customer.account.username : '').html())
            .replace('{COMPANY_NAME}', $('<div/>').text(customer.company ? customer.company.name : '').html())
            .replace('{COMPANY_ADDRESS}', $('<div/>').text(customer.company ? customer.company.address : '').html())
            .replace('{DATE_CREATED}', $('<div/>').text(moment(customer.created).format(UI_ONLY_DATE_FORMAT)).html())
            .replace('{AGENT_DISPLAY_NAME}', $('<div/>').text(customer.agent.user.account.displayname).html())
            .replace('{AGENT_COMPANY_NAME}', $('<div/>').text(customer.partner.fields.companyName).html())          
        }
    
        $('#partnerCustomerTableBody').html(html);
      }

    function getData() {

        var url = "/partners/customers/" + $('[name="filterType"]').val();
    
        var $parentPartner = $('[name="parentPartner"]');
        var partner = $('[name="partner"]').val();
        var agent = $('[name="agent"]').val();
        var from = $('[name="from"]').val();
        var to = $('[name="to"]').val();
    
        if(partner === "") {
          if($parentPartner.length) {
            if($parentPartner.val() === "") {
              return
            } else  {
              url += "?parent=" + $parentPartner.val()
            }
          } else {
            return;
          }
        } else {
          url += "?partner=" + partner;
        }
    
        if(agent !== null && agent != "") {
          url += "&agent=" + agent;
        }
    
        if(from !== "" && to !== "") {
          url += "&from=" + from + "&to=" + to
        }
    
        console.log(url);
    
        $('#partnerCustomerTableBody').html("<tr><td colspan='10'><h4 class='text-center text-400 text-danger'>Loading...</h4></td></tr>");
        
        
    
        $.ajax({
          headers: {
            'X-CSRF-Token': $('[name="_csrf"]').val()
          },
          url: url,
          dataType: 'json',
          method: 'GET',
          success: function(data) {       
            applyData(data)
          },
          error: function (err) {
            console.error(err)
            $('#partnerCustomerTableBody').html("<tr><td colspan='10'><h4 class='text-center text-400 text-danger'>" + localizer.get('NO_SALES_FOUND') + "</h4></td></tr>");
          }
        })
      }

    $('[name="partner"]').on('change', function(e) {
        var value = $(this).val()
    
        if(value === '') {
          window.location.href = window.location.href;
        }
    
        if($('[name="parentPartner"]').length) {
          $('[name="parentPartner]').val("");
        }
    
        

        var child = children.filter(function(ch) {
          return ch._id === value
        })[0]
    
        var opts = "<option value=''>" + localizer.get('SELECT_AGENT') + "</option>";
        for(var i=0;i<child.agents.length;i++) {
          opts += "<option value='" + $('<div/>').text(child.agents[i]._id).text() + "'>" + $('<div/>').text(child.agents[i].user.account.displayname).text() + "</option>"
        }
    
        $('[name="agent"]').html(opts);
        getData();
    
      });
    
      $('[name="agent"]').on('change', getData);
    
      try {
        $('[name="from"]').datepicker().on('change', getData);
        $('[name="to"]').datepicker().on('change', getData);
      } catch(e) {
        console.log(e)
      }


});