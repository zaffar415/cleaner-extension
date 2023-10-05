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



    $("#clear-history-form").on('submit', (e) => {
        e.preventDefault();

        let form = $("#clear-history-form").serializeArray();
        console.log(form);

        let domains = []
        let type;
        let from_date = $('[name="from_date"]').val();
        let to_date  = $('[name="to_date"]').val();
        form.map((input) => {
            if(input.name == 'type') {
                type = input.value;
            }
            if(input.name == 'domain') {
                domains.push('https://' + input.value);
                domains.push('http://' + input.value);
            }
        })

        console.log(domains);




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
                domains.forEach((domain) => {
                    chrome.history.search({ text: domain }, (results) => {
                        for (const result of results) {
                          chrome.history.deleteUrl({ url: result.url }, () => {
                            if (chrome.runtime.lastError) {
                              console.error(`Error deleting URL: ${result.url}`);
                            } else {
                              console.log(`Deleted URL: ${result.url}`);
                            }
                          });
                        }
                    });
                })
                alert('Browsing history for the specified domain has been cleared.');

                break;

            case 'Date':
                let query = {
                    startTime: new Date(from_date).getTime(),
                    endTime: new Date(to_date).getTime()
                }
                chrome.history.deleteRange(query, function () {
                    console.log('Browsing history for the specified time range has been cleared.');
                });
                alert('Browsing history for the specified time range has been cleared.');
                break;
        }

    })


    $("#clear-history-form [name='type']").on('change', (e) => {
        $("#select-domain, #select-date").hide();

        if(e.target.value == 'Domain') {
            $("#select-domain").show();
            $("#select-domain .select2").select2();
        }

        if(e.target.value == 'Date') {
            $("#select-date").show();
        }

    })
})();