$(function () {

  // var legalSlugs = JSON.parse($('[name="legalSlugs"]').val());

  function openLegalModal(doc) {
    console.log('openLegalModal: doc', doc);
    let title = doc.title ? doc.title.resource ? localizer.get(doc.title.resource) : doc.title.text || '' : '';
    $.ajax({
      url: doc.url,
      success: function(html) {
        $('#LegalModal .contents').html(html);
        $('#LegalModal .contents').find('style').remove();
        setTimeout(function () {
          $('#LegalModal .contents').scrollTop(0)
        }, 200)
        $('#LegalModalTitle').html(localizer.get(title));
        $('#acceptBtn').data('legal', JSON.stringify(doc));
        $('#declineBtn').data('legal', JSON.stringify(doc));
        if (doc.pdf)  {
          $('#downloadLink').attr('href', doc.pdf);
          $('#downloadLink').show();
          $('#printBtn').hide();
        } else {
          $('#downloadLink').hide();
          $('#printBtn').show();
          $('#printBtn').data('legal', JSON.stringify(doc));
        }
        var $checkbox = $('[name="legalDocumentConsents[' + doc.identifier + ']"]');
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

  function printDocument(doc) {
    console.log('printDocument: doc', doc);
    let title = doc.title ? doc.title.resource ? localizer.get(doc.title.resource) : doc.title.text || '' : '';
    var printWindow = window.open('', 'PRINT', 'height=600,width=800');

    printWindow.document.write('<html><head>' + localizer.get(title) + '</head><body>' + $('#LegalModal .contents').html() + '</body></html>');
    printWindow.document.close();
    printWindow.focus();

    printWindow.print();
    printWindow.close();

    return true
  }

  /*$('label.tos-container a').on('click', function(e) {
    e.preventDefault();
    
    var doc = $(this).parents('.tos-container').data('legal');
    console.log('label.tos-container.click: doc', doc);
    //let title = doc.title ? doc.title.resource ? localizer.get(doc.title.resource) : (doc.title && doc.title.text) || '' : '';
    
    var $checkbox = $('[name="legalDocumentConsents[' + doc.identifier + ']"]');
    var isExternal = doc.url.indexOf('storage.googleapis.com') == -1
    if(isExternal) {
      // var checked = $checkbox.is(':checked');      
      window.open(doc.url, '_blank');
      $checkbox.prop('checked', false);
    } else {
      openLegalModal(doc);
    }    
  });*/

  $('label.tos-container').on('click', function(e) {
    e.preventDefault();
    
    var doc = $(this).data('legal');
    console.log('label.tos-container.click: doc', doc);
    let title = doc.title ? doc.title.resource ? localizer.get(doc.title.resource) : doc.title.text || '' : '';    
    var $checkbox = $('[name="legalDocumentConsents[' + doc.identifier + ']"]');
    var isExternal = doc.url.indexOf('storage.googleapis.com') == -1
    if(isExternal) {
      if (!e || !e.toElement || e.toElement.nodeName != 'A') {
        var checked = $checkbox.is(':checked');
        $checkbox.prop('checked', !checked);
      }
    } else {
      openLegalModal(doc);
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
    var doc = JSON.parse($(this).data('legal'));    
    console.log('label.tos-container.click: doc', doc);
    var domId = '[name="legalDocumentConsents[' + doc.identifier + ']"]';
    $(domId).prop('checked', true);
    $(domId).parent().removeClass('has-error')
    $(domId).parent().find('span.error-msg').html('').hide();    
    $('#LegalModal').modal('hide');
  }); 


  $('#declineBtn').on('click', function(e) {
    e.preventDefault();
    var doc = JSON.parse($(this).data('legal'));
    console.log('label.tos-container.click: doc', doc);
    $('[name="legalDocumentConsents[' + doc.identifier + ']"]').prop('checked', false);
    $('#LegalModal').modal('hide');
  }); 

  $('#printBtn').on('click', function(e) {
    e.preventDefault();
    var doc = JSON.parse($(this).data('legal'));
    console.log('label.tos-container.click: doc', doc);
    printDocument(doc)
    $('#LegalModal').modal('hide');
  });


});