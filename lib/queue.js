var Class = require('./class').Class;

var events = require('events');

var Queue = Class.extend(events.EventEmitter, {
	outstanding: 0,

	done: false,

	constructor: function() { this.outstanding = 1; },

	queue: function() { this.outstanding++; },

	dequeue: function() { --this.outstanding || this.empty(); },

	empty: function() {
		if (this.done) return;
		this.done = true;
		this.outstanding = 0;
		this.emit('empty', null);
	},

	error: function(err) {
		if (this.done) return;
		this.done = true;
		this.emit('empty', err);
	},
});

module.exports.Queue = Queue;
