(() => {
    // $(".select2").select2();

    $(".password-card").on("click", function (e) {
        e.preventDefault();
        chrome.tabs.create({url:'ulaa://password-manager/passwords'})

        return false;
    })
})();