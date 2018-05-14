/* globals $ io 

*/
var socket = null;
var GLOBAL_users = {};
var GLOBAL_lastsort = null;
var localuser = null;

/*
*   Update Log.
*/
function CreateItem(item) {

    console.log(item)

    var $item = $("#" + item._id);

    if ($item.length > 0) {
        return;
    }
    
    var template = $('script[data-template="itemrow"]').text();
    
	var string = stringf(template, {id: item._id});
    var $itemtemplate = $(string);
    
    $itemtemplate.find(".itemtype").text(item.itemtype)
    
    for (var key in GLOBAL_users) {
        
        if (!GLOBAL_users[key] || !GLOBAL_users[key]._id || !GLOBAL_users[key].displayname) {
            continue;
        }
        
        $itemtemplate.find(".selector").append(" <option value="+ GLOBAL_users[key]._id + ">" + GLOBAL_users[key].displayname + "</option>")

    }
    
    $itemtemplate.find(".selector").on('change', function() {
        if(this.value && this.value.length > 0) {
            $itemtemplate.find(".button").removeClass("disabled");
        }
        else {
            $itemtemplate.find(".button").addClass("disabled");
        }
    });
    
    $itemtemplate.find(".button").click(function() {
        
        var selector = $itemtemplate.find(".selector");
        
        if (selector.val() && selector.val().length > 0) {
            
            
            var form = $('<form action="/useitem/' + item._id + '" method="post">' +
            '<input type="text" name="target" value="' + selector.val() + '" />' +
            '</form>');
            $('body').append(form);
            form.submit();

        }
        
    });
    
    $("#item-tablerow").prepend($itemtemplate);
    
}

function UpdateLog(log) {

    var $log = $("#" + log._id);

    if ($log.length > 0) {
        return;
    }
    
    var template = $('script[data-template="log"]').text();
    
	var string = stringf(template, {id: log._id});
    var $logtemplate = $(string);
    
    $logtemplate.find(".log").text(log.log);
    
    if (log.timestamp) {
        var date =  new Date(log.timestamp)
        var minute = date.getMinutes();
        
        if (minute < 10) {
            minute = "0" + minute;
        }
        
        if ((date.getHours() >= 12))
            $logtemplate.find(".timestamp").text(date.getHours() - 12 + ":" + minute + "PM");
        else 
            $logtemplate.find(".timestamp").text(date.getHours() + ":" + minute + "AM");
    }
    
    
    $("#logs-tablerow").prepend($logtemplate);
    
}

/*
*   Update User Scoreboard card.
*/
function UpdateUser(user) {

    var $player = $("#" + user._id);

    if ($player.length > 0) {
        
        var button = $player.find(".button");
        button.removeClass("disabled");
        
        if (user.disabled) {
            button.addClass("disabled");
            button.text("This is You")
        }
        
        var displayname = $player.find(".resize");
        
        if (displayname.text() !== user.displayname) {
		    displayname.text(user.displayname);
        }
        
        var points = $player.find(".value");
    
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
    
        console.log(localuser)
    
    button.click(function() {
        
        if (localuser == null) {
            console.log("Local User was null!")
        }
        
    	//var username = $(this).parent().parent().attr("id").replace("player-tablerow-", "");
    	socket.emit("givestink", {target:user, source:localuser, damage: 1});
    	
    	setTimeout(function() {
    	   
    	   if (localuser && localuser.ammo <= 0) {
    	       $(".playercard").find(".button").addClass("disabled");
    	   }
    	    
    	});
    	
    });
    
    if (user.disabled) {
        button.addClass("disabled");
        button.text("This is You")
    }
    
    
    if (user._id === "5abeeb70c3e7272fa47e7182") {

        $itemtemplate.find(".resize").html("<i class='icon birthday cake'></i>" + $itemtemplate.find(".resize").html())
        console.log($itemtemplate.find(".resize").html())
    }
    $("#" + user._id).find(".resize").fitText(1.0, { minFontSize: '20px', }); // { minFontSize: '1px', maxFontSize: '5px' });
    //$(".button").nodoubletapzoom();
}


$(document).ready(function() {
    
    if (window.location.hostname.includes("/desktop")) {
        ("#ammodisplay").text("Go to StinkPoints.com to Signup or LEAVE")
    }
    
    $("#logstoggle").click(function() {
        
        var $logs = $("#logs");
        
        if ($logs.css("display") !== "none" || $logs.css("display") == null)
            $logs.css("display", "none");
        else
            $logs.css("display", "");       
    })
    
    
    if (getCookieValue("id") == null || getCookieValue("id").length < 0) {
    }
    
    var userid = decodeURIComponent(getCookieValue("id")).split('"')[1];
    
    if (!userid) {
        userid = getCookieValue("id");
    }
    
    var client = new ClientJS(); // Create A New Client Object
    var fingerprint = client.getFingerprint(); // Get Client's Fingerprint
    
    socket = io('http://stinkpoints.com:8080'); // Connect the socket on the port defined before.
    
    socket.emit("requestalllogs");
    
    socket.on("getalllogs", function (logs) {
        for (var i in logs) {
            UpdateLog(logs[i]);
        }
    })
    
    socket.emit("validate", {_id: userid, fingerprint: fingerprint});
    
    socket.emit("requestuser", userid);
    
    socket.on("getuser", function (user) {
        
        localuser = user;
        socket.emit('request-items', localuser);
        
    });
    
    socket.on("get-items", function(items) {
        
        $(".stinkitem").remove();
        
        console.log(items)
        
        if (items) {
            for (var key in items) {
                CreateItem(items[key]);

            }
        }
        
    });
    
    socket.on('update-users', function (users) { // When a 'update-value' event is received, execute the following code.
    
        $.each( users, function( index, user ) {
            
            var user_cache = GLOBAL_users[user._id];
            
            if (!user_cache || user_cache.ammo != user.ammo || user_cache.points != user.points || user_cache.displayname != user.displayname) {
                
                if (userid === user._id) {
                    
                    $("#ammodisplay").text("You have " + user.ammo + " Stink Points to Give")
                    user.disabled = true;
                    localuser = user;
                    if (localuser && localuser.ammo > 0) {
                	    $(".playercard").find(".button").removeClass("disabled");
                	}
                }
            	if (user.disabled && !user.disabled && user_cache.disabled) {
            	    $("#" + user._id).find("button").removeClass("disabled");
            	}
            	if (user.disabled) {
            	    $("#" + user._id).find("button").addClass("disabled");
            	}
                if (localuser && localuser.ammo <= 0) {
            	    $(".playercard").find(".button").addClass("disabled");
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

function deepEqual(obj1, obj2) {

    //compare primitives
    if(isPrimitive(obj1) && isPrimitive(obj2))
        return obj1 == obj2;

    if(Object.keys(obj1).length !== Object.keys(obj2).length)
        return false;

    //compare objects with same number of keys
    for(let key in obj1)
    {
        if(!(key in obj2)) return false; //other object doesn't have this prop
        if(!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}

//check if value is primitive
function isPrimitive(obj)
{
    return (obj !== Object(obj));
}