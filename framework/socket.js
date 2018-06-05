//var Models = require("./models")();

var io = require('socket.io')(8080);

function GetLogs() {
    
    var greaterthan = new Date(Date.now());
    greaterthan.setMinutes(greaterthan.getMinutes() - 10);
    
    var socket = this;
    
    Models.Log.model.find({timestamp: {"$gte": greaterthan, "$lt": Date.now()}}).sort({timestamp: 'ascending'}).exec(function (err, logs) {
        socket.emit("getalllogs", logs);
    });
    
}

function UpdateUsers(socket, timer) { 
    
    if (io.sockets.sockets[socket.id] == undefined) {
        clearInterval(timer);
    }
    
    Models.User.model.find(function(err, users) {
        
        if (err) {
            Models.Log.model.create({log: "Could not socket.io, users to client: " + err});
        }
        
        if (users) {
            socket.emit('update-users', users );
        }
    });
    
}


io.on('connection', function (socket) {

    var updateTimer = setInterval(UpdateUsers.bind(null, socket, updateTimer), 100);
    
    
    socket.on('requestalllogs', GetLogs);

    
    socket.on("requestuser", function(userid) {
        
        if (userid) {
            
            Models.User.model.findById(userid, function(err, user) {
                
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
        

        
        Models.User.model.findById(source._id, function(err, user) {
           
            if (err) {
                console.log("Could not find source user!")
            }
            
            if (user) {
                if (user.ammo >= damage) {
                    user.update({ammo: user.ammo - damage}, function(err, success) {
                        if (success) {
                            Models.User.model.findByIdAndUpdate(info.target._id, {$inc : {points : damage}}, function(err, success) {
                                
                                if (err) console.log(err);
                                
                                if (success == null) {
                                    console.log("Could not find target user!");
                                    return;
                                }
                                
                            Models.Log.model.create({log: source.displayname + " just gave " + target.displayname + " " + damage + " Stink Point(s)!", source: source, target: target}, function (err, log) {
            
                                    
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
        
        Models.User.model.findById(localuser._id, function(err , user) {
            
            if (user && user.items) {
                                
                Models.Item.model.find({
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
        
        Models.Address.model.findOne({address:user.fingerprint}, function(err, address) {
            
            if (err) {
                Models.ModeratorLog.model.create({log: "There was an error validating a user's footprint: " + address});
            };
            
            if (address) {
                
                //socket.emit("reconfigure", address);
                
                Models.User.model.findById(address.user, function (err, user) {
                    
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

exports = module.exports = {
    
    io
    
}