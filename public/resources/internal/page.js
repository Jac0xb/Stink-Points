/* globals $ io 

*/

function UpdatePlayer(playerid, displayname, points) {

    var $player = $("#player-tablerow-" + playerid);

    if ($player.length > 0) {
        $player.text(displayname);
        return;
    }

    var $itemtemplate = $(stringf($('script[data-template="player"]').text(), {playerid: playerid, displayname: displayname, points: points}));
    
    $("#player-tablerow").append($itemtemplate);
    $(".buybutton").unbind('mouseenter').unbind('mouseleave');
    
}


$(document).ready(function() {
    console.log("Connect")
    
    var socket = io('http://stinkpoints.com:8080'); // Connect the socket on the port defined before.

    socket.on('update-players', function (players) { // When a 'update-value' event is received, execute the following code.
    
        $.each( players, function( index, player ) {
            UpdatePlayer(player.playerid, player.displayname, player.points);
        });
        
    });
});

function stringf(string, replace_set) {
    
    Object.keys(replace_set).forEach(function (key) {
        
        string = string.replace("${"+key+"}", replace_set[key])
        
    }); 
    
    return string;
}