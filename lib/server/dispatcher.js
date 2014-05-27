var config = require('config'),
    request = require('request');

exports.io = null;
exports.register = function(io) {
    exports.io = io;
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        socket.join(config.room.name);
        socket.emit('connected');
    })
};

exports.dispatch = function(type, info) {
    exports.io.sockets.in(config.room.name).emit(type, {info: info});

    if (config.webhooks) {
        var message = (type === 'sound') ? info.key : info.voice + ": " + info.text;
        if (config.webhooks.slack && process.env[config.webhooks.slack]) {
            request.post(process.env[config.webhooks.slack]).json({
                text: '[' + type + '] ' + message
            });
        }
    }
};
