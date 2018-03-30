/* globals $ io 

*/

var socket = null;
var GLOBAL_users = {};
var GLOBAL_lastsort = null;

function UpdateUser(user) {

    var $player = $("#" + user._id);

    if ($player.length > 0) {
        
        if ($player.find(".resize").text() !== user.displayname) {
		    $player.find(".resize").text(user.displayname);
        }
        
        var points = $player.find(".value");
        
        console.log(points)
        
        if (points.text().toString() !== user.points.toString()) {
		    points.text(user.points);
        }
        return;
    }
    
    var template = $('script[data-template="playercard"]').text();
	var string = stringf(template, {id: user._id, pid: user._id, displayname: user.displayname, points: user.points});
    var $itemtemplate = $(string);
    
    $("#player-tablerow").append($itemtemplate);
    
    var button = $itemtemplate.find(".button");
    
    button.click(function() {
    	//var username = $(this).parent().parent().attr("id").replace("player-tablerow-", "");
    	socket.emit("givestink", user);
    	
    	
    });
    
    if (user.disabled) {
        button.addClass("disabled");
        button.text("This is You")
    }
    
    $("#" + user._id).find(".resize").fitText(1.0, { minFontSize: '20px', }); // { minFontSize: '1px', maxFontSize: '5px' });
    //$(".button").nodoubletapzoom();
}


$(document).ready(function() {
    console.log("Connect")
    
    if (getCookieValue("id") == null || getCookieValue("id").length < 0) {
        console.log("");
    }
    
    var localuser = decodeURIComponent(getCookieValue("id")).split('"')[1];
    
    if (!localuser) {
        localuser = getCookieValue("id");
    }
    
    var client = new ClientJS(); // Create A New Client Object
    var fingerprint = client.getFingerprint(); // Get Client's Fingerprint
    
    socket = io('http://stinkpoints.com:8080'); // Connect the socket on the port defined before.

    socket.emit("validate", {_id: localuser, fingerprint: fingerprint});

    socket.on('update-users', function (users) { // When a 'update-value' event is received, execute the following code.
    
        $.each( users, function( index, user ) {
            
            var user_cache = GLOBAL_users[user._id];
            
            if (!user_cache || user_cache.points != user.points || user_cache.displayname != user.displayname) {
                
                if (localuser === user._id) {
                    user.disabled = true;
                }
                
                GLOBAL_users[user._id] = user;
                UpdateUser(user);
                resort();
            }

        });
        
    });
    
    $('.menu>.item').on('click', function() {
    
    
        var $clicked = $(this);
    
        $(".tab").each(function() {
          
            $(this).removeClass('active');
            
            var targettab = $(this).attr("data-tab");
            var clicktab = $clicked.attr("data-tab");
            
            if (targettab == clicktab) {
                $(this).addClass('active');
            }
            
            
        })
        
       $('.ui .item').removeClass('active');
       $(this).addClass('active');
    }); 
    
    
    
    console.log($("iframe").find("img"))
    $("iframe").find("#qrimg").click();
    
    (function($) {
      var IS_IOS = /iphone|ipad/i.test(navigator.userAgent);
      $.fn.nodoubletapzoom = function() {
        if (IS_IOS)
          $(this).bind('touchstart', function preventZoom(e) {
            var t2 = e.timeStamp
              , t1 = $(this).data('lastTouch') || t2
              , dt = t2 - t1
              , fingers = e.originalEvent.touches.length;
            $(this).data('lastTouch', t2);
            if (!dt || dt > 500 || fingers > 1) return; // not double-tap
    
            e.preventDefault(); // double tap - prevent the zoom
            // also synthesize click events we just swallowed up
            $(this).trigger('click').trigger('click');
          });
      };
    })($);
        
});

function resort() {
    
    var sortable = [];
    for (var key in GLOBAL_users) {
        
        var user = GLOBAL_users[key];
        sortable.push([parseInt(user.points), user._id]);
    }
    
    sortable.sort(function(a, b) {
        return a[0] - b[0];
    });
    
    var unchanged = true;
    
    if ((GLOBAL_lastsort != null && GLOBAL_lastsort.length == sortable.length)) {
        for (var i = 0; i < GLOBAL_lastsort.length; i++) {
            
            if (GLOBAL_lastsort[i][1] != sortable[i][1]) {
                unchanged = false;
            }
            
        }
    }
    else {
        unchanged = false;
    }
    
    if (unchanged) {
        GLOBAL_lastsort = sortable;
        return;
    }
    
    for (var i = 0; i < sortable.length; i++) {
        
        var playercard = $("#" + sortable[i][1])
        
        playercard.css("opacity", "1.0");
        playercard.removeClass("disabled");
        
        if ((GLOBAL_lastsort != null && GLOBAL_lastsort.length == sortable.length)) {
            if (GLOBAL_lastsort && GLOBAL_lastsort[i][1] != sortable[i][1]) {
                
                playercard.animate({opacity:0.0}, 100, function() {
                    $(this).animate({opacity:1.0}, 100);
                });
                    
            }
        }
        
        $("#player-tablerow").prepend(playercard);
        
    }
    
    GLOBAL_lastsort = sortable;
    
}

function stringf(string, replace_set) {
    
    Object.keys(replace_set).forEach(function (key) {
        
        string = string.replace("${"+key+"}", replace_set[key])
        
    }); 
    
    return string;
}

function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}