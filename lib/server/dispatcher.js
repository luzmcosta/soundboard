var config = require('config'),
    request = require('request');

var typeTimeouts = {};
var typeCounts = {};

var resetTypeTimeouts = function(type) {
    clearTimeout(typeTimeouts[type]);

    typeTimeouts[type] = setTimeout(function() {
        typeCounts[type] = 0;
    }, (config.limits[type] && config.limits[type].interval) || 1000);
};

var getTypeCount = function(type) {
    if (!typeCounts[type]) typeCounts[type] = 0;
    return typeCounts[type];
};

var getTypeAvailable = function(type) {
    resetTypeTimeouts(type);
    return getTypeCount(type) < ((config.limits[type] && config.limits[type].count) || 10)
};

var requestType = function(type, callback) {
    if (getTypeAvailable(type)) {
        typeCounts[type]++;
        callback();
    }
};

exports.io = null;
exports.register = function(io) {
    exports.io = io;
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        socket.join(config.default_channel.name);
        socket.emit('connected');
    });
};

exports.dispatch = function(type, info) {
    requestType(type, function() {
        exports.io.sockets.in(config.default_channel.name).emit(type, {info: info});

        if (config.webhooks) {
            var message = (type === 'sound') ? info.key.replace(/\.mp3/gi, '') : info.voice + ": " + info.text;
            if (config.webhooks.slack && process.env[config.webhooks.slack]) {
                request.post(process.env[config.webhooks.slack]).json({
                    text: '[' + type + '] ' + message
                });
            }
        }

    });

};
