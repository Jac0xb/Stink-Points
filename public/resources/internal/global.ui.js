/*global $ */

var menu = {};

menu.Buy = function() {
    // Callback to the Garry's Mod lua function watching for this function.
}
menu.Refresh = function() {
    // Callback to the Garry's Mod lua function watching for this function.
}
menu.Close = function() {
    // Callback to the Garry's Mod lua function watching for this function.
}
menu.Loaded = function() {
    // Callback to the Garry's Mod lua function watching for this function.
}

$(document).ready(function() {
    
    $("#menuclose").click(function () {
        menu.Close();
    });

    menu.Loaded();
    
})

function stringf(string, replace_set) {
    
    Object.keys(replace_set).forEach(function (key) {
        
        string = string.replace("${"+key+"}", replace_set[key])
        
    }); 
    
    return string;
}