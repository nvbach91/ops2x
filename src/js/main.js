
/*
 * 
 * 
 */

$(document).ready(function () {
    App.init();
    $.ajax({
        type: "POST",
        url: "/isAuthenticated"
    }).done(function (resp) {
        if (!resp.isAuthenticated) {
            App.renderSignin();
        } else {
            App.initDashBoard();
        }
    });
});
