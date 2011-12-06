var http = require('http'),
    repl = require("repl"),
    CineProg = require('./src/CineProg.js');

var program = new CineProg.Program();

console.log('-- initializing loaders');
CineProg.initCinemas( ['CinemaCity','CineStar'], program, function() {
	console.log('-- loaders initialized');
	
	var r = repl.start( '> ' );
	r.context.CineProg = CineProg;
	r.context.program  = program;
});


http.createServer( function ( req, res ) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen( 1337, "127.0.0.1" );
