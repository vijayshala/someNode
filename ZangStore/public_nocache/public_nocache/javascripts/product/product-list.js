$(function () {

  var downloads = JSON.parse($('[name="downloads"]').val());

  var downloadLinkTemplates = {
    apple: "<a href='{HREF}' target='_blank' rel='noopener noreferrer'><img src='https://storage.googleapis.com/avayastore/public_files/badge-appstore.png'></a>",
    google: "<a href='{HREF}' target='_blank' rel='noopener noreferrer'><img src='https://storage.googleapis.com/avayastore/public_files/badge-playstore.png'></a>",
    chrome: "<a href='{HREF}' target='_blank' rel='noopener noreferrer'><img src='https://storage.googleapis.com/avayastore/public_files/badge-chromewebstore.png'></a>",
    none: "<a href='{HREF}' target='_blank' rel='noopener noreferrer' class='download-btn'>{TEXT}</a>"
  };

  var downloadLinksTemplate = [
    "<a href='https://storage.googleapis.com/onesna/public/spaces/downloads/SpacesOutlookSetup.msi' target='_blank' rel='noopener noreferrer' class='download-btn'>Download</a>"
  ].join("\n");
  var downloadTemplate = [
    "<div class='row'>",
       "<div class='col-md-12'>",
          "<div class='download'>",
             "<div class='info'>",
                "<div class='logo'><img src='{LOGO}'></div>",
                "<div class='description'>{DESCRIPTION}</div>",
                "<div style='clear:both;'></div>",
                "<div class='brief-description'>{BRIEF_DESCRIPTION}</div>",
                "<div class='requirements'>{REQUIREMENTS}</div>",
             "</div>",
             "<div class='links'>{LINKS}</div>",
          "</div>",
       "</div>",
    "</div>"
  ].join("\n");


  function filterDownloads(e){

    if(e){
      e.preventDefault();
      $(this).addClass('selected').siblings().removeClass('selected');
    }

    var self = this
    var items = downloads.filter(function (download) {
      return e ? ($(self).data('product') === 'all' ? download.product !== 'all' : download.product === $(self).data('product')) : download.product !== 'all'
    });


    items.sort(function(a, b){
        if(a.product < b.product) return -1;
        if(a.product > b.product) return 1;
        return 0;
    })



    var html = "";

    for(var i=0;i<items.length;i++){
      var item = items[i];
      var linksHTML = "";
      for(var j=0;j<item.links.length;j++){
        var link = item.links[j];
        linksHTML += downloadLinkTemplates[link.platform]
          .replace('{HREF}', $('<div/>').text(link.href).html())
          .replace('{TEXT}', $('<div/>').text(link.text).html())
      }

      html += downloadTemplate
        .replace('{LOGO}', $('<div/>').text(item.logo).html())
        .replace('{DESCRIPTION}', $('<div/>').text(item.description).html())
        .replace('{BRIEF_DESCRIPTION}', $('<div/>').text(item.briefDescription).html())
        .replace('{REQUIREMENTS}', $('<div/>').text(item.requirements).html())
        .replace('{LINKS}', $('<div/>').text(linksHTML).html())
    }

    $(".downloads-container").html(html);
  }


  $('.filter-btn').on('click', filterDownloads)

  filterDownloads()


});
