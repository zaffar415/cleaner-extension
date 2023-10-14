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

    // Load Domains on Initialize
    function loadDomains() {
        domainOptions = '';
        chrome.cookies.getAll({}, function (cookies) {
            for (let i = 0; i < cookies.length; i++) {
                let domain = cookies[i].domain;
                if(domain.charAt(0) == '.') {
                    domain = domain.slice(1);
                }
                if($("select[name='domain'] option[value='"+domain+"']").length == 0) {
                    $("select[name='domain']").append(`<option value="${domain}">${domain}</option>`);
                }
            }
        });
    }
    loadDomains();

    // Toggle input boxed on selecting the type
    $("#clear-cookies-form [name='type']").on('change', (e) => {
        $("#select-domain").hide();
        $("#cookies-list").hide();

        if(e.target.value == 'Domain') {
            $("#select-domain").show();
            $("#cookies-list").show();
            $("#select-domain .select2").select2();
        } 
    })

    // Show Cookies List
    $("#clear-cookies-form [name='domain']").on('change', async(e) => {
        $("#cookies-list").html(`<div class="input-group checkbox" title="select All">
            <input type="checkbox" name="cookie" id="select-all" value="select-all">
            <label>Select All</label>   
        </div>`).show()
        if($(e.target).val())  {
            $(e.target).val().forEach(async (domain) => {
                chrome.cookies.getAll({ domain }, function (cookies) {
                    if (cookies.length === 0) {
                        $("#cookies-list").html('<p>No cookies found for this domain.</p>');
                    } else {
                       
                        cookies.forEach( async(cookie, index) => {
                            console.log(cookie);
                            $("#cookies-list").append(`<div class="input-group checkbox" title="${cookie.name}">
                                <input type="checkbox" name="cookie" value="${cookie.name}" data-domain="${cookie.domain}" data-path="${cookie.path}">
                                <label>${cookie.name}</label>
                            </div>`);
                        });
                    }
                });
            });
            
        }
        
    })

    // Select all and unselect all logic
    $("#clear-cookies-form").on("change", "#cookies-list input", (e) => {
        if($(e.target).val() == "select-all") {
            if($(e.target).is(":checked")) {
                $(e.target).closest(".checkbox").nextAll('.checkbox').find('input').prop("checked", true)
            } else {
                $(e.target).closest(".checkbox").nextAll('.checkbox').find('input').prop("checked", false)
            }
        } else {
            console.log($("#cookies-list .checkbox ~ .checkbox input:checked").length, $("#cookies-list .checkbox ~ .checkbox input").length);
            if($("#cookies-list .checkbox ~ .checkbox input:checked").length == $("#cookies-list .checkbox ~ .checkbox input").length) {
                $("#cookies-list #select-all").prop("checked", true);
            } else {
                $("#cookies-list #select-all").prop("checked", false);
            }
        }
    })

    // Remove Errors in form change
    $("#clear-cookies-form").on('change',() => {
        $("#clear-cookies-form .error").remove();
    })


    // Submit Handler
    $("#clear-cookies-form").on('submit', (e) => {
        e.preventDefault();
        $(e.target).find(".error").remove();

        let form = $("#clear-cookies-form").serializeArray();
        console.log(form);

        let domains = []
        let type = $("#clear-cookies-form [name='type']:checked").val();
        form.map((input) => {
            if(input.name == 'domain') {
                domains.push('https://' + input.value);
                domains.push('http://' + input.value);
            }
        })



        switch(type) {
            case 'All': 
                showConfirmation("#clear-cookies-form");
                if(isValidated) {
                    chrome.browsingData.remove({
                        "since": 0,
                    }, {
                        "cookies": true,
                    }, function() {
                        window.location.href = '../popup.html?message=Cookies cleared successfully';
                    });
                }
                break;
            case 'Domain':

                if($("#clear-cookies-form [name='domain']").val().length == 0) {
                    setError("#clear-cookies-form [name='domain']", "Please select the cookies to clear");
                    return false;
                }

                if($("#cookies-list .checkbox input:checked").length == 0) {
                    setError("#clear-cookies-form #cookies-list input-group:first", "Please select the cookies to clear");
                    return false;
                }

                showConfirmation("#clear-cookies-form");
                if(isValidated) {

                    if($("#cookies-list #select-all").length && $("#cookies-list #select-all").is(":checked")) {
                        chrome.browsingData.remove({
                            "since": 0,
                            originTypes: {
                                unprotectedWeb: true,
                                protectedWeb: true,
                                extension: true,
                            },
                            "origins": domains,
                        }, {
                            "cookies": true,
                        }, function() {
                            window.location.href = '../popup.html?message=Cookies cleared successfully';

                        });
                    } else {

                        $("#cookies-list .checkbox ~ .checkbox input:checked").each((i, elem) => {
                            let domain = $(elem).data("domain");
                            let path = $(elem).data("path");
                            let name = $(elem).val();
                            if(domain.charAt(0) == '.') {
                                domain = domain.slice(1);
                            }

                            console.log(domain, path, name);

                            chrome.cookies.remove({ url: `http://${domain}`, name: name });
                            chrome.cookies.remove({ url: `https://${domain}`, name: name });

                        })

                        window.location.href = '../popup.html?message=Cookies cleared successfully';

                    }
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