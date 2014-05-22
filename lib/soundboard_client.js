var config = require('config'),
    io = require('socket.io-client');

exports.start = function() {
    var socket = io.connect(config.server.host);

    socket.on('sound', function(msg){
        console.log("sound", msg);
    });

    //TODO listen on ports and stuff
};
