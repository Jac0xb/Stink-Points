module.exports = () => { 
    return { 
        user : require('../objects/user/blueprint'),
        item : require("../objects/item/blueprint"),
        bag : require("../objects/bag/blueprint"),
        log : require("../objects/log/blueprint")
    }
};