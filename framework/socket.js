//var Models = require("./models")();

var io = require('socket.io')(8080);
var [User, Item, Bag, Log] = require("./objects")("user", "item", "bag", "log");

function GetLogs() {
    
    var greaterthan = new Date(Date.now());
    greaterthan.setMinutes(greaterthan.getMinutes() - 10);
    
    var socket = this;
    
    Log.model.find({admin : false, timestamp: {"$gte": greaterthan, "$lt": Date.now()}}).sort({timestamp: 'ascending'}).exec(function (err, logs) {
        
        if (err) {
            return Log.statics.createAdminLog("Could not find logs." + err);
        }
        
        socket.emit("getalllogs", logs);
    });
    
}

function UpdateUsers(socket, timer) { 
    
    if (io.sockets.sockets[socket.id] == undefined) {
        clearInterval(timer);
    }
    
    User.model.find(function(err, users) {
        
        if (err) {
            Log.model.statics.createAdminLog("Could not socket.io, users to client: " + err);
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
            
            User.model.findById(userid, function(err, foundUser) {
                
                if (err || !foundUser) return;
                
                socket.emit("getuser", foundUser);
            });
        }
        
    });
    
    socket.on('givestink', function(info) {
        
        if (!info || !info.source || !info.target || !info.damage) {
            return;
        }
        
        var source = info.source;
        var target = info.target;
        var damage = info.damage;

        var callbackSuccess = (log) => {
            
            var clients = io.sockets.connected;
                
            if (!clients) {
                return;
            }
            
            for (var key in clients) {
                clients[key].emit("getalllogs", {log});
            }
        }

        //User.statics.giveStink({_id: "5"}, target, damage);
        User.statics.giveDamage(source, target, damage, callbackSuccess);
        
        
        

    });
    
    socket.on("request-items", function(localuser) {
        
        if (!localuser) return;
        
        User.model.findById(localuser._id, function(err , user) {
            
            if (user && user.items) {
                                
                Item.model.find({
                    '_id': { $in: user.items}
                }, function(err, items){
                     if (items) {
                         
                         socket.emit("get-items", items)
                         
                     }
                });
                
            }
            
        })
        
        
    })
    
    socket.on('disconnect', function(){
        clearInterval(updateTimer);
    });

});

exports = module.exports = {
    io
}