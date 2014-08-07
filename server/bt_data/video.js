
var Datastore = require('nedb');

module.exports = function(config,db){

	/*

		Data Helpers!
		All data bits should be 3-letter variables, To keep size marginally lower.

		// AUTO
		dcr = Date Created, Int UTC Timestamp
		dmo = Date modified, Int UTC Timestamp

		// REQUIRED
		tit = Title, String
		vid = Video Embed ID, String
		pro = Video Provider, String

	*/
	return function(video_id,callback){

		this.data = {};

		this.save = function(callback){

			// Catch null saves
			if(typeof this.data == "undefined"){ this.init({}); }

			// Is this a new record, or an existing one?
			if(typeof this._id == 'undefined'){
				this.data.dcr = new Date().getTime();
				db.insert(this.data, function (err, newDoc) {
					if (err) {
						console.log(err);
						return;
					}
					this._id = newDoc._id;
					if(callback) callback(err, newDoc);
				});
			} else {
				this.data.dmo = new Date().getTime();
				db.update({ _id: this._id }, this.data, {}, function (err, numReplaced) {
					if(callback) callback(err, numReplaced);
				});
			}

		}

		this.load = function(id,callback){
			var self = this;
			db.findOne({ _id: id }, function (err, doc) {
				if(!doc) self.init({});
				else self.init(doc);
				if(callback) callback(err);
			});
		}

		this.delete = function(callback){
			db.remove({ _id: this._id }, {}, function (err, numRemoved) {
				if(callback) callback(err);
			});
		}

		this.init = function(video_base){

			this._id = video_base._id;			// DB ID
			this.data = {} 						// Flat-able data
			for(var i in video_base){
				this.data[i] = video_base[i];
			}

			// Ensure required data
			if(typeof this.data.tit == "undefined") { console.error(" Videos Require Titles (tit) "); this.data.tit = "Cades <3 Lavender"; }
			if(typeof this.data.vid == "undefined") { console.error(" Videos Require Embed IDs (vid) "); this.data.vid = "QIFn0wqZx7Y"; }
			if(typeof this.data.pro == "undefined") { console.error(" Videos Require Providers (pro) "); this.data.pro = "youtube"; }

		}

		if(video_id) this.load(video_id,callback); // Run normal init

	}

}
