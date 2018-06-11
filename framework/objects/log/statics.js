module.exports = {
    createAdminLog,
    createLog
};

var Model = require("./model");

function createAdminLog(msg) {
    
    Model.create({log: msg, admin: true});
    console.log(msg);
    
}

function createLog(msg, callbackSuccess, callbackFailure) {
    
    Model.create({log: msg, admin: false}, function(err, log) {
        
        if (log && callbackSuccess) {
            callbackSuccess(log);
        }
        else if (callbackFailure) {
            callbackFailure(err);
        }
        
    });
    
}