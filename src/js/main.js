
/*
 * 
 * 
 */
$(document).ready(function () {
    $.ajax({
        type: "POST",
        url: "/isAuthenticated"
    }).done(function (data) {
        if (!data.isAuthenticated) {
            App.renderLogin();
        } else {
            App.initWebRegister();
        }
    });
});
