(()  => {

    function loadDomains() {
        domainOptions = '';
        chrome.cookies.getAll({}, function (cookies) {
            for (let i = 0; i < cookies.length; i++) {
                let domainArray = cookies[i].domain.split('.')
                let domain = ''
                for(let i = 0; i< domainArray.length ; i++) {
                    if(domainArray[i]) {
                        domain += domainArray[i];
                        if(domainArray[i+1]) {
                            domain += '.'
                        }
                    }
                } 

                if($("select[name='domain'] option[value='"+domain+"']").length == 0) {
                    // console.log(document.querySelector("select[name='domain'] option[value='"+domain+"']"));
                    $("select[name='domain']").append(`<option value="${domain}">${domain}</option>`);
                }
            }
        });
        
        
    }

    loadDomains();

    $("#clear-cookies-form").on('submit', (e) => {
        e.preventDefault();

        let form = $("#clear-cookies-form").serializeArray();
        console.log(form);

        let domains = []
        let type = '';
        form.map((input) => {
            if(input.name == 'type') {
                type = input.value;
            }
            if(input.name == 'domain') {
                domains.push('https://' + input.value);
                domains.push('http://' + input.value);
            }
        })



        switch(type) {
            case 'All': 
                chrome.browsingData.remove({
                    "since": 0,
                }, {
                    "cookies": true,
                }, function() {
                    alert('Cache cleared successfully!');
                });
                break;
            case 'Domain':
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
                    alert('Cache cleared successfully!');
                });
                break;
        }

        // chrome.browsingData.remove({
        //     "since": 0
        // }, {
        //     "appcache": true,
        //     "cache": true,
        //     "cookies": true,
        //     "downloads": true,
        //     "fileSystems": true,
        //     "formData": true,
        //     "history": true,
        //     "indexedDB": true,
        //     "localStorage": true,
        //     "pluginData": true,
        //     "passwords": true,
        //     "webSQL": true
        // }, function() {
        //     alert('Cache cleared successfully!');
        // });

        $("#clear-cookies-form").trigger("reset");
        loadDomains();

    })


    $("#clear-cookies-form [name='type']").on('change', (e) => {
        $("#select-domain").hide();

        if(e.target.value == 'Domain') {
            $("#select-domain").show();
            $("#select-domain .select2").select2();
        } 
    })
})();