
/*
 * 
 * 
 */
$(document).ready(function () {
    $("#login").click(function () {
        $.ajax({
            type: "POST",
            url: "/auth",
            data: {username: "guest", password: "tseug"},
            success: function () {
                App.initializeWebRegister();
            },
            error: function (err) {
                alert("Login error code: " + err.statusText);
            }
        });
    });

});
