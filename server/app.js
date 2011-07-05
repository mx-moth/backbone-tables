var Class = require('../lib/class').Class;
var Router = require('../lib/router').Router;
var data = require('./data');

var perPage = 10;

var controllers = {
	'users': require('./controllers/users').Users,
	'groups': require('./controllers/groups').Groups,
};

var Application = Class.create({

	/**
	 * Create a new Application
	 */
	constructor: function() {
		this.models = data.create();
		this.router = new Router([
			['/ajax/{controller}/{action}', {action: 'ajax_{action}'}],
			['/ajax/{controller}', {action: 'ajax'}],
		]);
	},

	handle: function(req, res, next) {

		var location = this.router.getLocation(req.url);
		console.log(req.method, req.url, location);
		var Controller = controllers[location.controller];
		if (!Controller) return next();

		var controller = new Controller(this);
		controller.handle(location, req, res, next);

	},

});

module.exports.Application = Application;
