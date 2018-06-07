var Model = require("./model");
var [Bag] =  require.main.require("./framework/objects")("bag");
var $ = require.main.require("./framework/commons");

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

module.exports = {
    spawnItem
};