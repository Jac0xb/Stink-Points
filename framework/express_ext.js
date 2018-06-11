const express = require("express");
var app = express();

var [User, Log] = require("./object")("user", "log");
var sanitizer = require("sanitize")();
var io = require('./socket').io;
var _ = require("underscore");

app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use(express.static(__dirname + "/../public"));

app.set("view engine", "ejs");

app.use (/\/((?!signup).)*/, function findInvalidUsers(req, res, next) {

    var username = sanitizer.value(req.cookies.id, String);
    
    var successCallback = function(err, user) {

        if (err || !user) {
            res.clearCookie("id");
            return res.redirect("/signup");
        }

        return next();

    }

    User.model.findById(username, successCallback);


});

app.listen(7777, "172.31.34.153", function() {
    
    console.log("Now running...");

    setInterval(function() {
        
        var callbackSuccess = function(log) {
            
            var clients = io.sockets.connected || {};
            
            for (var key in clients) {
                clients[key].emit("getalllogs", { log });
            }
            
        }
        
        Log.statics.createLog("Stink Point rations have been dispersed to all.", callbackSuccess);
        User.model.update({}, { $inc: { ammo: 1 } }, { multi: true }, (err) => err && console.log(err));

    }, 1000)
})

module.exports = app;