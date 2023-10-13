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
        chrome.history.search({ text: ''}, function(historyItems) {
            for (const item of historyItems) {
                const url = new URL(item.url);
                if($("select[name='domain'] option[value='"+url.hostname+"']").length == 0) {
                    $("select[name='domain']").append(`<option value="${url.hostname}">${url.hostname}</option>`);
                }
            }
        });
    }
    loadDomains();

    // Toggle input boxed on selecting the type
    $("#clear-history-form [name='type']").on('change', (e) => {
        $("#select-domain, #select-date").hide();
        $("#history-list").hide();

        if(e.target.value == 'Domain') {
            $("#select-domain").show();
            $("#history-list").show();
            $("#select-domain .select2").select2();
        }

        if(e.target.value == 'Date') {
            $("#select-date").show();
        }

    })

    // Show History List
    $("#clear-history-form [name='domain']").on('change', async(e) => {
        $("#history-list").html(`<div class="input-group checkbox">
            <input type="checkbox" name="history" id="select-all" value="select-all">
            <label>Select All</label>
        </div>`).show()
        
        if($(e.target).val())  {
           
            $(e.target).val().forEach(async (domain) => {
                chrome.history.search({ text: domain }, (results) => {
                    if (results.length === 0) {
                        $("#history-list").html('<p class="no-data">No history found.</p>');
                    }  else {
                        let day = 0;
                        for (const result of results) {
                            console.log(result);
                            let date = new Date(result.lastVisitTime);
                            let html = '';
                            if(day != date.getDate()) {
                                day = date.getDate();
                                let formatedDate = date.toLocaleString('en-us',{month:'short', year:'numeric', day:'numeric'})
                               html = `<h2 class="date">${formatedDate}</h2><div class="input-group checkbox">
                                    <input type="checkbox" name="history" value="${result.url}">
                                    <label>${result.url}</label>
                                </div>`;    
                            } else {
                                html = `<div class="input-group checkbox">
                                    <input type="checkbox" name="history" value="${result.url}">
                                    <label>${result.url}</label>
                                </div>`;
                            }
                            
                            $("#history-list").append(html);
                        }
                    }

                });

            });
        }
    })

    // Show History List by date filter
    $("#clear-history-form [name='from_date'], #clear-history-form [name='to_date']").on('change', async(e) => {
        $("#history-list").html(`<div class="input-group checkbox">
            <input type="checkbox" name="history" id="select-all" value="select-all">
            <label>Select All</label>
        </div>`).show()


        let from_date = $('[name="from_date"]').val();
        let to_date  = $('[name="to_date"]').val();
        
        if(from_date && to_date)  {
           
            chrome.history.search({ 
                startTime: new Date(from_date).getTime(),
                endTime: new Date(to_date).getTime(), 
                text: '',
            }, (results) => {
                if (results.length === 0) {
                    $("#history-list").html('<p>No history found.</p>');
                }  else {
                    for (const result of results) {
                        console.log(result);
                        $("#history-list").append(`<div class="input-group checkbox">
                            <input type="checkbox" name="history" value="${result.url}">
                            <label>${result.url}</label>
                        </div>`);
                    }
                }

            });

        }
    })

    // Select all and unselect all logic
    $("#clear-history-form").on("change", "#history-list input", (e) => {
        if($(e.target).val() == "select-all") {
            if($(e.target).is(":checked")) {
                $(e.target).closest(".checkbox").nextAll('.checkbox').find('input').prop("checked", true)
            } else {
                $(e.target).closest(".checkbox").nextAll('.checkbox').find('input').prop("checked", false)
            }
        } else {
            console.log($("#history-list .checkbox ~ .checkbox input:checked").length, $("#history-list .checkbox ~ .checkbox input").length);
            if($("#history-list .checkbox ~ .checkbox input:checked").length == $("#history-list .checkbox ~ .checkbox input").length) {
                $("#history-list #select-all").prop("checked", true);
            } else {
                $("#history-list #select-all").prop("checked", false);
            }
        }
    })

    // Remove Errors in form change
    $("#clear-history-form").on('change',() => {
        $("#clear-history-form .error").remove();
    })

    // Submit Handler
    $("#clear-history-form").on('submit', (e) => {
        e.preventDefault();
        $(e.target).find(".error").remove();

        let type = $('[name="type"]:checked').val();;

        switch(type) {
            case 'All': 
                showConfirmation("#clear-history-form");
                if(isValidated) {
                    chrome.browsingData.remove({
                        "since": 0,
                    }, {
                        "history": true,
                    }, function() {
                        alert('History cleared successfully!');
                    });
                }
                break;
            case 'Domain':
                if($("#clear-history-form [name='domain']").val().length == 0) {
                    setError("#clear-history-form [name='domain']", "Please select the history to clear");
                    return false;
                }

                if($("#history-list .checkbox input:checked").length == 0) {
                    setError("#clear-history-form #history-list .input-group:first", "Please select the history to clear");
                    return false;
                }

                showConfirmation("#clear-history-form");
                if(isValidated) {

                    $("#history-list .checkbox ~ .checkbox input:checked").each((i, elem) => {
                        chrome.history.deleteUrl({ url: $(elem).val() }, () => {
                            if (chrome.runtime.lastError) {
                              console.error(`Error deleting URL`);
                            } else {
                              console.log(`Deleted URL`);
                            }
                        });
                    })

                    window.location.href = '../popup.html?message=History cleared successfully';

                }

                break;

            case 'Date':

                if($("#clear-history-form [name='from_date']").val().length == 0) {
                    setError("#clear-history-form [name='from_date']", "Please select the from date to clear");
                    return false;
                }
               
                if($("#clear-history-form [name='to_date']").val().length == 0) {
                    setError("#clear-history-form [name='to_date']", "Please select the to date to clear");
                    return false;
                }

                if($("#clear-history-form [name='from_date']").val() > $("#clear-history-form [name='to_date']").val()) {
                    setError("#clear-history-form [name='to_date']", "To Date should not be before front date");
                    return false;
                }

                if($("#history-list .checkbox input:checked").length == 0) {
                    setError("#clear-history-form #history-list .input-group:first", "Please select the history to clear");
                    return false;
                }

                showConfirmation("#clear-history-form");

                if(isValidated) {
                    $("#history-list .checkbox ~ .checkbox input:checked").each((i, elem) => {
                        console.log($(elem).val());
                        chrome.history.deleteUrl({ url: $(elem).val() }, () => {
                            if (chrome.runtime.lastError) {
                              console.error(`Error deleting URL`);
                            } else {
                              console.log(`Deleted URL`);
                            }
                        });
                    })

                    window.location.href = '../popup.html?message=History cleared successfully';

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