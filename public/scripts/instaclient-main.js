$(function() {
    var socket = null;
    var player = $('#player')[0];
    var $connect = $('#connect');
    var $log = $('#log');

    $connect.on('click', function() {
        if (!socket || !socket.socket.connected) {
            if (window.webkitNotifications) {
                if (window.webkitNotifications.checkPermission() !== 0) {
                    window.webkitNotifications.requestPermission();
                }
            }

            var hadSocket = !!socket;
            var host = location.origin.replace(/^http/, 'ws');
            var connectionOptions = {};
            if (hadSocket) {
                connectionOptions['force new connection'] = true;
            }
            socket = io.connect(host, connectionOptions);

            socket.on('sound', function(msg) {
                log("[sound ] " + msg.info.key);
                player.setAttribute("src", msg.info.url);
                player.play();
            });

            socket.on('speech', function(msg) {
                log("[speech] " + msg.info.voice + ": " + msg.info.text);
                if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
                    var notification = window.webkitNotifications.createNotification('/images/bread.png', "sndbrd: " + msg.info.voice, msg.info.text);
                    if (notification) {
                        notification.show();
                    }
                }

                if (window.speechSynthesis) {
                    var speech = new SpeechSynthesisUtterance(msg.info.text);
                    speech.voice = _.find(window.speechSynthesis.getVoices(), function(voice) {
                        return voice.name.toLowerCase() == msg.info.voice.toLowerCase();
                    });
                    window.speechSynthesis.speak(speech);
                }
            });

            socket.on('disconnect', function() {
                $connect.html('Connect');
            });
            //TODO errors, etc.

            $(this).html("Disconnect");
        } else {
            player.pause();
            socket.disconnect();
            $(this).html("Connect");
        }
    });

    function log(message, level) {
        var line = [(level || "INFO"), new Date().toString(), message].join(' ');
        var p = $('<p></p>');
        p.html(line);
        $log.append(p);

        $log.scrollTop($log.prop('scrollHeight'));
    }

});