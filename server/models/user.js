var Class = require('../../lib/class').Class;
var Model = require('../../lib/model').Model;
var Queue = require('../../lib/queue').Queue;

var crypto = require('crypto');
var step = require('step');
var _ = require('underscore');

var User = Class.extend(Model, {

	name: 'User',

	default: {
		id: '',
		name: '',
		email: '',
		groups: [],
	},

	constructor: function() {
		Model.apply(this, arguments);
	},

});

module.exports.User = User;
