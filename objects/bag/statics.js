var async = require("async");
var [User, Item] = require("../../framework/objects")("user","item");
var Model = require("./model");
var mongoose = require('mongoose');

function openBag(bagID, userID, callbackSuccess, callbackFailure) {
    
    async.waterfall([
        function(next) {
            Model.findById(bagID, next);
        },
        function(bag, next) {
            Item.model.findById(bag.item, (...args) => next(bag, ...args));
        },
        function(bag, item, next) {
                
            User.model.findById(userID, function(err, user) {
                
                if (!user || !bag || !item || err) { 
                    return next({message: "Something has gone terribly wrong."});
                }
                
                user.items.push(item);
                user.save();
                
                bag.remove(function() {
                    callbackSuccess(item);
                });
            });
        }
    ], function(err) {
        callbackFailure(err);
    });
}

module.exports = {
    openBag
};