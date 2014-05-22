var config = require('config');
var knox = require('knox');
var unda = require('underscore');

var s3client = knox.createClient({
    key: config.s3.key,
    secret: config.s3.secret,
    bucket: config.s3.bucket
    , endpoint: 's3-us-west-2.amazonaws.com' //Temporary
});

var error = {error: true};
var list = null;
var parseListData = function(data) {
    /* `data` will look roughly like:

        {
            Prefix: 'my-prefix',
            IsTruncated: true,
            MaxKeys: 1000,
            Contents: [
              {
                Key: 'whatever'
                LastModified: new Date(2012, 11, 25, 0, 0, 0),
                ETag: 'whatever',
                Size: 123,
                Owner: 'you',
                StorageClass: 'whatever'
              },
              ⋮
            ]
        }

    */

    var contents = data.Contents,
        list = null;
    if (contents && contents.length > 0) {
        list = [];
        unda.forEach(contents, function(item, index) {
            list.push({
                key: item.Key,
                url: s3client.http(item.Key)
            });
        });
    }
    return list;
};

exports.getList = function(callback, refresh) {
    if (!list || refresh) {
        s3client.list(function(err, data){
            if (!err) {
                list = parseListData(data);
                callback(null, list || []);
            } else {
                callback(err);
            }
        });
    } else {
        callback(null, list);
    }
};

exports.refreshList = function(callback) {
    exports.getList(callback, true);
};
