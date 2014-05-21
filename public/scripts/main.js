$(function() {
    var socket = io.connect('http://localhost:4040');

    socket.on('connected', function (msg) {
        console.log("connected in browser");
    });
});
