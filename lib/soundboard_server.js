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
var auth = null;
if (config.auth.enabled) {
    auth = express.basicAuth(function(user, pass) {
        return user === (process.env.SB_USER || 'admin') && md5(pass) === (process.env.SB_PASS || md5('admin'));
    });

    //TODO remove when API is working
    app.use(auth);
} else {
    auth = function(err, req, res, next){ next(); }
}

//Static assets, scripts and such.
app.use(express.static(__dirname + '/../public'));

//Body Parsing
app.use(express.json());
app.use(express.urlencoded());

//Set up dispatcher
dispatcher.register(io);

//Set up API
api.register(app, auth, dispatcher);

//Start method
exports.start = function() {
    server.listen(process.env.PORT || config.environment.port);
};
