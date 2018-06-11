var expressApp = require("../express_ext");
var commons = require("../commons");
var [User, Item, Bag, Log] = require("../objects")("user", "item", "bag", "log");
var sanitizer = require("sanitize")();

/*
*   GET: User->signup
*/
expressApp.get("/signup", function(req, res) {
    
    // See if the client has the cookie 'id'.
    var userid = sanitizer.value(req.cookies.id, String);
    
    // If they already have an assigned user, return to main.
    if (userid) {
        return res.redirect("/");
    }
    
    // Render the signup page.
    res.render("signup.ejs")
    
});

/*
*   POST: User->signup
*/
expressApp.post("/signup", function(req, res) {
    
    // See if the client has the cookie 'id'.
    var userid = sanitizer.value(req.cookies.id, String);
    
    // If they already have an assigned user, return to main.
    if (userid) {
        return res.redirect("/");
    }
    
    // The function called if the user is successfully created.
    var callbackSuccess = function (user) {
        Log.statics.createAdminLog("User Successfully Created: " + user.username);
        res.cookie("id", user._id, {expires: commons.infiniteExpire()});
        res.redirect("/");
    };

    // The function called if the user is unsuccessfully created.    
    var callbackFailure = function(username) {
        Log.statics.createAdminLog("User Not Created: " + username);
        res.redirect("/signup?msg=failed");
    }
    
    User.statics.createUser(req.body.username, callbackSuccess, callbackFailure);

})

/*
*   Item->Post
*   Executed when a user uses an item.
*/
expressApp.post("/item/:item", function(req, res) {
    
    // Sanitize user input.
    var [userID, itemID, targetID] = [sanitizer.value(req.cookies.id, String), sanitizer.value(req.params.item, String), sanitizer.value(req.body.target, String)];
    
    // If any of the inputs are invalid, cancel.
    if (!userID || !targetID || !itemID) return res.redirect("/");

    // Render 'item used' view and broadcast to users.
    var _s = function Success(message, item, targetUser) {
        Log.statics.createLog(message);
        res.render("item.ejs", {item: item, target: targetUser});
    }

    // Report failure.
    var _f = function Failure(err) {
        Log.statics.createAdminLog(err.Message);
        res.redirect("/");
    }
    
    User.statics.useItem(userID, targetID, itemID, _s, _f);
    
});

/**
 *  Debug: Used to switch users on mobile devices without access to cookie manipulation.
 */
expressApp.get("/debug/switchuser/:user", function(req, res) {
    
    var username = sanitizer.value(req.params.user, String);
    
    res.cookie("id", username, {expires: commons.infiniteExpire()});
    res.redirect("/");
    
})

/*
*   Used to open a reward.
*/
expressApp.get("/rewards", function(req, res) {
    
    // Sanitize inputs.
    var [userID, bagID] = [sanitizer.value(req.cookies.id, String), sanitizer.value(req.query.reward, String)];

    if (!userID || !bagID) return res.redirect("/");

    // Render reward view.
    var _s = function Success(item) {
        res.render("reward.ejs", {item : item});
    }

    // Report failure.
    var _f = function Failure(err) {
        res.redirect("/"); 
        Log.statics.createAdminLog(err);
    }
    
    Bag.statics.openBag(bagID, userID, _s, _f);
    
});

/*
*   Debug: used to create item.
*/
expressApp.get("/debug/createbag/:itemtype", function(req, res) {

    // Sanitize inputs.
    var [userid, itemtype] = [sanitizer.value(req.cookies.id, String), sanitizer.value(req.params.itemtype, String)];
    
    if (!userid || !itemtype) return res.redirect("/");
    
    // Render 'item recieved' view.
    var _s = function(bag) {
        res.send(`stinkpoints.com/rewards?reward=${bag.id}`);
        console.log(`Item was created: ${itemtype}!`);
    }
    
    // Log error.
    var _f = function(err) {
        console.log("Item could not be created!", "\n", err);
    }
    
    Item.statics.spawnItem(itemtype, _s, _f);
    
});

/**
*   Renders the game area view.
*/
expressApp.get("/", function(req, res) {
    res.render("desktop.ejs");
});

/**
 *  Renders a spectactor mode.
 */
expressApp.get("/desktop", function(req, res) {

    res.render("desktop.ejs");
    
});

/**
 *  Captures all other routes and redirects.
 */
expressApp.get("*", function(req, res) {
    res.redirect("/");
});