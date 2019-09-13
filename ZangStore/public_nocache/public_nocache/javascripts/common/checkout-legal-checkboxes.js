$(function () {

  // var legalSlugs = JSON.parse($('[name="legalSlugs"]').val());

  function openLegalModal(legal) {
    $.ajax({
      url: legal.htmlUrl,
      success: function(html) {
        $('#LegalModal .contents').html(html);
        $('#LegalModal .contents').find('style').remove();
        setTimeout(function () {
          $('#LegalModal .contents').scrollTop(0)
        }, 200)
        $('#LegalModalTitle').html(localizer.get(legal.title));
        $('#acceptBtn').data('legal', JSON.stringify(legal));
        $('#declineBtn').data('legal', JSON.stringify(legal));
        $('#printBtn').data('legal', JSON.stringify(legal));
        var $checkbox = $('[name="legal-checkbox-' + legal.slug + '"]');
        if(!$checkbox.is(':checked')) {
          $('#acceptBtn').attr('disabled', true);
        }        
        $('#LegalModal').modal();
      },
      error: function(err) {
        console.error(err)
      }
    })
  }

  function printDocument(legal) {
    
    var printWindow = window.open('', 'PRINT', 'height=600,width=800');

    printWindow.document.write('<html><head>' + localizer.get(legal.title) + '</head><body>' + $('#LegalModal .contents').html() + '</body></html>');
    printWindow.document.close();
    printWindow.focus();

    printWindow.print();
    printWindow.close();

    return true
  }

  $('label.tos-container').on('click', function(e) {
    e.preventDefault();
    var legal = $(this).data('legal');
    var $checkbox = $('[name="legal-checkbox-' + legal.slug + '"]');

    if(legal.external) {
      var checked = $checkbox.is(':checked');
      
      if(!checked) {
        window.open(legal.externalUrl, '_blank');
        $checkbox.prop('checked', true);
      } else {
        $checkbox.prop('checked', false);
      }
    } else {
      openLegalModal(legal);
    }    
  });

  $('#LegalModal .contents').on('scroll', function(e) {
    var innerHeight = $(this).innerHeight();
    var scrollHeight = $(this)[0].scrollHeight;
    var scrollTop = $(this).scrollTop();
    console.log(scrollHeight - scrollTop)
    if(scrollTop + innerHeight >= scrollHeight) {
      $('#acceptBtn').attr('disabled', false);
    }
  });


  $('#acceptBtn').on('click', function(e) {
    e.preventDefault();
    var legal = JSON.parse($(this).data('legal'));
    $('[name="legal-checkbox-' + legal.slug + '"]').prop('checked', true);
    $('#LegalModal').modal('hide');
  }); 


  $('#declineBtn').on('click', function(e) {
    e.preventDefault();
    var legal = JSON.parse($(this).data('legal'));
    $('[name="legal-checkbox-' + legal.slug + '"]').prop('checked', false);
    $('#LegalModal').modal('hide');
  }); 

  $('#printBtn').on('click', function(e) {
    e.preventDefault();
    var legal = JSON.parse($(this).data('legal'));
    printDocument(legal)
    $('#LegalModal').modal('hide');
  });


});