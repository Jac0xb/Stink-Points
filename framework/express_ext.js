const express = require("express");
var app = express();

//var Models = require("./models")();
var io = require('./socket').io;

app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use(express.static(__dirname + "/../public"));

app.set("view engine", "ejs");

function findInvalidUsers(req, res, next) {

    var username = req.cookies.id;

    if (username) {
        Models.User.model.findById(username, function(err, user) {

            if (err || user == null) {
                res.clearCookie("id");
                res.redirect("/");
                return;
            }

            next();

        });
    }
    else {
        next();
    }

}
app.use(findInvalidUsers);

app.listen(7777, "172.31.34.153", function() {
    console.log("Stink point server running");

    setInterval(function() {

        var date = new Date(Date.now())
        
        Models.Log.model.create({ log: "Stink Point rations have been dispersed to all." }, function(err, log) {

            if (err || !log) return;

            var clients = io.sockets.connected;

            if (!clients) {
                return;
            }

            for (var key in clients) {
                clients[key].emit("getalllogs", { log });
            }
        });
        Models.User.model.update({}, { $inc: { ammo: 1 } }, { multi: true }, function(err, success) {

            console.log("Stink Points have been Dispensed.");

        });

    }, 1000)
})

module.exports = app;