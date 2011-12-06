var CineProg = require('./src/CineProg.js');

CineProg.initLoaders( ['CinemaCity','CineStar'], function() {
	CineProg.loadProgram( 'CineStar', 'plzen', new Date('2011-11-29T00:00:00'), function( program ) {
		console.log(program);
	});
});
