var Cinema  = require('./Cinema.js'),
    ProgramCache = require('./ProgramCache.js'),
    doCallback = require('./utils.js').doCallback;

var cinemasRegistry = {};
var programCache = new ProgramCache();

/**
 * Returns cinema instance
 * 
 * @private
 * @param {Stirng} cinema
 */
var getCinema =  function( cinema )
{
	return cinemasRegistry[ cinema ];
};

/**
 * Defines new program loaders
 * 
 * @public
 * @param {Cinema} cinemas
 */
var registerCinemas = function( cinemas )
{
	var cinema,
	    names = [];
	
	for( var i = 0, cl = cinemas.length; i < cl; ++i ) {
		cinema = cinemas[ i ];
		
		if( typeof cinema === 'string' ) {
			cinema = require( './cinemas/'+ cinema +'.js' );
		}
		
		if( cinema instanceof Cinema === false ) {
			throw "Invalid cinema "+ cinema;
		}
		
		cinemasRegistry[ cinema.name ] = cinema;
		names.push( cinema.name );
	}
};


/**
 * Initializes supplied loaders
 * 
 * @public
 * @param {Array}    loaderNames list of loader names
 * @param {Function} callback    done callback
 */
var initCinemas = function( cinemas, callback )
{
	var loadersNo = cinemas.length;
	
	for( var i = 0, cl = cinemas.length; i < cl; ++i ) {
		var name   = cinemas[ i ],
		    cinema = getCinema( name );
				
		if( cinema == null ) {
			throw "Invalid cinema '"+ name +"'";
		}
		
		console.log( '   - starting initialization of '+ name +' loader' );
		cinema.init( function() {
			var lName = name;
			
			return function() {
				console.log( '   - '+ lName +' loader initialized' );
				
				if( --loadersNo === 0 ) {
					doCallback( callback );
				}
			};
		}() );
	}
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
	
	programCache.loadProgram( place, date, callback );
};

/**
 * 
 */
var search = function( filterFn )
{
	return programCache.search( filterFn );
};

// export public items
exports.Cinema          = Cinema;
exports.registerCinemas = registerCinemas;
exports.initCinemas     = initCinemas;
exports.loadProgram     = loadProgram;
exports.search          = search;

// !!! DEBUG !!!
exports.cinemas = cinemasRegistry;
exports.cache   = programCache;