$(function()    {
    var requestInProgress = false;

    $('#long-distance-search-bar').on('keyup', function(e)   {
        if (e.target.value == '' || e.target.value.length < 3) {
            $('#long-distance-rates-table-content').find('tr:not(.special-row)').remove();
            $('#long-distance-rates-table-content').find('.initial-row').show();
            $('#long-distance-rates-table-content').find('.not-found-row').hide();
        } else {
            getLongDistanceRates(e.target.value);
        }
    });

    $('#long-distance-rates-table-content').on('scroll', function(e)    {
        var $this = $(this);
        var scrollHeight = $this.scrollTop();
        var totalHeight = $this[0].scrollHeight - $this.height();

        if (totalHeight - scrollHeight <= 5)    {
            var nextUrl = $('#long-distance-pagination').data('href');
            if (nextUrl && nextUrl != '')   {
                getLongDistanceRates('', nextUrl);
            }
        }
    })

    function getLongDistanceRates(countrystr, url)  {
        if (requestInProgress && url)  {
            return
        }
        
        var $tablecontent = $('#long-distance-rates-table-content');
        
        $tablecontent.append($tablecontent.find('tr.loading-row').clone());
        $tablecontent.find('tr.loading-row').first().remove();
        $tablecontent.find('tr.loading-row').show();
    
        var path = '/api/rates/long-distance/search';
        var queryobj = {
            from: 'us',
            size: 15,
            countryName: countrystr,
            sort: 'prefix',
            countryNameAnchorBegin: true
        };
    
        if (url)    {
            path = url;
            queryobj = null;
        }
    
        requestInProgress = true;
        $.get(path, queryobj)
        .done(function(response)   {
            requestInProgress = false;
            $tablecontent = $('#long-distance-rates-table-content');
            $tablecontent.find('tr.loading-row').hide();
            if (response && response.data)  {
                if (!url)   {
                    $tablecontent.find('tr:not(.special-row)').remove();
                }
                
                $tablecontent.find('.initial-row').hide();
    
                if (response.data.length > 0)  {
                    $tablecontent.find('.not-found-row').hide();
                    var html = '';
    
                    for(var i = 0; i < response.data.length; i++)   {
                        var row = response.data[i];
                        html += '<tr><td>' + $('<div/>').text(row.countryName).html() + '</td><td>' + $('<div/>').text(row.prefix).html() + '</td><td style="text-align:right;">' + $('<div/>').text(row.cdefault).html() + '</td></tr>';
                    }
    
                    $tablecontent.append(html);
    
                    if (response.nextPageUrl && response.nextPageUrl != '') {
                        $('#long-distance-pagination').data('href', response.nextPageUrl);
                    } else  {
                        $('#long-distance-pagination').data('href', '');
                    }
                } else  {
                    $tablecontent.find('.not-found-row').show();
                }
            } else  {
                handleError(response);
            }
            $('#longDistanceRatesModal').modal('handleUpdate');
        }).fail(handleError);
    
        function handleError(response, status)  {
            requestInProgress = false;
            $tablecontent = $('#long-distance-rates-table-content');
            console.error('Error occured retrieving long distance rates', status, response);
            $tablecontent.find('tr.loading-row').hide();
    
            $tablecontent.append($tablecontent.find('tr.not-found-row').clone());
            $tablecontent.find('tr.not-found-row').first().remove();
    
            //$tablecontent.find('tr:not(.special-row)').remove();
            $tablecontent.find('.not-found-row').show();
            $tablecontent.find('.initial-row').hide();
        }
    }
});