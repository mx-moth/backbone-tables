var Class = require('./class').Class;
var _ = require('underscore');

var Router = Class.create({
	patterns: {
		controller: '([a-zA-Z0-9._-]+)',
		action: '([a-zA-Z0-9._-]+)',
		string: '([^\\/]*)',
		slug: '([^\\/]*)',
		num: '(-?(?:\\d+\.?)\\d+)',
		id: '([0-9a-f]{24})'
	},

	extensions: ['html', 'json', 'xml'],
	moustache: /\{(?:[a-zA-Z0-9._-]+:)?([a-zA-Z0-9._-]+)\}/g,
	connections: null,
	connectionsR: null,
	defaultLocation: {
		controller: null,
		action: null,
		arguments: []
	},
	constructor: function(routes) {
		this.connections = [];
		this.connectionsR = [];

		routes && routes.forEach(function(route) {
			this.connect.apply(this, route);
		}, this);

		this.extensionsRegExp = new RegExp("^(.*)\\.(" + (this.extensions.join('|')) + ")$");
	},
	getLocation: function(url) {
		var bit, bits, extension, location, match, tail, _i, _len, _name, _ref;
		if (url == null) {
			url = '';
		}
		location = false;
		extension = null;
		tail = [];
		if (match = url.match(this.extensionsRegExp)) {
			extension = match[2];
			url = match[1];
		}
		var self = this;
		this.connections.some(function(connection) {
			var i, key, matches, name, pattern, value, _len, _ref, _ref2;
			matches = connection.urlRegExp.exec(url);
			if (!matches) {
				return false;
			}
			location = _.extend({}, self.getDefaultLocation(), connection.location);
			i = 1;
			_ref = connection.namedMoustaches;
			for (name in _ref) {
				pattern = _ref[name];
				match = matches[i];
				for (key in location) {
					value = location[key];
					if (key === 'arguments') {
						continue;
					}
					location[key] = value.replace(name, match);
				}
				_ref2 = location.arguments;
				for (value = 0, _len = _ref2.length; value < _len; value++) {
					i = _ref2[value];
					location.arguments[i] = value.replace(name, match);
				}
				i = i + 1;
			}
			tail = matches[i] ? matches[i].split('/') : [];
			return true;
		});
		if (!location) {
			return false;
		}
		for (_i = 0, _len = tail.length; _i < _len; _i++) {
			bit = tail[_i];
			if (!bit) {
				continue;
			}
			if (bit.indexOf(':') !== -1) {
				bits = bit.split(':');
				if ((_ref = location[_name = bits[0]]) != null) {
					_ref;
				} else {
					location[_name] = bits[1];
				};
			} else {
				location.arguments.push(bit);
			}
		}
		if (!this.defaultLocation.controller) {
			this.defaultLocation.controller = location.controller;
		}
		if (!this.defaultLocation.action) {
			this.defaultLocation.action = location.action;
		}
		location.extension = extension;
		return location;
	},
	getUrl: function(location) {
		var connection, i, key, locationRegExp, locationUrl, matchConnectionBit, name, url, val, value, _i, _len, _len2, _ref, _ref2;
		location = _.extend({}, this.getDefaultLocation(), location);
		location.arguments = _.clone(location.arguments);
		matchConnectionBit = function(bit, match, url) {
			var i, matches, name, pattern, _ref;
			if (!url) {
				return false;
			}
			matches = match.pattern.exec(bit);
			if (!matches) {
				return false;
			}
			i = 1;
			_ref = match.namedMoustaches;
			for (name in _ref) {
				pattern = _ref[name];
				url = url.replace(name, matches[i++]);
			}
			return url;
		};
		url = null;
		_ref = this.connections;
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			connection = _ref[_i];
			locationUrl = connection.url;
			locationRegExp = _.extend({}, this.getDefaultLocation(), connection.locationRegExp);
			locationRegExp.arguments = _.clone(locationRegExp.arguments);
			if (location.arguments.length < locationRegExp.arguments.length) {
				continue;
			}
			if (!(_.all(locationRegExp, function(_, key) {
				return location[key] != null;
			}))) {
				continue;
			}
			for (key in locationRegExp) {
				value = locationRegExp[key];
				if (key === 'arguments') {
					continue;
				}
				locationUrl = locationUrl && matchConnectionBit(location[key], value, locationUrl);
			}
			_ref2 = locationRegExp.arguments;
			for (value = 0, _len2 = _ref2.length; value < _len2; value++) {
				i = _ref2[value];
				locationUrl = matchConnectionBit(location.arguments[i], value, locationUrl);
			}
			if (locationUrl === false) {
				continue;
			}
			location.arguments.splice(0, locationRegExp.arguments.length);
			for (key in locationRegExp) {
				if (key === 'arguments') {
					continue;
				}
				delete location[key];
			}
			if (location.arguments.length > 0) {
				location.arguments.unshift('');
			}
			locationUrl += location.arguments.join('/');
			delete location.controller;
			delete location.action;
			delete location.arguments;
			for (name in location) {
				val = location[name];
				locationUrl += "/" + name + ":" + val;
			}
			if (location.extension) {
				locationUrl += "." + location.extension;
			}
			return locationUrl;
		}
		return "";
	},

	connect: function(url, location, patterns) {
		var connection, formatLocationRegExp, getMoustaches, i, key, locationRegExp, moustache, name, namedMoustaches, pattern, route, urlRegExp, value, _i, _len, _len2, _ref;
		location = location || {};
		patterns = patterns || {};

		if (arguments.length === 1 && Array.isArray(arguments[0])) {
			arguments[0].forEach(function(route) {
				this.connect.apply(this, route);
			}, this);
			return this;
		}

		patterns = _.extend({}, patterns, this.patterns);
		moustache = this.moustache;
		namedMoustaches = {};
		getMoustaches = function(string) {
			var match, namedMatches;
			namedMatches = {};
			while ((match = moustache.exec(string)) !== null) {
				namedMatches[match[0]] = patterns[match[1]];
			}
			return namedMatches;
		};
		namedMoustaches = getMoustaches(url);
		urlRegExp = '^' + url + '(?:\/(.*))?$';
		for (name in namedMoustaches) {
			pattern = namedMoustaches[name];
			urlRegExp = urlRegExp.replace(name, pattern);
		}

		formatLocationRegExp = function(string, name, pattern) {

			var moustaches = getMoustaches(string);

			Object.keys(moustaches).forEach(function(name) {
				var pattern = moustaches[name];
				string = string.replace(name, pattern);
			});

			return {
				pattern: new RegExp("^" + string + "$"),
				namedMoustaches: moustaches
			};
		};

		location = _.extend({
			controller: '{controller}',
			action: '{action}',
			arguments: []
		}, location);

		locationRegExp = _.clone(location);

		for (key in locationRegExp) {
			if (key === 'arguments') continue;
			locationRegExp[key] = formatLocationRegExp(locationRegExp[key]);
		}

		locationRegExp.arguments.forEach(function(value, i) {
			locationRegExp.arguments[i] = formatLocationRegExp(value);
		});

		connection = {
			namedMoustaches: namedMoustaches,
			locationRegExp: locationRegExp,
			urlRegExp: new RegExp(urlRegExp),
			location: location,
			url: url
		};

		this.connections.push(connection);
		this.connectionsR.unshift(connection);

		return this;
	},
	getDefaultLocation: function() {
		return {
			controller: this.defaultLocation.controller,
			action: this.defaultLocation.action,
			arguments: []
		};
	},
});

module.exports.Router = Router;
