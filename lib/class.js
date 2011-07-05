var _ = require('underscore');

var Class = module.exports.Class = {
	const: 'constructor',

	create: function(proto, static) {
		return Class.extend(null, proto, static);
	},

	extend: function(super, proto, static) {
		var con = null;
		if (proto && proto.hasOwnProperty(Class.const)) {
			con = proto[Class.const];
		} else if (super && super.prototype[Class.const]) {
			con = function() {
				super.prototype[Class.const].apply(this, arguments);
			};
		} else {
			con = function() {};
		}

		// Set the prototype and static methods
		_.extend(con.prototype, proto || {});
		_.extend(con, static || {});

		// Set the prototype.__proto__ to the supers prototype, if a super was supplied
		if (super) { con.prototype.__proto__ = super.prototype }

		return con;
	}
};
