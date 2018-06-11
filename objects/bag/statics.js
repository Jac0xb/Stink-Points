var _ = require("underscore");

module.exports = {
    openBag
};

var async = require("async");
var Model = require("./model");
var [User, Item] = require("../../framework/objects")("user","item");
var mongoose = require('mongoose');

function openBag(bagID, userID, callbackSuccess, callbackFailure) {
    
    async.waterfall([
        function(next) {
            Model.findById(bagID, next);
        },
        function(bag, next) {
            
            if (!bag) {
                return next({message: "Item was not found."});
            }
            
            Item.model.findById(bag.item, (...args) => next(...args, bag));
        },
        function(item, bag, next) {
                
            User.model.findById(userID, function(err, user) {
                
                if (!user || !item || err) { 
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
        callbackFailure(["Error", err ]);
    });
}
