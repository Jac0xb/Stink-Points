var async = require("async");
var [Item, Log] = require("../../framework/objects")(["item", "log"]);
var Model = require("./model");

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
            
            Model.findOne({username : username}, function(err, foundUser) {
        
                if (foundUser) {
                    return callbackSuccess(foundUser);
                }
                else if (err) {
                    next(err);
                }
                
                next(null);
                
            })
            
        },
        // Creates a user in MongoDB database.
        function insertUser(next) { 
            
            Model.create(new User({username: username, points: 0, items: []}), function (err, user) {
            
                if (err || !user) {
                    next(err);
                };
                    
                callbackSuccess(user);
            
            });
        }
    ],
    function(err, status) {
        
        callbackFailure(err + " | " + username);
        
    });
}

/**
 *  
 */
function useItem(sourceUserID, item_id, targetUserID , callbackSuccess, callbackFailure) {
    
    async.waterfall([
        // Checks if 'source user' exists in MongoDB database.
        function checkSourceUserExistence(next) {
            
            // Find source user.
            Model.findById(sourceUserID, function(err, sourceUser) {
                
                // Check if user exists.
                if (err || !sourceUser || sourceUser.items.indexOf(item_id) <= 0) {
                    return next(err);
                }
                
                // Remove item from user's inventory.
                sourceUser.items.remove(item_id).save(function(err, result) {
                    
                    if (err) {
                        return next(err);
                    }
                    
                    next(null, {sourceUser})
                    
                });
                
            });
        },
        // Checks if 'target user' exists in MongoDB database.
        function checkTargetUserExistence(args, next) {
            
            Model.findById(targetUserID, function(err, targetUser) {
            
                if (err || !targetUser) { 
                    return next(err);
                };
                
                next(null, {sourceUser : args.sourceUser, targetUser} );
            
            });
        },
        function useItem(args, next) {
            Item.model.findById(item_id, function(err, item) {
        
                if (err || !item) {
                    callbackFailure(err); 
                    return;
                };
                
                if (item) {
                    
                    var itemtype = item.itemtype.toLowerCase();
                    var message = "";
                    
                    if (itemtype === "stinkbomb") {
                        args.targetUser.points += 50;
                        args.targetUser.save();
                        message = `${args.sourceUser.username} JUST STINK BOMBED ${args.targetUser.username} FOR 50 STINK POINTS!!!!!`;
                    }
                    else if (itemtype === "stinknuke") {
                        args.targetUser.points += 1000;
                        args.targetUser.save();
                        message = `${args.sourceUser.username} JUST STINK NUKED ${args.targetUser.username} FOR 1000 STINK POINTS!!!!!`;
                    }
                    else if (itemtype === "stinksword") {
                        args.targetUser.points += 10;
                        args.targetUser.save();
                        message = `${args.sourceUser.username} JUST STINK STABBED ${args.targetUser.username} FOR 10 STINK POINTS!!!!!`;
                    }
                    else {
                        return next(err = "UNKNOWN ITEM" + itemtype); 
                    }
                    
                    item.remove();
                    callbackSuccess(message, item, args.targetUser);
                    
                }
                    
                callbackFailure("Item ID '" + item_id + "' did not exist."); 
            });
        }
    ],
    function(err, status) {
        
        callbackFailure(err);
        
    });
    
}


function giveDamage(sourceUserJObject, targetUserJObject, damage, callbackSuccess) {
    
    async.waterfall([
        function findSourceUser(next) {
            
            Model.findById(sourceUserJObject._id, function(err, sourceUser) {
                
                if (sourceUser == null || err) {
                    return next( err || {message : `User was not found in DB: ${sourceUserJObject._id}`});
                }
                
                if (sourceUser.ammo >= damage) {
                    next(null, sourceUser)
                }
                
            } );
            
        },
        function decrementAmmo(sourceUser, next) {
            
            sourceUser.update({ammo: sourceUser.ammo - damage}, function(err, result) {
                
                if (!result.ok || err) {
                    return next(err || next({message : "Something went wrong with updating a user's ammo.", result}))
                }
                
                next(null, sourceUser)
                
            });
            
        },
        function incrementDamage(sourceUser, next) {
            
            Model.findByIdAndUpdate(targetUserJObject._id, {$inc : {points : damage}}, function(err, targetUser ) {
                
                if (!targetUser || err) {
                    return next(err || next({message : "Something went wrong with updating a user's damage.", targetUser}));
                }
                
            });
            
        },
        function logInteraction(targetUser, sourceUser, next) {
            
            Log.model.create({log: `${sourceUser.username} just gave ${targetUser.username} ${damage} Stink Point(s)!`}, function(err, log) {
               
                if (!log) {
                    return next({message: "Log could not be created."});
                };
            
                callbackSuccess(log); 
                
            });
        }
    ], function (err) {
        console.log(`Error: ${err.message}`);
        console.log(err);
    });

}        

function giveDamage(sourceUserJObject, targetUserJObject, damage, callbackSuccess) {
    
    async.waterfall([
        function findSourceUser(next) {
            
            Model.findById(sourceUserJObject._id, (...args) => next(...args) );
            
        },
        function decrementAmmo(sourceUser, next) {
            
            if (sourceUser == null) {
                return next({message : `User was not found in DB: ${sourceUserJObject._id}`});
            }
            
            if (sourceUser.ammo >= damage) {
                sourceUser.update({ammo: sourceUser.ammo - damage}, (...args) => next(...args, sourceUser ) );
            }
            
        },
        function incrementDamage(result, sourceUser, next) {
            
            if (!result.ok) {
                return next({message : "Something went wrong with updating a user's ammo.", result})
            }
            
            Model.findByIdAndUpdate(targetUserJObject._id, {$inc : {points : damage}}, (...args) => next(...args, sourceUser));
            
        },
        function logInteraction(targetUser, sourceUser, next) {
            
            if (!targetUser) {
                return next({message : "Something went wrong with updating a user's damage.", targetUser})
            }
            
            Log.model.create({log: `${sourceUser.username} just gave ${targetUser.username} ${damage} Stink Point(s)!`}, (...args) => next(...args));
                
            
        },
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