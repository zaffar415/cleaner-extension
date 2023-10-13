(() => {

    let domains =  [];
    let inputDomain = '';

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
    $("#clear-all-form [name='type']").on('change', (e) => {
        $("#select-domain").hide();

        if(e.target.value == 'Domain') {
            $("#select-domain").show();
            $("#select-domain .select2").select2();
        } 
    })

    // Remove Errors in form change
    $("#clear-all-form").on('change',() => {
        $("#clear-all-form .error").remove();
    })

    // Submit Handler
    $("#clear-all-form").on('submit', (e) => {
        e.preventDefault();
        $(e.target).find(".error").remove();

        let form = $("#clear-all-form").serializeArray();
        console.log(form);

        let domains = []
        let type = $("#clear-all-form [name='type']:checked").val();

        switch(type) {
            case 'All': 
                $(".confirmation-page p").text("This operation will wipe out all the data in the browser");
                showConfirmation("#clear-all-form");
                if(isValidated) {
                    chrome.browsingData.remove({
                        "since": 0,
                    }, {
                        "cookies": true,
                    }, function() {
                        window.location.href = '../popup.html?message=Data cleared successfully';
                    });
                }
                break;
            case 'Domain':

                inputDomain = $("#clear-all-form [name='domain']").val().replaceAll(['https://', 'https://'], '');
                inputDomain = inputDomain.match(/[a-z0-9]+\.[a-z]+/)
                
                if(!inputDomain) {
                    setError("#clear-all-form input[name='domain']", "Please enter domain");
                    return false;
                }
                form.map((input) => {
                    if(input.name == 'domain') {
                        domains.push('https://' + input.value);
                        domains.push('http://' + input.value);
                    }
                })
                $(".confirmation-page p").text("This operation will wipe out all the data in the " + inputDomain);
                showConfirmation("#clear-all-form");

                if(isValidated) {
                    clearAll();
                }

                break;
        }

        isValidated = true
    })


    // Trigget Submit after confirmation
    $(".confirmation-page #clear").on('click', (e) => {
        console.log( $(e.target).closest(".confirmation-page").prev().trigger('submit'))
    })

    // Clear All Function
    function clearAll() {
        let clearData = {
            "cookies": true,
            "localStorage": true,
            "passwords": true,
            "history": true,
        }

        let options = {
            "since": 0,
            originTypes: {
                unprotectedWeb: true,
                protectedWeb: true,
                extension: true,
            },
        }

        if(domains.length) {
            options.origins = domains;
            clearData.history = false;

            chrome.history.search({ text: inputDomain }, function (results) {
                results.forEach(function (result) {
                    chrome.history.deleteUrl({ url: result.url }, function () {
                        // console.log(`Deleted history entry for URL: ${result.url}`);
                    });
                });
            });
        }

        // {
        //     // "appcache": true,
        //     "cache": true,
        //     "cookies": true,
        //     // "downloads": true,
        //     // "fileSystems": true,
        //     // "formData": true,
        //     // "history": true,
        //     // "indexedDB": true,
        //     "localStorage": true,
        //     // "pluginData": true,
        //     "passwords": true,
        //     // "webSQL": true
        // }

        chrome.browsingData.remove(options, clearData, function() {
            window.location.href = '../popup.html?message=Data cleared successfully';
        });
    }

})();