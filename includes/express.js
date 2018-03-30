const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
var User = require('./user')
var Address = require('./address')
var app = module.exports = express();

app.use(bodyParser.urlencoded( { extended: true } ));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/../public"));
app.use(cookieParser());

function findInvalidUsers(req, res, next) {
    
    var username = req.cookies.id;
    
    if (username) {
        User.findById(username, function(err, user) { 

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

function findIPGoons(req, res, next) {
    
    var username = req.cookies.id;
    
    if (username) {
        next();
        return;
    }
    
    var address = req.ip;
    
    if (address) {
        Address.findOne({address: address}, function(err, foundAddress) { 
            
            if (foundAddress) {
                User.findById(foundAddress.user, function (err, user) {
                    
                    if (err) throw err;
                    
                    if (!user) {
                        next();
                        return;
                    }
                    
                    var farFuture = new Date(new Date().getTime() + (1000*60*60*24*365*10)); // ~10y
                    res.cookie("id", user._id, {expires: farFuture});
                    
                    res.render("bad.ejs");
                })
            }
            else {
                next();
            }
            
        });
    }
    else {
        next();
    }
    
}
app.use(findIPGoons);