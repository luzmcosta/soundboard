var config = require('config');

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

var playSound = function(request, response) {
    var key = request.params.key;
    sound_dao.getList(function(err, list) {
        if (!err) {
            var soundInfo = unda.find(list, function(info) {
                return info.key.toLowerCase() === key.toLowerCase();
            });
            if (soundInfo) {
                exports.dispatcher.dispatch('sound', soundInfo);
            }
        }
    });

    response.jsonp({request: "accepted"});
};

var handleSpeech = function(request, response) {
    var text = request.body.text;
    var voice = request.body.voice || "Alex";

    if (text && voice) {
        exports.dispatcher.dispatch('speech', {
            text: text,
            voice: voice
        });
    }

    response.jsonp({request: "accepted"});
};

exports.dispatcher = null;
exports.register = function(app, auth, dispatcher) {
    //Save dispatcher
    exports.dispatcher = dispatcher;

    //Sounds
    app.get('/sound/list', auth, getSoundList);
    app.get('/sound/list/refresh', auth, refreshSoundList);
    app.get('/sound/:key', auth, playSound);

    //Speech
    app.post('/speech', auth, handleSpeech);
};
