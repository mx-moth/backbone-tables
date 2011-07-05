(function() {
	/**
	 * Checks a value to see if it is an array or not
	 *
	 * Parameters:
	 *   val - The value to check
	 *
	 * Returns:
	 * True if the value is an array, false otherwise
	 *
	 * See:
	 * <https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray>
	 */
	if (!Array.isArray) Array.isArray = (function(){
		var builtInToString = Object.prototype.toString; // save a reference built-in Object.prototype.toString
		var builtInToCall = Function.prototype.call; // save a reference to built-in Function.prototype.call
		var callWithArgs = builtInToCall.bind(builtInToCall); // requires a built-in bind function, not a shim

		var argToString = function(o){
			return callWithArgs(builtInToString, o);
		};

		return function(o) {
			return argToString(o) === '[object Array]';
		};
	})();

	/**
	 * Wraps a value in an array, if it is not already an array
	 *
	 * Parameters:
	 *   val - A value to coerce to an array
	 *
	 * Returns:
	 * An array, either the original value if it is an array, or a new
	 * array with its first and only item being the value passed in
	 */
	if (!Array.from) Array.from = function(val) {
		return Array.isArray(val) ? val : [val];
	};
})();
