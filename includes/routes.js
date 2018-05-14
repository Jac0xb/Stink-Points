var app = require("./express.js");

var User = require('./models/user.js')
var Address = require("./models/address.js")
var Item = require("./models/item.js");
var Bag = require("./models/bag.js")
var ModeratorLog = require("./models/adminlogs.js")
var Log = require("./models/logs.js")


const GLOBAL_FUTUREDATE = new Date(new Date().getTime() + (1000*60*60*24*365*10));

/*
*   
*/
app.post("/reconfigure", function (req, res) {
    
    // See if the client has the cookie 'id'.
    var userid = req.cookies.id;
    
    if (userid) {
        res.redirect("/");
        return;
    }
    
    // If not, we assign the user the cookie provided in the post request body.
    res.cookie("id", req.body._id, {expires: GLOBAL_FUTUREDATE});
    res.render("bad.ejs");
})

/*
*   User signup.
*/
app.get("/signup", function(req, res) {
    
    // See if the client has the cookie 'id'.
    var userid = req.cookies.id;
    
    if (userid) {
        res.redirect("/");
        return;
    }
    
    res.render("signup.ejs")
    
});

/*
*   
*/
app.post("/signup", function(req, res) {
    
    // See if the client has the cookie 'id'.
    var userid = req.cookies.id;
    
    if (userid) {
        res.redirect("/");
        return;
    }
    
    // The function called if the user is successfully created.
    var callback_success = function (user) {
        ModeratorLog.create({log: "User Successfully Created: " + user.displayname, target: user});
        res.cookie("id", user._id, {expires: GLOBAL_FUTUREDATE});
        res.redirect("/");
    };

    // The function called if the user is UNsuccessfully created.    
    var callback_failure = function(username) {
        ModeratorLog.create({log: "User failed to be created, " + username});
        res.redirect("/signup?msg=failed");
    }

    User.Model_CreateUser(req.body.username, null, callback_success, callback_failure);

})

/*
*
*/
app.post("/item/:item", function(req, res) {
    
    var userid = req.cookies.id;
    var itemid = req.params.item;
    var target_username = req.body.target;
    
    if (!userid || !target_username || !itemid) {
        res.redirect("/");
        return;
    }

    var callback_success = function(message, item, target) {
        Log.create({log: message});
        res.render("item.ejs", {item: item, target: target});
        return;
    }

    var callback_failure = function(err) {
        
        console.log(err); 
        res.redirect("/");
        
    }

    User.Model_UseItem(userid, itemid, target_username);
    
});

app.get("/switchuser/:user", function(req, res) {
    
    var user = req.params.user;
    
    var farFuture = new Date(new Date().getTime() + (1000*60*60*24*365*10)); // ~10y
    res.cookie("id", user, {expires: farFuture});
    
    res.redirect("/");
    
})

app.get("/rewards", function(req, res) {
    
    var username = req.cookies.id;
    var reward = req.query.reward;
    
    console.log(username);
    
    if (!username) {
        res.redirect("/signup");
        return;
    }

    
    Bag.findById(reward, function(err, bag) {
       
       
       if (err || !bag) { console.log(err); res.redirect("/"); return; }
       
       
        Item.findById(bag.item, function(err, item) {
            
            if (err || !item) { console.log(err); res.redirect("/"); return; }
                
            User.findById(username, function(err, user) {
                
                if (err || !user) { console.log(err); res.redirect("/"); return; }
                
                user.items.push(item);
                user.save();
                
                bag.remove(function() {
                    res.render("reward.ejs", {item : item});            
                });
            });
       
        });
    });
    
});

app.get("/desktop", function(req, res) {

    res.render("mobile.ejs");
    
});

app.get("/createbag/:itemtype", function(req, res) {

    var username = req.cookies.id;
    var itemtype = req.params.itemtype;
    
    if (!itemtype) return;
    
    
    if (!username) {
        res.redirect("/signup");
        return;
    }
    
    Item.create({itemtype: itemtype}, function(err, item) {
        
        if (err || !item) { console.log(err); return; }
        
        Bag.create({item: item}, function(err, bag) {
            res.send("stinkpoints.com/rewards?reward=" + bag.id);
            return;
        })
        
        console.log("Item was created: " + itemtype + "!")
        
        
        
    })
    
});

app.get("/", function(req, res) {

    var username = req.cookies.id;
    
    if (!username) {
        res.redirect("/signup");
        return;
    }
    
    res.render("mobile.ejs");
    
});

app.get("*", function(req, res) {
    res.redirect("/");
});