$(function() {
    var host = location.origin.replace(/^https|http/, 'ws');
    var socket = io.connect(host);

    socket.on('connected', function (msg) {
        console.log("connected in browser");
    });
});
