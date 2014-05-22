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
if (config.auth.enabled) {
    app.use(express.basicAuth(function(user, pass) {
     return user === (process.env.SB_USER || 'admin') && md5(pass) === (process.env.SB_PASS || md5('admin'));
    }));
}

//Static assets, scripts and such.
app.use(express.static(__dirname + '/../public'));

//Body Parsing
app.use(express.json());

//Set up dispatcher
dispatcher.register(io);

//Set up API
api.register(app, dispatcher);

//Start method
exports.start = function() {
    server.listen(process.env.PORT || config.environment.port);
};
