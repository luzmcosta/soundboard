var sound_dao = require('./sound_dao'),
    unda = require('underscore');

var getSoundList = function(request, response) {
    sound_dao.getList(function(err, list) {
        response.jsonp(err || list);
    });
};

var refreshSoundList = function(request, response) {
    sound_dao.getList(function(err, list) {
        response.jsonp(err || list);
    }, true);
};

var inSoundList = function(key, callback) {
    sound_dao.getList(function(err, list) {
        if (!err) {
            var soundInfo = unda.find(list, function(info) {
                return info.key.toLowerCase() === key.toLowerCase();
            });
            if (soundInfo) {
                callback(soundInfo);
            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
};

var handleSound = function(request, response) {
    var key = request.params.key;

    sound(key);

    response.jsonp({request: "accepted"});
};

var handleSpeech = function(request, response) {
    var text = request.body.text;
    var voice = request.body.voice;

    speak(text, voice);

    response.jsonp({request: "accepted"});
};

var handleAPI = function(request, response) {
    if (request.params.apikey === (process.env.API_KEY || "TOKEN")) {
        /*
        command=/weather
        text=94070
         */
        var command = request.body.command;
        var text = request.body.text;
        if (command === "/sndbrd") {
            var args = text.split(' ');
            if (args[0].toLowerCase() === 'list') {
                sound_dao.getList(function(err, list) {
                    if (!err) {
                        if (args[1]) {
                            var regex = new RegExp(args[1].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'gi');
                            var filteredList = unda.filter(list, function(info) {
                                return info.key.match(regex);
                            });

                            filteredList = unda.map(filteredList, function(info) {
                                return info.key.replace(/\.mp3/gi, '');
                            });

                            response.send(filteredList.join('\n'));
                        } else {
                            response.send("Please provide a filter: /sndbrd list {filter}");
                        }
                    } else {
                        response.send("Unable to retrieve list");
                    }
                });
            } else {
                inSoundList(text.replace(/\.mp3/, '') + '.mp3', function(soundInfo) {
                    if (soundInfo) {
                        sound(soundInfo.key, respond);
                    } else {
                        speak(text, null, respond);
                    }
                });
            }
        }
    } else {
        response.statusCode = 403;
        response.send('Invalid API Key');
    }

    function respond(err, message) {
        response.send(err || message);
    }
};

var speak = function(text, voice, callback) {
    voice = voice || "Alex";

    if (text && voice) {
        exports.dispatcher.dispatch('speech', {
            text: text,
            voice: voice
        });
    }

    if (callback) {
        callback(null, "[speech] " + voice + ": " + text);
    }
};

var sound = function(key, callback) {
    inSoundList(key, function(soundInfo) {
        if (soundInfo) {
            exports.dispatcher.dispatch('sound', soundInfo);
            if (callback) {
                callback(null, "[sound] " + key);
            }
        } else {
            if (callback) {
                callback("No sound with that name: " + key);
            }
        }
    });
};

exports.dispatcher = null;
exports.register = function(app, auth, dispatcher) {
    //Save dispatcher
    exports.dispatcher = dispatcher;

    //Sounds
    app.get('/sound/list', auth, getSoundList);
    app.get('/sound/list/refresh', auth, refreshSoundList);
    app.get('/sound/:key', auth, handleSound);

    //Speech
    app.post('/speech', auth, handleSpeech);

    //API
    app.post('/api/1.0/:apikey', handleAPI);
};
