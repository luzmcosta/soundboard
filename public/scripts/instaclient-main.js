$(function() {
    var socket = null;
    var audios = {};

    var $players = $('#players');
    var $connect = $('#connect');
    var $log = $('#log');

    if ("speechSynthesis" in window) {
        window.speechSynthesis.getVoices()
    }

    $connect.on('click', function() {
        if (!socket || !socket.socket.connected) {
            var hadSocket = !!socket;
            var host = location.origin.replace(/^http/, 'ws');
            var connectionOptions = {};
            if (hadSocket) {
                connectionOptions['force new connection'] = true;
            }
            socket = io.connect(host, connectionOptions);

            socket.on('sound', function(msg) {
                var key = msg.info.key;
                var player = audios[key];
                if (!player) {
                    var $player = $('<audio></audio>');
                    $players.append($player);
                    player = $player[0];
                    audios[key] = player;
                    player.setAttribute("src", msg.info.url);
                } else {
                    player.pause();
                    player.currentTime = 0;
                }
                log("[sound ] " + key);
                player.play();
            });

            socket.on('speech', function(msg) {
                log("[speech] " + msg.info.voice + ": " + msg.info.text);

                if ("speechSynthesis" in window) {
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
            _.each(audios, function(player) {
                player.pause();
            });
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