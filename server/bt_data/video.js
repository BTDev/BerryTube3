module.exports = function(config){

	var Datastore = require('nedb');
	var db = new Datastore({ filename: config.dbinfo.video_db_path, autoload: true });

	return function(video_base){

		this.save = function(callback){
			// Is this a new record, or an existing one?
			if(typeof this._id == 'undefined'){
				db.insert(this.data, function (err, newDoc) {
					this._id = newDoc._id;
					if(callback) callback(err, newDoc);
				});
			} else {
				db.update({ _id: this._id }, this.data, {}, function (err, numReplaced) {
					if(callback) callback(err, numReplaced);
				});
			}

		}

		this.load = function(id,callback){
			var self = this;
			db.findOne({ _id: id }, function (err, doc) {
				//console.log("found",doc);
				self.init(doc);
				if(callback) callback(err);
			});
		}

		this.init = function(video_base){
			this._id = video_base._id;			// DB ID
			this.data = {} // Flat-able data
			this.data.vid = video_base.vid;		// Video ID
			this.data.pro = video_base.pro;		// Provider
			this.data.len = 0;							// Length in seconds
			this.data.tit = "I <3 Lavender";			// Title
			//console.log("Video initialized",this);
		}

		if(video_base) this.init(video_base); // Run normal init

	}

}
