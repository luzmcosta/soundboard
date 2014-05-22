//Config
var config = require('config');

//Server/IO
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    md5 = require('MD5'),
    dispatcher = require('./server/dispatcher.js'),
    api = require('./server/api.js');

// Authenticator
app.use(express.basicAuth(function(user, pass) {
 return user === (config.auth.user || 'admin') && md5(pass) === (config.auth.passMd5 || md5('admin'));
}));

//Static assets, scripts and such.
app.use(express.static(__dirname + '/../public'));

//Set up dispatcher
dispatcher.register(io);

//Set up API
api.register(app, dispatcher);

//Start method
exports.start = function() {
    server.listen(process.env.PORT || config.environment.PORT);
};
