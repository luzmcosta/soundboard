var config = require('config');

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
};
