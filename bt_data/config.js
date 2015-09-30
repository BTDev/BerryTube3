var settings = {}

// Database Config
settings.dbinfo = {}
settings.dbinfo.uri = 'mongodb://localhost:27017/bt';

// Playlist Config
settings.playlist = {};

settings.playlist.prevideo = 3000;
settings.playlist.postvideo = 2000;

// SSL / HTTPS Config
settings.ssl = {};
settings.ssl.key = 'ssl/berrytube.key';
settings.ssl.cert = 'ssl/berrytube.pem';

// DONE
module.exports = settings;
