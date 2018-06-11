/* global $ */

$(window).ready(function() {

    $(".button").addClass("disabled");

    $("#username").on("change paste keyup", function() {
        
        $(".button").removeClass("disabled");
        
        var username = $(this).val();
        var regex = new RegExp("^[A-z ]{1,}$");
        var blacklist = new RegExp("^([ ]+)$");
        
        if (username.length <= 0 && username.length >= 20) {
            $(".button").addClass("disabled");  
            return;
        }
        
        if (blacklist.test(username)) {
            $(".button").addClass("disabled");  
            return;
        }
        if (regex.test(username) && !blacklist.test(username)) {
            $(".button").removeClass("disabled");
            return;
        }
        
        $(".button").addClass("disabled");
        
    });
    
})