var connect = require('connect');
var fs = require('fs');
var path = require('path');

var port = 1357;

var Application = require('./app').Application;
var app = new Application();

var server = connect.createServer(
	connect.static(path.join(__dirname, '..', 'build')),
	connect.bodyParser(),
	function() { app.handle.apply(app, arguments); }
).listen(port);

console.log("Listening on", port);
