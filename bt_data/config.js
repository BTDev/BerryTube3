var settings = {}

// Database Config
settings.dbinfo = {}

settings.dbinfo.user = {};
settings.dbinfo.user.path = './db/users.db';
settings.dbinfo.user.aci = 1000 * 60 * 5;

settings.dbinfo.playlist = {};
settings.dbinfo.playlist.path = './db/playlist.db';
settings.dbinfo.playlist.aci = 1000 * 60 * 5;

settings.dbinfo.video = {};
settings.dbinfo.video.path = './db/videos.db';
settings.dbinfo.video.aci = 1000 * 60 * 5;

module.exports = settings;
