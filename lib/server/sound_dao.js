var config = require('config');
var knox = require('knox');
var unda = require('underscore');

var s3client = knox.createClient({
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: config.s3.bucket
});

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

        list = unda.sortBy(list, function(item) {
            return item.key.toLowerCase();
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
