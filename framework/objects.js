const assert = require('assert').strict;
var _ = require("underscore");

module.exports = (...config) => { 

    var array = [];

    var user = require('../objects/user/blueprint');
    var item = require('../objects/item/blueprint');
    var bag = require('../objects/bag/blueprint');
    var log = require('../objects/log/blueprint');

    for (var i = 0; i < config.length; i++) {
        
        switch(config[i].toLowerCase()) {
            case "user":
                array.push(user)
                continue;
            case "item":
                array.push(item)
                continue;
            case "bag":
                array.push(bag)
                continue;
            case "log":
                array.push(log)
                continue;
            default:
                throw new Error("Unknown object type.");
        }
        
    }
    
    // Assertion that these objects will be filled by the time everything loads
    setTimeout(function() {
    
        for (var i = 0; i < array.length; i++) 
            assert(_.values(array[i]).length > 0);
        
    }, 1000);
    
    return array;
    
};