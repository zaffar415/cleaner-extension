(() => {

    let domains =  [];
    let inputDomain = '';

    $("#clear-all-form").on("submit", (e) => {
        e.preventDefault();
        
        inputDomain = $("#clear-all-form [name='domain']").val().replaceAll(['https://', 'https://'], '');

        $(".confirmation-page p").text("This operation will wipe out all the data in the browser");

        if(inputDomain) {
            domains = [
                'https://' + inputDomain,
                'http://' + inputDomain
            ];

            $(".confirmation-page p").text("This operation will wipe out all the data in the " + inputDomain);

        }

        $(e.target).hide();
        $(".confirmation-page").show();


    })


    $("#clear-all").on("click", (e) => {
        e.preventDefault();

        let clearData = {
            "cache": true,
            "cookies": true,
            "localStorage": true,
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
        //     // "passwords": true,
        //     // "webSQL": true
        // }

        chrome.browsingData.remove(options, clearData, function() {
            alert('Data cleared successfully!');
        });

    })
})();