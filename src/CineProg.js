var Cinema     = require('./Cinema.js'),
    Event      = require('./Event.js'),
    doCallback = require('./utils.js').doCallback,
    asyncblock = require('asyncblock'),
    db         = require('./Database.js');

/**
 * Defines new program loaders
 * 
 * @public
 * @param {String[]} cinemas
 * @param {Function} callback
 */
var registerCinemas = function( cinemas, callback )
{	
	asyncblock( function( flow ) {
		console.log( ' - initializing cinemas', cinemas );
		
		for( var i = 0, cl = cinemas.length; i < cl; ++i ) {
			var cinema = cinemas[ i ];
			
			if( typeof cinema === 'string' ) {
				cinema = require( './cinemas/'+ cinema +'.js' );
			}
			
			if( cinema instanceof Cinema === false ) {
				throw "Invalid cinema "+ cinema;
			}
			
			console.log( '  - initializing '+ cinema.name +' cinema' );
			cinema.init( function() {
				var flowCb  = flow.add(),
				    lCinema = cinema;
				
				return function() {
					console.log( '  - '+ lCinema.name +' cinema initialized' );
					lCinema.register( db, flowCb );
				};
			}() );
		}
		
		flow.wait();
		
		console.log( ' - cinemas initialized' );
		doCallback( callback );
	});
};

/**
 * Loads program by supplied criteria
 * 
 * @param {String}   cinema   cinema name
 * @param {String}   place    cinema place
 * @param {String}   date     program date
 * @param {Function} callback done callback
 */
var loadProgram = function( cinemaName, placeName, date, callback )
{
	db.findCinemas( '?', [ 1 ], function( error, cinemas ) {
		var cinema = null;
		
		for( var i = 0, cl = cinemas.length; i < cl; ++i ) {
			if( cinemas[i].codeName != cinemaName ) {
				continue;
			}
			
			cinema = cinemas[i];
			break;
		}
		
		if( cinema == null ) {
			throw "Invalid cinema name '"+ cinemaName +"'";
		}
		
		var place = cinema.getPlace( placeName );
		
		if( place == null ) {
			throw "Invalid place name '"+ placeName +"' for "+ cinemaName +" cinema";
		}
		
		console.log( "Loading "+ place.cinema.name +" - "+ place.name +" program for "+ date );
		
		place.loadProgram( date, db, callback );
	});
};

/**
 * Initializes CineProg module
 * 
 * @param {String[]} cinemas
 * @param {Function} callback
 */
var init = function( cinemas, callback )
{
	console.log( '- starting initialization' );

	db.init( function( error ) {
		if( error ) { throw Error; }
		
		console.log( ' - database ready' );
		
		registerCinemas( cinemas, function() {
			console.log( ' - cinemas ready' );
			console.log( '- initialization done' );
			
			doCallback( callback, arguments );
		});
	});
};

// export public items
exports.baseUri      = 'http://cineprog.local/';
exports.init         = init;
exports.loadProgram  = loadProgram;
exports.db           = db;