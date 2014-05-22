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

var playSound = function(request, response, next) {
    var key = request.params.key;
    sound_dao.getList(function(err, list) {
        if (!err) {
            var soundInfo = unda.find(list, function(info) {
                return info.key === key;
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
exports.register = function(app, dispatcher) {
    //Save dispatcher
    exports.dispatcher = dispatcher;

    //Sounds
    app.get('/sound/list', getSoundList);
    app.get('/sound/list/refresh', refreshSoundList);
    app.get('/sound/:key', playSound);

    //Speech
    app.post('/speech', handleSpeech);
};
