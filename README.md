Soundboard Server
=================

A sound board in the cloud. Uses S3 and sockets to tell remote clients (hooked up to speakers) when to play sound or speak text. Currently the full clients have to be on OS X, but a simpler Insta-Client(tm) is made available at `/insta-client`.

Quick Setup
-----------

Needs these ENV variables:

  - `S3_KEY` - Amazon S3 access key
  - `S3_SECRET` - Amazon S3 secret
  - `SB_USER` - username if basic auth is enabled
  - `SB_PASS` - the md5 hash of a password if basic auth is enabled
  - `API_KEY` - an arbitrary API key for API requests. (TODO, make this dynamic)

With bower and npm installed run:

`bower install`
`npm install`
`npm start`

Pro tip: Use forever - `forever start server.js`


Insta-Client
------------

When a user visits `/insta-client` they can connect their browser to the server and on more modern browsers (Chrome!) the sounds will play and the voice will speak.


API
---

There is currently a very limited API, and more will be documented later. Browsing the code will reveal the basics, though.

