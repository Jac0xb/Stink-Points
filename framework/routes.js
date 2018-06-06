var expressApp = require("./express_ext.js");
var [User, Item, Bag, Log] = require("./objects")(["user", "item", "bag", "log"]);
var sanitizer = require("sanitize")();

var Common = { 
    infiniteExpire : () => { return new Date(new Date().getTime() + (1000*60*60*24*365*10)) }
}

/*
*   GET: Main->signup
*/
expressApp.get("/signup", function(req, res) {
    
    // See if the client has the cookie 'id'.
    var userid = sanitizer.value(req.cookies.id, String);
    
    if (userid) {
        res.redirect("/");
        return;
    }
    
    res.render("signup.ejs")
    
});

/*
*   POST: Main->signup
*/
expressApp.post("/signup", function(req, res) {
    
    // See if the client has the cookie 'id'.
    var userid = sanitizer.value(req.cookies.id, String);
    
    if (userid) {
        res.redirect("/");
        return;
    }
    
    // The function called if the user is successfully created.
    var callbackSuccess = function (userObject) {
        Log.statics.createAdminLog("User Successfully Created: " + userObject.username);
        res.cookie("id", userObject._id, {expires: Common.infiniteExpire()});
        res.redirect("/");
    };

    // The function called if the user is UNsuccessfully created.    
    var callbackFailure = function(username) {
        Log.statics.createAdminLog("User Not Created: " + username);
        res.redirect("/signup?msg=failed");
    }
    
    User.statics.createUser(req.body.username, callbackSuccess, callbackFailure);

})

/*
*
*/
expressApp.post("/item/:item", function(req, res) {
    
    var userID = sanitizer.value(req.cookies.id, String);
    var itemID = sanitizer.value(req.params.item, String);
    var targetID = sanitizer.value(req.body.target, String);
    
    if (!userID || !targetID || !itemID) {
        res.redirect("/");
        return;
    }

    var callbackSuccess = function(message, item, target) {
        Log.statics.createLog(message);
        res.render("item.ejs", {item: item, target: target});
        return;
    }

    var callbackFailure = function(err) {
        Log.statics.createAdminLog(err);
        res.redirect("/");
    }
    
    console.log(`${userID} | ${targetID}`)
    
    User.statics.useItem(userID, targetID, itemID, callbackSuccess, callbackFailure);
    
});

expressApp.get("/switchuser/:user", function(req, res) {
    
    var username = sanitizer.value(req.params.user, String);
    
    res.cookie("id", username, {expires: Common.infiniteExpire()});
    res.redirect("/");
    
})

expressApp.get("/rewards", function(req, res) {
    
    var userid = sanitizer.value(req.cookies.id, String);
    var reward = sanitizer.value(req.query.reward, String);
    
    if (!userid) {
        res.redirect("/signup");
        return;
    }

    Bag.model.findById(reward, function(err, bag) {
       
        if (err || !bag) { 
           res.redirect("/");
           return console.log(err);
        }
       
        Item.model.findById(bag.item, function(err, item) {
            
            if (err || !item) { 
                res.redirect("/"); 
                return console.log(err); 
            }
                
            User.model.findById(userid, function(err, user) {
                
                if (err || !user) { 
                    res.redirect("/"); 
                    return console.log(err);
                }
                
                user.items.push(item);
                user.save();
                
                bag.remove(function() {
                    res.render("reward.ejs", {item : item});            
                });
            });
       
        });
    });
    
});

expressApp.get("/desktop", function(req, res) {

    res.render("mobile.ejs");
    
});

expressApp.get("/createbag/:itemtype", function(req, res) {

    var userid = sanitizer.value(req.cookies.id, String);
    var itemtype = sanitizer.value(req.params.itemtype, String);
    
    if (!itemtype) return;
    
    
    if (!userid) {
        res.redirect("/signup");
        return;
    }
    
    Item.model.create({itemtype: itemtype}, function(err, item) {
        
        if (err || !item) { console.log(err); return; }
        
        Bag.model.create({item: item}, function(err, bag) {
            res.send("stinkpoints.com/rewards?reward=" + bag.id);
            return;
        })
        
        console.log("Item was created: " + itemtype + "!")
        
        
        
    })
    
});

expressApp.get("/", function(req, res) {

    var userid = sanitizer.value(req.cookies.id, String);
    
    if (!userid) {
        res.redirect("/signup");
        return;
    }
    
    res.render("mobile.ejs");
    
});

expressApp.get("*", function(req, res) {
    res.redirect("/");
});