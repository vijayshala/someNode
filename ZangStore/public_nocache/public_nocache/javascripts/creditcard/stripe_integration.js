$(function()    {
    var stripeKey = $('[name="stripeKey"]').val();
    var stripe = Stripe(stripeKey);
    var elements = stripe.elements();
    //TODO: add localization

    var style = {
        iconStyle: 'solid',
        base: {
            fontSize: '16px',
            color: "#32325d",
            fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        },
        complete: {

        }
    };

    var billingZip = document.querySelector('input[name="billingPostalCode"]');
    if (!billingZip) {
        //new 1.5 checkout added by Ray
        billingZip = document.querySelector('input[name="billingAddress.zip"]');
    }
    var card = elements.create('card', {
        style: style,
        hidePostalCode: billingZip ? true : false
    });

    card.mount('#card-element');

    card.addEventListener('change', function(event) {
        var displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    
    if (billingZip) {
        card.update({value: {postalCode: billingZip.value}});
        
        billingZip.addEventListener('change', function(event) {
            card.update({value: {postalCode: event.target.value}});
        });
    } 

    window.stripeObj = stripe;
    window.stripeCard = card;
});



function stripeSubmit(form, fn) {
    var name = $('[name="creditCardName"]').val();
    var card = window.stripeCard;
    window.stripeObj.createToken(card, {
        name: name
    }).then(function(result) {
        if (result.error) {
            var errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
        } else {
            $('[name="stripeToken"]').remove();
            var hiddenInput = document.createElement('input');
            hiddenInput.setAttribute('type', 'hidden');
            hiddenInput.setAttribute('name', 'stripeToken');
            hiddenInput.setAttribute('value', result.token.id);
            form.appendChild(hiddenInput);
            if (fn) {
                fn();
            } else  {
                form.submit();
            }
        }
    });
}