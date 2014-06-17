$(function() {
    var player = $('#player')[0];
    var ultralist = null;
    var mp3Regex = /\.mp3|wav/gi;
    var playbackTimer = null;

    var $list = $('#sound-list');
    var $voice = $('#voice');

    $.ajax('/sound/list').done(function(list) {
        var listGroups = _.groupBy(list, function(item) {
            return item.key.substr(0, 1).toLowerCase();
        });

        _.each(listGroups, function(group, groupKey) {
            var $group = $('<div></div>');
            $group.addClass('group');

            var $dex = $('<div></div>');
            $dex.html(groupKey.toUpperCase());
            $dex.addClass('rolodex');

            $group.append($dex);

            _.each(group, function(soundInfo) {
                var $sound = $('<div></div>');
                $sound.addClass('sound');
                $sound.html(soundInfo.key.replace(mp3Regex, ''));
                $sound.data('key', soundInfo.key);
                $sound.data('url', soundInfo.url);
                $group.append($sound);
            });

            $list.append($group);
        });

        $list.on('click', '.sound', function() {
            if (!$(this).data('preview')) {
                var key = $(this).data('key');
                $.ajax('/sound/' + key);
            } else {
                $(this).data('preview', false);
            }
        });

        $list.on('mousedown touchstart', '.sound', function() {
            var $this = $(this);
            preload($this.data('url'));

            clearTimeout(playbackTimer);
            playbackTimer = setTimeout(function() {
                $this.data('preview', true);
                preview($this.data('url'));
            }, 1000);
        });

        $list.on('mouseup touchend mouseleave touchcancel', '.sound', function() {
            clearTimeout(playbackTimer);
            endPreview();
        });

        var $ultrabox = $('#ultrabox');
        ultralist = _.map(list, function(item) {
            return {key: item.key};
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
            },
            templates: {
                empty: [
                  '<div class="empty-message">',
                  'No sound match, text will be spoken.',
                  '</div>'
                ].join('\n')
            }
        });

        $ultrabox.on('typeahead:selected typeahead:autocompleted', function() {
            /* selected or autocompleted */
            var val = $(this).val();
            $voice.toggle(!matchesSound(val));
        });

        $ultrabox.on('keyup', function(evt) {
            var val = $(this).val();
            if (evt.which === 13) { //ENTER
                sendRequest(val);
                $(this).typeahead('val','');
                $(this).typeahead('close');
                $voice.show();
            } else {
                $voice.toggle(!matchesSound(val));
            }

        });

        $ultrabox.focus();

    });

    function matchesSound(val) {
        val = val.toLowerCase();
        return _.find(ultralist, function(item) {
            return item.key.toLowerCase() === val;
        });
    }

    function sendRequest(val) {
        var soundMatch = matchesSound(val);

        if (soundMatch) {
            $.ajax('/sound/' + val);
        } else if (val) {
            $.ajax({
                url: '/speech',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({text:val, voice: $voice.val() || "Alex"})
            });
        }
    }

    function preload(url) {
        endPreview();
        player.setAttribute("src", url);
    }

    function preview(url) {
        endPreview();
        player.play();
    }

    function endPreview() {
        player.pause();
    }

});
