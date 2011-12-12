var Cinema  = require('./Cinema.js'),
    ProgramCache = require('./ProgramCache.js'),
    doCallback = require('./utils.js').doCallback,
    rdfstore = require('rdfstore'),
    asyncblock  = require('asyncblock');

var cinemasRegistry = {};

var dataStore = rdfstore.create();

/**
 * Defines new program loaders
 * 
 * @public
 * @param {Cinema} cinemas
 */
var registerCinemas = function( cinemas, callback )
{
	asyncblock( function( flow ) {		
		for( var i = 0, cl = cinemas.length; i < cl; ++i ) {
			var cinema = cinemas[ i ];
			
			if( typeof cinema === 'string' ) {
				cinema = require( './cinemas/'+ cinema +'.js' );
			}
			
			if( cinema instanceof Cinema === false ) {
				throw "Invalid cinema "+ cinema;
			}
			
			cinemasRegistry[ cinema.name ] = cinema;
			
			console.log( '   - starting initialization of '+ cinema.name +' loader' );
			cinema.init( function() {
				var flowCb  = flow.add(),
				    lCinema = cinema;
				
				return function() {
					console.log( '   - '+ lCinema.name +' loader initialized' );
					cinema.register( dataStore, flowCb );
				};
			}() );
		}
		
		flow.wait();
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
	if( cinemasRegistry[ cinemaName ] == null ) {
		throw "Invalid cinema name '"+ cinemaName +"'";
	}
	
	var place = cinemasRegistry[ cinemaName ].getPlace( placeName );
	
	if( place == null ) {
		throw "Invalid place name '"+ placeName +"' for "+ cinemaName +" cinema";
	}
	
	console.log( "Loading "+ place.cinema.name +" - "+ place.name +" program for "+ date );
	
	place.loadProgram( date, dataStore, callback );
};

/**
 * 
 */
var search = function( query, callback )
{
	dataStore.execute( query, function( success, result ) {
		if( success ) {
			doCallback( callback, [ result ]);
			
		} else {
			throw new Error( result );
		}
	});
};

// export public items
exports.Cinema          = Cinema;
exports.registerCinemas = registerCinemas;
exports.loadProgram     = loadProgram;
exports.search          = search;