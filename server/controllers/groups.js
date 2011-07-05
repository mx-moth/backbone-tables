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

});
module.exports.Groups = Groups;
