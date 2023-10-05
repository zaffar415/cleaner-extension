(()  => {

    // function loadDomains() {
    //     domainOptions = '';
    //     chrome.storage.getAll({}, function (storage) {
    //         for (let i = 0; i < storage.length; i++) {
    //             let domainArray = storage[i].domain.split('.')
    //             let domain = ''
    //             for(let i = 0; i< domainArray.length ; i++) {
    //                 if(domainArray[i]) {
    //                     domain += domainArray[i];
    //                     if(domainArray[i+1]) {
    //                         domain += '.'
    //                     }
    //                 }
    //             } 

    //             if($("select[name='domain'] option[value='"+domain+"']").length == 0) {
    //                 // console.log(document.querySelector("select[name='domain'] option[value='"+domain+"']"));
    //                 $("select[name='domain']").append(`<option value="${domain}">${domain}</option>`);
    //             }
    //         }
    //     });
        
        
    // }

    // loadDomains();

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
                // TODO
                break;
        }

        $("#clear-storage-form").trigger("reset");

    })


    // $("#clear-storage-form [name='type']").on('change', (e) => {
    //     $("#select-domain").hide();

    //     if(e.target.value == 'Domain') {
    //         $("#select-domain").show();
    //         $("#select-domain .select2").select2();
    //     } 
    // })
})();