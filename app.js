// sudo service mongodb start

var io = require('socket.io')(8080);
var fs = require('fs')
var app = require("./includes/express.js");
var User = require("./includes/models/user.js");
var Address = require("./includes/models/address.js")
var Item = require("./includes/models/item.js");
var Bag = require("./includes/models/bag.js")
var ModeratorLog = require("./includes/models/adminlogs.js")
var Log = require("./includes/models/logs.js")
var mongoose = require("mongoose");
var passport = require("passport");
var localstrategy = require("passport-local");

var routes = require("./includes/routes.js");


mongoose.connect("mongodb://localhost/stinkpoints_v2", function(err) {
   if (err) console.log(err);
   console.log("Connected to DB.");
});

io.on('connection', function (socket) {

    var updateTimer = setInterval(function () { 
        
        if(io.sockets.sockets[socket.id] == undefined){
            clearInterval(updateTimer);
        }
        
        User.find(function(err, users) {
            
            if (err) {
                ModeratorLog.create({log: "Could not socket.io, users to client: " + err});
            }
            
            if (users) {
                socket.emit('update-users', users );
            }
        });
        
    }, 100);
    
    
    socket.on('requestalllogs', function() {
        var greaterthan = new Date(Date.now());
        greaterthan.setMinutes(greaterthan.getMinutes() - 10);
        Log.find({timestamp: {"$gte": greaterthan, "$lt": Date.now()}}).sort({timestamp: 'ascending'}).exec(function (err, logs) {
            
            socket.emit("getalllogs", logs);
            
        })
    });

    
    socket.on("requestuser", function(userid) {
        
        if (userid) {
            
            User.findById(userid, function(err, user) {
                
                if (err || !user) return;
                
                socket.emit("getuser", user);
            });
        }
        
    });
    
    socket.on('givestink', function(info) {
        
        var source = info.source;
        var target = info.target;
        var damage = info.damage;
        
        if (!source || !target || !damage) {
            return;
        }
        

        
        User.findById(source._id, function(err, user) {
           
            if (err) {
                console.log("Could not find source user!")
            }
            
            if (user) {
                if (user.ammo >= damage) {
                    user.update({ammo: user.ammo - damage}, function(err, success) {
                        if (success) {
                            User.findByIdAndUpdate(info.target._id, {$inc : {points : damage}}, function(err, success) {
                                
                                if (err) console.log(err);
                                
                                if (success == null) {
                                    console.log("Could not find target user!");
                                    return;
                                }
                                
                            Log.create({log: source.displayname + " just gave " + target.displayname + " " + damage + " Stink Point(s)!", source: source, target: target}, function (err, log) {
            
                                    
                                    if (err || !log) return;
                                    
                                    var clients = io.sockets.connected;
                                    
                                    if (!clients) {
                                        return;
                                    }
                                    
                                    for (var key in clients) {
                                        clients[key].emit("getalllogs", {log});
                                    }
                                });
                                                        
                            });
                        }
                    })
                }
            }
            
        });
        

    });
    
    socket.on("request-items", function(localuser) {
        
        if (!localuser) return;
        
        User.findById(localuser._id, function(err , user) {
            
            if (user && user.items) {
                                
                Item.find({
                    '_id': { $in: user.items}
                }, function(err, items){
                     if (items) {
                         
                         socket.emit("get-items", items)
                         
                     }
                });
                
            }
            
        })
        
        
    })
    
    socket.on('validate', function(user) {
        
        if (!user || user._id) {
            return;
        }
        
        return;
        
        console.log(user)
        
        Address.findOne({address:user.fingerprint}, function(err, address) {
            
            if (err) {
                ModeratorLog.create({log: "There was an error validating a user's footprint: " + address});
            };
            
            if (address) {
                
                //socket.emit("reconfigure", address);
                
                User.findById(address.user, function (err, user) {
                    
                    if (user) {
                        //ModeratorLog.create({log: "USER IS TRYING TO CHANGE IDENTITY: " + user.displayname, target: user});
                        //Log.create({log: "USER TRIED TO CHANGE IDENTITY: " + user.displayname, target: user});
                    }
                        
                })
            }
        });
    });
    
    socket.on('disconnect', function(){
        clearInterval(updateTimer);
    });

});

app.listen(80, "172.31.18.67", function() {
    console.log("Stink point server running");
    
    var futuredate = new Date(Date.now());
    futuredate.setTime(futuredate.getTime() + (1 * 60 * 1000));
    setInterval(function() {
        
        var date = new Date(Date.now())

        
        if (futuredate.getTime() < date.getTime()) {
            
            futuredate.setTime(futuredate.getTime() + (1 * 60 * 1000));
            
            Log.create({log: "Stink Point rations have been dispersed to all."}, function (err, log) {
                
                if (err || !log) return;
                
                var clients = io.sockets.connected;
                
                if (!clients) {
                    return;
                }
    
                for (var key in clients) {
                    clients[key].emit("getalllogs", {log});
                }
            });
            User.update({}, {$inc : {ammo : 1}}, {multi: true}, function(err, success) {
                
                console.log("Shit has been dispensed" + success );
                
            });
        }
        
    }, 1000)
})


// Middleware

