$(function () {


    var actions = {
      cancel: {
        modalTitle: 'Cancel the Contract',
        modalResults: [
          'Delete the monthly subscription for this contract.',
          'Delete any account on any third party systems',
          'Mark the status of this contract as CANCELED'
        ]
      },
      disable: {
        modalTitle: 'Disable the Contract',
        modalResults: [
          'Delete the monthly subscription for this contract.',
          'Disable any account on any third party systems',
          'Mark the status of this contract as DISABLED'
        ]
      },
      enable: {
        modalTitle: 'Enable the Contract',
        modalResults: [
          'Re-create the monthly subscription for this contract.',
          'Enable any account on any third party systems',
          'Mark the status of this contract as ENABLE'
        ]
      },
    },
  
    fadeSpeed = 200,
  
    closeConfirmationModal = function () {
      $('#ContractConfirmationModalYesBtn').data('href', null);
      $('#ContractConfirmationModal').fadeOut(fadeSpeed);
    },
  
    openConfirmationModal = function (link) {
      var action = actions[link.data('action')];
      $('#ContractConfirmationModalYesBtn').data('href', link.attr('href'));
      $('#ContractConfirmationModalTitle').text(action.modalTitle);
      var itemsHTML = '';
      for(var i=0;i<action.modalResults.length;i++){
        itemsHTML += '<li>' + $('<div/>').text(action.modalResults[i]).html() + '</li>';
      }
      $('#ContractConfirmationModalResults').html(itemsHTML);
      $('#ContractConfirmationModal').fadeIn(fadeSpeed);
    };
  
    $('.contract-action').on('click', function (e) {
      e.preventDefault();
      $('.successMSG,.failMSG').hide();
      openConfirmationModal($(this));
    });

    $('.provision-action').on('click', function (e) {
      e.preventDefault();
      $('.successMSG,.failMSG').hide();
      var action = $(this).data('action');
      var ppid = $('[name="ppid"]').val();
      if (action == 'retry')  {
        retryKazooProvision(ppid);
      }
    });

    function retryKazooProvision(id)  {
      $.ajax({
        url: '/webservice/kazoo/provision/' + id,
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        dataType: 'json',
        success: function(response) {
          console.log(response);
          $('.successMSG').text(localizer.get('PROVISIONING_RETRIED'));
          $('.successMSG').show();
          $('body').scrollTop(0);
        },
        error: function(err)  {
          console.log(err);
          $('.failMSG').text(localizer.get('FAILED_TO_PROVISION'));
          $('.failMSG').show();
          $('body').scrollTop(0);
        }
      })
    }
  
    $('#ContractConfirmationModalYesBtn').on('click', function (e) {
      e.preventDefault();
      var ppid = $('[name="ppid"]').val();
      if(ppid){
        $('#ContractConfirmationModal').fadeOut(fadeSpeed);
        $('#ContractActionProcessModal').fadeIn(fadeSpeed);
        
        $.ajax({
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
          },
          method: 'POST',
          url: '/clientapi/purchased-plans/' + ppid + '/cancel',
          dataType: 'json',
          success: function(response) {
            location.reload();
          },
          error: function(err)    {
              $('.failMSG').text(localizer.get('FAILED_TO_CANCEL_PLAN'));
              $('.failMSG').show();
              $('body').scrollTop(0);
              $('#ContractActionProcessModal').fadeOut(fadeSpeed);
          }
        });
      }
    });
  
    $('#ContractConfirmationModalNoBtn').on('click', function (e) {
      e.preventDefault();
      $('#ContractConfirmationModal').fadeOut(fadeSpeed);
    });
  
  });
  