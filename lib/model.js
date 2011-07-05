var Class = require('./class').Class;
var Set = require('./set').Set;

var util = require('util');
var _ = require('underscore');

var Model = Class.create({
	default: { },
	data: null,
	name: null,

	constructor: function(data) {
		this.data = {}
		this.set(this.default);
		if (data) {
			this.set(data);
		}
	},

	set: function(key, val) {
		if (arguments.length == 2) {
			Set.set(this.data, key, val);
		} else {
			var data = key;
			for (key in data) {
				val = data[key];
				this.set(key, val);
			}
		}
	},

	get: function(path) {
		return Set.get(this.data, path);
	},

	inspect: function() {
		return "<Model " + this.name + "> " + util.inspect(this.toObject());
	},

	toObject: function() {
		return _.clone(this.data);
	},
	toJSON: function() {
		return this.toObject();
	},

});

module.exports.Model = Model;
