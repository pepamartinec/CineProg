var Program = require('./Program.js'),
    Cinema  = require('./Cinema.js'),
    doCallback = require('./utils.js').doCallback;

var cinemasRegistry = {};

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
var initCinemas = function( cinemas, program, callback )
{
	var loadersNo = cinemas.length;
	
	for( var i = 0, cl = cinemas.length; i < cl; ++i ) {
		var name   = cinemas[ i ],
		    cinema = getCinema( name );
				
		if( cinema == null ) {
			throw "Invalid cinema '"+ name +"'";
		}
		
		console.log( '   - starting initialization of '+ name +' loader' );
		cinema.init( program, function() {
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
var loadProgram = function( cinema, place, date, program, callback )
{
	if( cinemasRegistry[ cinema ] == null ) {
		throw "Invalid loader name '"+ loaderName +"'";
	}
	
	console.log( "Loading "+ cinema +" - "+ place +" program on "+ date );
	
	cinemasRegistry[ cinema ].loadProgram( place, date, program, callback );
};

// export public items
exports.Program         = Program;
exports.Cinema          = Cinema;
exports.registerCinemas = registerCinemas;
exports.initCinemas     = initCinemas;
exports.loadProgram     = loadProgram;
