(()  => {

    function loadDomains() {
        domainOptions = '';

        chrome.history.search({ text: ''}, function(historyItems) {
            // const domainSet = new Set();
            for (const item of historyItems) {
                const url = new URL(item.url);
                //   domainSet.add(url.hostname);
                if($("select[name='domain'] option[value='"+url.hostname+"']").length == 0) {
                    // console.log(document.querySelector("select[name='domain'] option[value='"+domain+"']"));
                    $("select[name='domain']").append(`<option value="${url.hostname}">${url.hostname}</option>`);
                }
            }
        });

    }

    loadDomains();




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

            });
        }
    })

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

    // Select all and unselect all logix]c
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

    // Submit Handler
    $("#clear-history-form").on('submit', (e) => {
        e.preventDefault();

        let form = $("#clear-history-form").serializeArray();
        console.log(form);

        let domains = []
        let type = $('[name="type"]:checked').val();;
        let from_date = $('[name="from_date"]').val();
        let to_date  = $('[name="to_date"]').val();
        // form.map((input) => {
        //     if(input.name == 'type') {
        //         type = input.value;
        //     }
        //     if(input.name == 'domain') {
        //         domains.push('https://' + input.value);
        //         domains.push('http://' + input.value);
        //     }
        // })

        // console.log(domains);




        switch(type) {
            case 'All': 
                chrome.browsingData.remove({
                    "since": 0,
                }, {
                    "history": true,
                }, function() {
                    alert('History cleared successfully!');
                });
                break;
            case 'Domain':

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

                alert('Browsing history has been cleared.');

                break;

            case 'Date':
                // let query = {
                //     startTime: new Date(from_date).getTime(),
                //     endTime: new Date(to_date).getTime()
                // }
                // chrome.history.deleteRange(query, function () {
                //     console.log('Browsing history for the specified time range has been cleared.');
                // });
                // alert('Browsing history for the specified time range has been cleared.');

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

                alert('Browsing history has been cleared.');

                break;
        }

    })

})();