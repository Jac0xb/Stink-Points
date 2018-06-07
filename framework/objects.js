module.exports = (...config) => { 

    var array = [];
    
    for (var i = 0; i < config.length; i++) {
        
        switch(config[i].toLowerCase()) {
            case "user":
                array.push(require('../objects/user/blueprint'))
                continue;
            case "item":
                array.push(require('../objects/item/blueprint'))
                continue;
            case "bag":
                array.push(require('../objects/bag/blueprint'))
                continue;
            case "log":
                array.push(require('../objects/log/blueprint'))
                continue;
            default:
                console.log("Unknown object type.");
        }
        
    }
    
    return array;
    
};