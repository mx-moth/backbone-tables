var Class = require('../../lib/class').Class;
var Model = require('../../lib/model').Model;
var Queue = require('../../lib/queue').Queue;

var crypto = require('crypto');
var step = require('step');
var _ = require('underscore');

var Group = Class.extend(Model, {

	name: 'Group',

	default: {
		id: '',
		name: '',
		users: [],
	},

	constructor: function() {
		Model.apply(this, arguments);
	},

});

module.exports.Group = Group;
