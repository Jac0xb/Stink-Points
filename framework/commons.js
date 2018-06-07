let Internals = {};

function isQueryError(...args) {
    
    var [err, success] = [...args];
    
    return ((err && !(success)) && !console.log("Error: ") && !console.log(err)) || false;
    
}


Internals.infiniteExpire = {};
function infiniteExpire () { 
    return Internals.infiniteExpire.cachedData || (Internals.infiniteExpire.cachedData = new Date(new Date().getTime() + (1000*60*60*24*365*10)));
}


module.exports = {
    isQueryError,
    infiniteExpire
};