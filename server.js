var repl     = require("repl"),
    CineProg = require('./src/CineProg.js');

// register & init cinemas
var cinemas = ['CinemaCity','CineStar'];

console.log( '-- initializing cinemas', cinemas );
CineProg.registerCinemas( cinemas, function() {
	console.log( '-- cinemas initialized' );
	
	CineProg.loadProgram( 'CineStar', 'plzen', new Date(), function() { console.log('done!!!'); } );
	
	var r = repl.start( '> ' );
	r.context.CineProg = CineProg;
});