var async = require("async");
var [Item, Log] = require("../../framework/objects")("item", "log");
var Model = require("./model");
var mongoose = require('mongoose');

// Common properties.
var Common = {
    usernameRegex : new RegExp("[a-zA-Z]+[a-zA-Z\s]*")
}

/**
 *  Validates that a string complies with username standards.
 */
function isValidUsername(username) {
    return (username && Common.usernameRegex.test(username) && username.length <= 20 && username.length >= 0 );
}

/**
 *  Creates a new user using Mongoose's model and schema.
 */
function createUser(username, callbackSuccess, callbackFailure) {
    
    // Test validity of username.
    if (!isValidUsername(username)) {
        return callbackFailure(username);
    }
    
    async.waterfall([
        // Checks if user exists in MongoDB database.
        function checkUserExistence(next) {
            Model.findOne({username : username}, (...args) => next(...args));
        },
        // Creates a user in MongoDB database.
        function insertUser(user, next) { 
            
            if (user) return callbackSuccess(user);
            
            Model.create({username: username, points: 0, items: []}, (...args) => next(...args));

        },
        // If user exists, run success callback.
        function runCallback(user, next) {
            
            if (!user) return next({message: "User did not exist."});
                
            callbackSuccess(user);
            
        }
    ],
    function(err, status) {
        callbackFailure(err + " | " + username);
    });
}

/**
 *  
 */
function useItem(sourceUserID, targetUserID, itemID, callbackSuccess, callbackFailure) {
    
    async.waterfall([
        // Find target user.
        function fetchTargetUser(next) {
            Model.findById(targetUserID, (..._args) => next(..._args));
        },
        // Find source target.
        function fetchSourceUser(targetUser, next) {
            Model.findById(sourceUserID, (..._args) => next(..._args, targetUser));
        },
        // Check if users exist and find item.
        function checkUsersAndFindItem(sourceUser, targetUser, next) {
            
            if (!sourceUser || !targetUser || sourceUser.items.indexOf(itemID) < 0) {
                return next({message : "Users did not exist or did not have item."});
            }
            
            Item.model.findById(itemID, (..._args) => next(..._args, sourceUser, targetUser));
            
        },
        // Use item.
        function useAndRemoveItem(item, sourceUser, targetUser, next) {
            
            if (!item) return next({message : "Item could not be found."});
                
            var itemtype, message, damage;
            
            if ((itemtype = item.itemtype.toLowerCase()) === "stinkbomb")
                damage = 50;
            else if (itemtype === "stinknuke")
                damage = 1000;
            else
                return next({message:`UNKNOWN ITEM ${itemtype}`}); 
            
            targetUser.points += damage;
            targetUser.save();
            
            message = `${sourceUser.username} just ${itemtype}'d ${targetUser.username} for ${damage} Stink Points!`;
            
            async.waterfall([
                function(next) {
                    Model.update(
                    {_id : sourceUser._id}, 
                    {$pull : {items : { _id : mongoose.Types.ObjectId(itemID)} } }, () => next());
                },
                function(next) {
                    Item.model.remove({_id : mongoose.Types.ObjectId(itemID)}, () => next());
                },
                function() {
                    callbackSuccess(message, item, targetUser);
                }
            ], 
            function(err, status) {
                callbackFailure(err);
            });

        }
    ],
    function(err, status) {
        
        callbackFailure(err);
        
    });
    
}

function giveDamage(sourceUserJObject, targetUserJObject, damage, callbackSuccess) {
    
    async.waterfall([
        // Finds the source user.
        function findSourceUser(next) {
            
            Model.findById(sourceUserJObject._id, (...args) => next(...args) );
            
        },
        // Decrements source user's ammo. 
        function decrementAmmo(sourceUser, next) {
            
            if (sourceUser == null) {
                return next({message : `User was not found in DB: ${sourceUserJObject._id}`});
            }
            
            if (sourceUser.ammo >= damage) {
                sourceUser.update({ammo: sourceUser.ammo - damage}, (...args) => next(...args, sourceUser ) );
            }
            
        },
        // Find targer user and increment damage.
        function findTargetUserAndIncrementDamage(result, sourceUser, next) {
            
            if (!result.ok) {
                return next({message : "Something went wrong with updating a user's ammo.", result})
            }
            
            Model.findByIdAndUpdate(targetUserJObject._id, {$inc : {points : damage}}, (...args) => next(...args, sourceUser));
            
        },
        // Log interaction of source user -> damage -> target user
        function logInteraction(targetUser, sourceUser, next) {
            
            if (!targetUser) {
                return next({message : "Something went wrong with updating a user's damage.", targetUser})
            }
            
            Log.model.create({log: `${sourceUser.username} just gave ${targetUser.username} ${damage} Stink Point(s)!`}, (...args) => next(...args));
                
            
        },
        // If logging was successful, run callback.
        function runCallback(log, next) {
            
            if (!log) {
                return next({message: "Log could not be created."});
            };
            
            callbackSuccess(log);
                
        }
    ], function (err) {
        console.log(`Error: ${err.message}`);
        console.log(err);
    });

}        

module.exports = {
    Common,
    isValidUsername,
    createUser,
    useItem,
    giveDamage
};