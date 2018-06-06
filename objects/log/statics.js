function createAdminLog(msg) {
    
    let model = module.exports.model;
    
    model.create({log: msg, admin: true});
    console.log(msg);
    
}

function createLog(msg) {
    
    let model = module.exports.model;
    
    model.create({log: msg, admin: false});
    
}


module.exports = (model) => {
    module.exports.model = model; 
    return {
        createAdminLog,
        createLog
    };
};