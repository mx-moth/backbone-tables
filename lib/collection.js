var Class = require('./class').Class;
var _ = require('underscore');

var Collection = Class.create({
	options: {},
	data: [],

	/**
	 * Constructor: Collection
	 *
	 * Create a new Collection
	 *
	 * Parameters:
	 *   name - The name of the collection
	 *   options - Options for this instance
	 */
	constructor: function(name, options) {
		this.name = name;
		this.options = _.extend({}, this.options, options);
		this.data = [];

		this.__defineGetter__('length', function() {
			return this.data.length;
		});
	},

	inspect: function() {
		return "<Collection " + this.name + " [#" + this.data.length + "]>";
	},

	toJSON: function() {
		return this.data.map(function(datum) { return datum.toJSON(); });
	},

	getList: function(page, count) {
		var response = {};
		var docs = this.data.users.data.splice(page * perPage, perPage);
		response.page = data.page || 0;
		response.count = this.data.users.data.length;
		response.ids = docs.map(function(doc) { return doc.get('id'); });
		return response;
	},
});

// Add all Array methods to the collection
var methods = ['push', 'pop', 'shift', 'unshift', 'filter', 'forEach', 'reduce', 'splice', 'slice'];
for (var i = 0, l = methods.length; i < l; i++) {
	(function(method) {
		Collection.prototype[method] = function() {
			return this.data[method].apply(this.data, arguments);
		}
	})(methods[i]);
}

module.exports.Collection = Collection;
