$(function() {
    var player = $('#player')[0];
    var ultralist = null;
    var mp3Regex = /\.mp3/gi;
    var playbackTimer = null;

    $.ajax('/sound/list').done(function(list) {
        var $list = $('#sound-list');

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
        });

        $ultrabox.on('keypress', function(evt) {
            if (evt.which === 13) { //ENTER
                var val = $(this).val();
                sendRequest(val);
                $(this).val('');
                $(this).typeahead('close');
            }
        });

        $ultrabox.on('blur', function() {
            $(this).val('');
        });

        $ultrabox.focus();

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
