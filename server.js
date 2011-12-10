var repl     = require("repl"),
    CineProg = require('./src/CineProg.js');

// register & init cinemas
var cinemas = ['CinemaCity'];

CineProg.registerCinemas( cinemas );

console.log( '-- initializing cinemas', cinemas );
CineProg.initCinemas( cinemas, function() {
	console.log( '-- cinemas initialized' );
	
	var cb = function() { console.log(arguments); };
	var lp = function() { CineProg.loadProgram( 'CinemaCity', 'flora', new Date(), cb ); };
	
	lp();
	
	var r = repl.start( '> ' );
	r.context.CineProg = CineProg;
	r.context.program  = program;
	

});