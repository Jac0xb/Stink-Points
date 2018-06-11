var _ = require("underscore");

module.exports = {
    spawnItem
};

var Model = require("./model");
var [Bag] =  require("../../object")("bag");
var $ = require("../../commons");

Bag;

var async = require("async");

function spawnItem(itemtype, _s, _f) {
    
    async.waterfall([
        function createItem(next) {
            
            Model.create({itemtype: itemtype}, function(err, item) {
                
                if ($.isQueryError(...arguments))
                   return _f(err);
                   
                next(null, item);
            })
            
        },
        function createBag(item, next) {
            
            Bag.model.create({item: item}, function(err, bag) {
                
                if ($.isQueryError(...arguments))
                    return _f(err);
                
                return _s(bag);
            })
            
        }
    ], function(err) {
        _f(err);
    });
}

