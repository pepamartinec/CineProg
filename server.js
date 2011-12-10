var repl     = require("repl"),
    CineProg = require('./src/CineProg.js');

// init program cache
var program = new CineProg.Program();

var cinemas = ['CinemaCity', 'CineStar'];

// register & init cinemas
CineProg.registerCinemas( cinemas );

console.log( '-- initializing cinemas', cinemas );
CineProg.initCinemas( cinemas, program, function() {
	console.log( '-- cinemas initialized' );
	
	var r = repl.start( '> ' );
	r.context.CineProg = CineProg;
	r.context.program  = program;
});