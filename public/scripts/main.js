$(function() {
    var host = location.origin.replace(/^http/, 'ws');
    var socket = io.connect(host);

    socket.on('sound', function (msg) {
        console.log("sound", msg);
    });
});
