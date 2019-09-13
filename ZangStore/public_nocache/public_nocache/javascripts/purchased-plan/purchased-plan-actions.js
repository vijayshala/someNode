$(function()    {
    var fadeSpeed = 200;
    $('#requestcancelplan').click(function(e)   {
        e.preventDefault();
        $('#RequestCancellationConfirmationModal').fadeIn(fadeSpeed);
    });

    $('#RequestCancellationConfirmationModalYesBtn').click(function(e)  {
        e.preventDefault();
        requestcancelplan($(this));
    });

    $('#RequestCancellationConfirmationModalNoBtn').click(function(e)  {
        $('#RequestCancellationConfirmationModal').fadeOut(fadeSpeed);
    });

    function requestcancelplan($obj)    {
        var ppid = $('[name="ppid"]').val();

        $('.successMSG,.failMSG').hide();

        $.ajax({
            headers: {
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            method: 'POST',
            url: '/clientapi/purchased-plans/' + ppid + '/requestcancel',
            dataType: 'json',
            success: function(response) {
                $('.successMSG').text(localizer.get('A_MEMBER_OF_OUR_CUSTOMER_SUCCESS_DEPARTMENT_WILL_REVIEW_AND_FOLLOW_UP_YOUR_REQUEST_WITHIN_1_2_BUSINESS_DAYS_TO_MAKE_THIS_A_SEAMLESS_PROCESS'));
                $('.successMSG').show();
                $('body').scrollTop(0);
                $('#RequestCancellationConfirmationModal').fadeOut(fadeSpeed);
            },
            error: function(response)    {
                console.error(response);
                $('.failMSG').text(localizer.get('FAILED_TO_REQUEST_CANCELLATION'));
                $('.failMSG').show();
                $('body').scrollTop(0);
                $('#RequestCancellationConfirmationModal').fadeOut(fadeSpeed);
            }
        });
    }
})