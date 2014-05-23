$(function() {
    var player = $('#player')[0];

    var $speak = $('#speak');
    $speak.on('click', function() {
        var text = $('#speech-text').val();
        if (text) {
            $.ajax({
                url: '/speech',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({text:text, voice:"Victoria"})
            });
        }
    });

    $.ajax('/sound/list').done(function(list) {
        var $list = $('#sound-list');

        _.each(list, function(soundInfo) {
            var sound = $('<div></div>');
            sound.addClass('sound');
            sound.html(soundInfo.key);
            sound.data('key', soundInfo.key);
            sound.data('url', soundInfo.url);

            $list.append(sound);
        });

        $list.on('click', '.sound', function() {
            endPreview();
            var key = $(this).data('key');
            $.ajax('/sound/' + key);
        });

        $list.on('mouseover', '.sound', function() {
            preview($(this).data('url'));
        });

        $list.on('mouseout', '.sound', function() {
            endPreview();
        });
    });

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
