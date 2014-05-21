$(function() {
    var socket = io.connect('http://sndbrd.herokuapp.com');

    socket.on('connected', function (msg) {
        console.log("connected in browser");
    });
});
