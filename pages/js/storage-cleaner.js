(()  => {

    var isValidated = false;

    // Set Error Message
    function setError(selector, message) {
        $(selector).parent().prepend('<span class="error">' + message + '</span>');
    }

    // Show Confirmation message
    function showConfirmation(form) {
        $(form).hide();
        $(form).next().show();
    }

    // Toggle input boxed on selecting the type
    $("#clear-storage-form [name='type']").on('change', (e) => {
        $("#select-domain").hide();

        if(e.target.value == 'Domain') {
            $("#select-domain").show();
        } 
    })

    // Remove Errors in form change
    $("#clear-storage-form").on('change',() => {
        $("#clear-storage-form .error").remove();
    })

    // Submit Handler
    $("#clear-storage-form").on('submit', (e) => {
        e.preventDefault();
        $(e.target).find(".error").remove();

        let form = $("#clear-storage-form").serializeArray();
        console.log(form);

        let domains = []
        let type = '';
        form.map((input) => {
            if(input.name == 'type') {
                type = input.value;
            }
        })



        switch(type) {
            case 'All': 
                showConfirmation("#clear-storage-form");

               if(isValidated) {
                    chrome.browsingData.remove({
                        "since": 0,
                        originTypes: {
                            unprotectedWeb: true,
                            protectedWeb: true,
                            extension: true,
                        },
                        // "origins": ['https://demo.oputils.com'],
                    }, {
                        "localStorage": true,
                    }, function() {
                        window.location.href = '../popup.html?message=Storage cleared successfully';
                    });
               }
                break;
            case 'Domain':
                let inputDomainString = $("#clear-storage-form [name='domain']").val().replaceAll(new RegExp('http://|https://', 'g'), '');
                inputDomain = inputDomainString.match(/[a-z0-9]+\.[a-z]+/)

                 
                if(!inputDomain) {
                    setError("#clear-storage-form input[name='domain']", "Please enter domain");
                    return false;
                }

                showConfirmation("#clear-storage-form");

                if(isValidated) {
                    domains = [
                        'https://' + inputDomainString,
                        'http://' + inputDomainString
                    ];

                    let clearData = {
                        "localStorage": true,
                    }
            
                    let options = {
                        "since": 0,
                        originTypes: {
                            unprotectedWeb: true,
                            protectedWeb: true,
                            extension: true,
                        },
                    }

                    chrome.browsingData.remove(options, clearData, function() {
                        window.location.href = '../popup.html?message=Storage cleared successfully';
                    });
                }
        

                break;
        }

        isValidated = true

    })

    // Trigget Submit after confirmation
    $(".confirmation-page #clear").on('click', (e) => {
        console.log( $(e.target).closest(".confirmation-page").prev().trigger('submit'))
    })


    
})();