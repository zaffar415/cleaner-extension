(() => {
    // $(".select2").select2();

    // Toast Message
    let urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('message')) {
        $("#toast-message span").html(urlParams.get('message'))
        $("#toast-message").fadeIn();

        setTimeout(() => {
            $("#toast-message").fadeOut();
        }, 2000)

    }

    $("#toast-message").on('click', '.icon-close', () => {
        $("#toast-message").remove(); 
    })


    $(".password-card").on("click", function (e) {
        e.preventDefault();
        chrome.tabs.create({url:'ulaa://password-manager/passwords'})

        return false;
    })
})();