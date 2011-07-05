var Class = require('./class').Class;
var Controller = Class.create({
	constructor: function(app) {
		this.$app = app;
		this.$models = app.models;
	},

	handle: function(location, req, res, next) {
		this.$location = location
		this.$url = req.url;
		this.$req = req;
		this.$res = res;
		this.$next = next;

		if (this[location.action]) {
			this[location.action].apply(this, location.arguments);
		} else {
			next();
		}
	},
});

module.exports.Controller = Controller;
