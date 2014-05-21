//Config
var config = require('config');

//Server/IO
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

// Authenticator
app.use(express.basicAuth(function(user, pass) {
 return user === (config.auth.user || 'admin') && md5(pass) === (config.auth.passMd5 || md5('admin'));
}));

//Static assets, scripts and such.
app.use(express.static(__dirname + '/../public'));

//Set up IO
io.set('log level', 1);
io.sockets.on('connection', function (socket) {
    socket.join('board');
});

//Start method
exports.start = function() {
    server.listen(process.env.PORT || config.environment.PORT);
};
