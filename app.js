// sudo service mongodb start

var io = require('socket.io')(8080); // The port should be different of your HTTP server.
var fs = require('fs')
var app = require("./includes/express.js");
var User = require("./includes/user.js");
var Address = require("./includes/address.js")
var mongoose = require("mongoose");
var passport = require("passport");
var localstrategy = require("passport-local");

var ItemSchema = mongoose.Schema({
    itemtype: String
});
var Item = mongoose.model("Item", ItemSchema);




module.exports = User;

mongoose.connect("mongodb://localhost/stinkpoints", function(err) {
   
   if (err) throw err;
   console.log("Connected to DB.");
   
});

//User.create(new User({username: "matthulme", displayname: "Matt Hulme", points : 100}))

app.get("/signup", function(req, res) {
    
    var username = req.cookies.id;
    
    if (username) {
        res.redirect("/");
        return;
    }
    
    res.render("signup.ejs")
    
});

app.post("/reconfigure", function (req, res) {
    var farFuture = new Date(new Date().getTime() + (1000*60*60*24*365*10)); // ~10y
    res.cookie("id", req.body._id, {expires: farFuture});
    res.render("bad.ejs");
})

app.post("/signup", function(req, res) {
    
    var user = req.cookies.id;
    
    if (user) {
        res.redirect("/");
        return;
    }
    
    var farFuture = new Date(new Date().getTime() + (1000*60*60*24*365*10)); // ~10y

    var username = req.body.username;
    
    var user = new User({displayname: username, points: 0, items: []})
    User.create(user, function (err, user) {
        
        if (err) throw err;
        
        console.log("User Successfully Created: " + user.displayname);
        
        if (req.body.fingerprint && req.body.fingerprint.length > 0) {
            Address.create({address: req.body.fingerprint, user: user}, function (err, address) {});
        }
        
    });
    
    if (user) {
        res.cookie("id", user._id, {expires: farFuture});
        res.redirect("/");
    }
})

app.get("/rewards/*", function(req, res) {
    
    res.send("ass")
    //res.redirect("/")
    
});

app.get("/desktop", function(req, res) {

    var username = req.cookies.id;
    
    if (!username) {
        res.redirect("/signup");
        return;
    }

    res.render("index.ejs");
    
});

app.get("/giveitem", function(req, res) {

    var username = req.cookies.id;
    
    if (!username) {
        res.redirect("/signup");
        return;
    }
    
    User.findById(username, function(err, user) {
        
        if (user == null) {
            return;
        }
        
        Item.create({itemtype:"stinkbomb"}, function(err, item) {
            user.items.push(item);
            user.save();
            console.log(user);
        
            res.render("mobile.ejs");
        });
        
    })   
    
});

app.get("*", function(req, res) {

    var username = req.cookies.id;
    
    if (!username) {
        res.redirect("/signup");
        return;
    }
    
    res.render("mobile.ejs");
    
});




io.on('connection', function (socket) { // Notify for a new connection and pass the socket as parameter.

    var updateTimer = setInterval(function () { 
        
        if(io.sockets.sockets[socket.id] == undefined){
            clearInterval(updateTimer);
        }
        
        User.find(function(err, users) {
            socket.emit('update-users', users ); // Emit on the opened socket.
        });
    }, 100);

    socket.on('givestink', function(user) {  
        User.findByIdAndUpdate(user._id, {$inc : {points : 1}}, function(err, success) {
            
            if (err) throw err;
            
            if (success == null) {
                console.log("Could not find user!");
            }
            
        });
    });
    
    socket.on('validate', function(user) {
        
        if (user._id) {
            return;
        }
        
        Address.findOne({address:user.fingerprint}, function(err, address) {
            
            if (err) throw err;
            
            if (address) {
                socket.emit("reconfigure", address);
                console.log("address");
            }
            
        });
    });
    
    socket.on('disconnect', function(){
        clearInterval(updateTimer);
    });

});


app.listen(80, "172.31.31.104", function() {
    console.log("Basewars server running");
})


// Middleware

