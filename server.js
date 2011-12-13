var http     = require('http'),
	url      = require('url'),
	Server   = require('./src/Server.js');
    CineProg = require('./src/CineProg.js');




// register & init cinemas
var cinemas = ['CinemaCity','CineStar'];

CineProg.init( cinemas, function() {	
	// run server
	Server.listen( 8080 );
	console.log('- server online');
});