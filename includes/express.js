var express = require("express");
var bodyParser = require("body-parser");
var app = module.exports = express();

app.use(bodyParser.urlencoded( { extended: true } ));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/../public"));
