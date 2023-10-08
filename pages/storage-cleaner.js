(()  => {

    $("#clear-storage-form").on('submit', (e) => {
        e.preventDefault();

        let form = $("#clear-storage-form").serializeArray();
        console.log(form);

        let domains = []
        let type = '';
        form.map((input) => {
            if(input.name == 'type') {
                type = input.value;
            }
            // if(input.name == 'domain') {
            //     domains.push('https://' + input.value);
            //     domains.push('http://' + input.value);
            // }
        })



        switch(type) {
            case 'All': 
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
                    alert('Cache cleared successfully!');
                });
                break;
            case 'Domain':
                inputDomain = $("#clear-storage-form [name='domain']").val().replaceAll(['https://', 'https://'], '');
                inputDomain = inputDomain.match(/[a-z0-9]+\.[a-z]+/)


                if(inputDomain) {
                    domains = [
                        'https://' + inputDomain,
                        'http://' + inputDomain
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
                        alert('Data cleared successfully!');
                    });
        
                }

                break;
        }

        $("#clear-storage-form").trigger("reset");

    })


    $("#clear-storage-form [name='type']").on('change', (e) => {
        $("#select-domain").hide();

        if(e.target.value == 'Domain') {
            $("#select-domain").show();
        } 
    })
})();