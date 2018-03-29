var io = require('socket.io')(8080); // The port should be different of your HTTP server.
var app = require("./includes/express.js");
var mongoose = require("mongoose");
var passport = require("passport");
var localstrategy = require("passport-local");


//mongoose.connect("mongodb://localhost/stickpoints");



app.get("*", function(req, res) {
   res.render("index.ejs");
});



io.on('connection', function (socket) { // Notify for a new connection and pass the socket as parameter.
    console.log('new connection');

    setInterval(function () {
        socket.emit('update-players', [ {playerid:"jacobbrown", displayname: "Jacob Brown", points: 100} ] ); // Emit on the opened socket.
    }, 1000);

});


app.listen(80, "172.31.34.153", function() {
    console.log("Basewars server running");
})