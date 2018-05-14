var mongoose = require("mongoose");
var Item = require("./item.js");

var UserSchema = mongoose.Schema({
    displayname: String,
    points: Number,
    ammo: {type: Number, default: 5},
    items: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Item"
      }
    ],
    disabled: Boolean
});

var User = mongoose.model("User", UserSchema);

User.Model_regex = new RegExp("^[A-z ]+$");
User.Model_CreateUser = function(username, fingerprint, callback_success, callback_failure) {
    
    // Username validity check.
    if (!username || !User.Model_regex.test(username) || username.length >= 20 || username.length <= 0 )
        return;
    
    // See if user already exists, or if they need to be created.
    User.findOne({displayname : username}, function(err, founduser) {

        if (founduser) {
            callback_success(founduser);
            return;
        }
        else if (err) {
            callback_failure(username);
            return;
        }
        
        // 'founduser' doesn't exist, so we create a new user.
        User.create(new User({displayname: username, points: 0, items: []}), function (err, user) {
            
            if (err || !user) {
                callback_failure(username);
                return;
            };
                
            callback_success(user._id);
            
        });
    })
}

/*
*   
*   
*
*/
User.Model_UseItem = function(user_id, item_id, target_username , callback_success, callback_failure) {
    
    // Find the user 'using' the item.
    User.findById(user_id, function(err, user) {
        
        if (err || !user || user.items.indexOf(item_id) < 0) {
            return;
        }
        
        // Remove item
        user.items.remove(item_id);
        user.save();
        
        User.findById(target_username, function(err, targetuser) {
            
            if (err || !targetuser) { 
                callback_failure(err); 
                return;
            };
            
            Item.findById(item_id, function(err, item) {
                
                if (err || !item) {
                    callback_failure(err); 
                    return;
                };
                
                if (item) {
                    
                    var itemtype = item.itemtype;
                    var message = "";
                    
                    if (itemtype === "stinkbomb") {
                        targetuser.points += 50;
                        targetuser.save();
                        message = user.displayname + " JUST STINK BOMBED " + targetuser.displayname + "FOR 50 STINK POINTS!!!!!";
                    }
                    else if (itemtype === "stinknuke") {
                        targetuser.points += 1000;
                        targetuser.save();
                        message = user.displayname + " JUST STINK NUKED " + targetuser.displayname + "FOR 1000 STINK POINTS!!!!!";
                    }
                    else if (itemtype === "stinksword") {
                        targetuser.points += 10;
                        targetuser.save();
                        message = user.displayname + " JUST STINK STABBED " + targetuser.displayname + "FOR 10 STINK POINTS!!!!!";
                    }
                    else {
                        callback_failure("UNKNOWN ITEM" + itemtype); 
                        return;
                    }
                    
                    item.remove();
                    callback_success(message, item, targetuser);
                    return;
                    
                }
                    
                callback_failure("Item ID '" + item_id + "' did not exist."); 
                
            });
        });
    });
    
}

module.exports = User;
