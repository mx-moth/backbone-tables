var Set = function() {
	throw new Error('Set is not instansiable');
}

Set.get = function(obj, path) {
	if (path == '') { return obj; }

	var bits = path.split('.');
	var bit;

	while (bits.length && obj) {
		obj = obj[bits.shift()];
	}

	return obj;
};

Set.set = function(obj, path, data) {
	var bits = path.split('.');
	var destination = bits.pop();
	var bit;

	while (bits.length) {
		bit = bits.shift();
		if (typeof obj[bit] === 'undefined') {
			obj[bit] = {};
		}
		obj = obj[bit];
	}

	obj[destination] = data;

	return Set;
};

module.exports.Set = Set;
