var Class = require('../../lib/class').Class;
var Controller = require('../../lib/controller').Controller;

var Groups = Class.extend(Controller, {

	ajax_fetch: function() {
		var ids = this.$req.body;
		var groups = this.$models.groups.filter(function(group) {
			return ids.indexOf(group.get('id')) !== -1;
		});
		this.$res.writeHead(200, {'Content-type': 'application/json'});
		this.$res.write(JSON.stringify(groups));
		this.$res.end();
	},

	ajax_list: function() {
		var page = this.$req.body.page || 0;
		var count = Math.min(100, Math.max(0, Number(this.$req.body.count) || 10));

		var length = this.$models.groups.length;
		var start = page * count;
		var end = start + count;
		var groups = this.$models.groups.slice(start, end);

		var ids = groups.map(function(group) {
			return group.get('id');
		});
		var data = {
			length: length,
			pages: Math.ceil(length / count),
			page: page,
			docs: ids,
		};

		this.$res.writeHead(200, {'Content-type': 'application/json'});
		this.$res.write(JSON.stringify(data));
		this.$res.end();
	},

});
module.exports.Groups = Groups;
