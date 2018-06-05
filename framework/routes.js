var ExpressApp = require("./express_ext.js");
//var Models = require("./models")();
var sanitizer = require("sanitize")();

const GLOBAL_FUTUREDATE = new Date(new Date().getTime() + (1000*60*60*24*365*10));

/*
*   
*/
//ExpressApp.post("/reconfigure", function (req, res) {
//    
//    // See if the client has the cookie 'id'.
//    var userid = req.cookies.id;
//    
//    if (userid) {
//        res.redirect("/");
//        return;
//    }
//    
//    // If not, we assign the user the cookie provided in the post request body.
//    res.cookie("id", req.body._id, {expires: GLOBAL_FUTUREDATE});
//    res.render("bad.ejs");
//})

/*
*   User signup.
*/
ExpressApp.get("/signup", function(req, res) {
    
    // See if the client has the cookie 'id'.
    var userid = sanitizer.value(req.cookies.id, 'string');;
    
    if (userid) {
        res.redirect("/");
        return;
    }
    
    res.render("signup.ejs")
    
});

/*
*   
*/
ExpressApp.post("/signup", function(req, res) {
    
    // See if the client has the cookie 'id'.
    var userid = req.cookies.id;
    
    if (userid) {
        res.redirect("/");
        return;
    }
    
    // The function called if the user is successfully created.
    var callback_success = function (user) {
        Models.ModeratorLog.extensions.createLog("User Successfully Created: " + user.displayname);
        res.cookie("id", user._id, {expires: GLOBAL_FUTUREDATE});
        res.redirect("/");
    };

    // The function called if the user is UNsuccessfully created.    
    var callback_failure = function(username) {
        Models.ModeratorLog.extensions.createLog("User Not Created: " + username);
        res.redirect("/signup?msg=failed");
    }
    
    Models.User.statics.createUser(req.body.username, null, callback_success, callback_failure);

})

/*
*
*/
ExpressApp.post("/item/:item", function(req, res) {
    
    var userid = req.cookies.id;
    var itemid = req.params.item;
    var target_username = req.body.target;
    
    if (!userid || !target_username || !itemid) {
        res.redirect("/");
        return;
    }

    var callback_success = function(message, item, target) {
        Models.Log.model.create({log: message});
        res.render("item.ejs", {item: item, target: target});
        return;
    }

    var callback_failure = function(err) {
        
        console.log(err);
        res.redirect("/");
        
    }

    Models.User.statics.useItem(userid, itemid, target_username, callback_success, callback_failure);
    
});

ExpressApp.get("/switchuser/:user", function(req, res) {
    
    var user = req.params.user;
    
    var farFuture = new Date(new Date().getTime() + (1000*60*60*24*365*10)); // ~10y
    res.cookie("id", user, {expires: farFuture});
    
    res.redirect("/");
    
})

ExpressApp.get("/rewards", function(req, res) {
    
    var username = req.cookies.id;
    var reward = req.query.reward;
    
    console.log(username);
    
    if (!username) {
        res.redirect("/signup");
        return;
    }

    
    Models.Bag.model.findById(reward, function(err, bag) {
       
       
       if (err || !bag) { console.log(err); res.redirect("/"); return; }
       
       
        Models.Item.model.findById(bag.item, function(err, item) {
            
            if (err || !item) { console.log(err); res.redirect("/"); return; }
                
            Models.User.model.findById(username, function(err, user) {
                
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

ExpressApp.get("/desktop", function(req, res) {

    res.render("mobile.ejs");
    
});

ExpressApp.get("/createbag/:itemtype", function(req, res) {

    var username = req.cookies.id;
    var itemtype = req.params.itemtype;
    
    if (!itemtype) return;
    
    
    if (!username) {
        res.redirect("/signup");
        return;
    }
    
    Models.Item.model.create({itemtype: itemtype}, function(err, item) {
        
        if (err || !item) { console.log(err); return; }
        
        Models.Bag.model.create({item: item}, function(err, bag) {
            res.send("stinkpoints.com/rewards?reward=" + bag.id);
            return;
        })
        
        console.log("Item was created: " + itemtype + "!")
        
        
        
    })
    
});

ExpressApp.get("/", function(req, res) {

    var username = req.cookies.id;
    
    if (!username) {
        res.redirect("/signup");
        return;
    }
    
    res.render("mobile.ejs");
    
});

ExpressApp.get("*", function(req, res) {
    res.redirect("/");
});