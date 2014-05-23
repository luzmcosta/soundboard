$(function() {
    var player = $('#player')[0];
    var ultralist = null;
    var mp3Regex = /\.mp3/gi;
    var playbackTimer = null;

//    var $speak = $('#speak');
//    $speak.on('click', function() {
//        var text = $('#speech-text').val();
//        if (text) {
//            $.ajax({
//                url: '/speech',
//                type: 'POST',
//                contentType: 'application/json',
//                data: JSON.stringify({text:text, voice:"Victoria"})
//            });
//        }
//    });

    $.ajax('/sound/list').done(function(list) {
        var $list = $('#sound-list');

        _.each(list, function(soundInfo) {
            var sound = $('<div></div>');
            sound.addClass('sound');
            sound.html(soundInfo.key.replace(mp3Regex, ''));
            sound.data('key', soundInfo.key);
            sound.data('url', soundInfo.url);

            $list.append(sound);
        });

        $list.on('click', '.sound', function() {
            if (!$(this).data('preview')) {
                var key = $(this).data('key');
                $.ajax('/sound/' + key);
            } else {
                $(this).data('preview', false);
            }
        });

        $list.on('mousedown', '.sound', function() {
            var $this = $(this);
            playbackTimer = setTimeout(function() {
                $this.data('preview', true);
                preview($this.data('url'));
            }, 1000);
        });

        $list.on('mouseup', '.sound', function() {
            clearTimeout(playbackTimer);
            endPreview();
        });

        var $ultrabox = $('#ultrabox');
        ultralist = _.map(list, function(item) {
            return {key: item.key.replace(mp3Regex, '')};
        });

        $ultrabox.typeahead({
            minLength: 3,
            highlight: true,
            hint: true
        },{
            name: 'sounds',
            displayKey: 'key',
            source: function(query, callback) {
                var pattern = new RegExp(query, 'i');
                var sortedList = _.filter(ultralist, function(item) {
                    return item.key.match(pattern);
                });

                callback(sortedList);
            }
        });

        $ultrabox.on('typeahead:selected typeahead:autocompleted', function() {
            /* selected or autocompleted */
        });

        $ultrabox.on('keypress', function(evt) {
            if (evt.which === 13) { //ENTER
                var val = $(this).val();
                sendRequest(val);
                $(this).val('');
                $(this).typeahead('close');
            }
        });

    });

    function sendRequest(val) {
        var soundMatch = _.find(ultralist, function(item) {
            return item.key.toLowerCase() === val.toLowerCase();
        });

        if (soundMatch) {
            $.ajax('/sound/' + val + ".mp3");
        } else if (val) {
            $.ajax({
                url: '/speech',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({text:val, voice:"Victoria"})
            });
        }
    }

    function preview(url) {
        endPreview();
        try {
            player.setAttribute("src", url);
            player.play();
        } finally {}
    }

    function endPreview() {
        try {
            player.pause();
        } finally {}
    }

});
