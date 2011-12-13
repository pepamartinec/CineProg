var restify  = require('restify'),
    db       = require('./CineProg.js').db;
    

var server = restify.createServer({
	serverName : 'CineProg',
	vesrion    : '0.1.0'
});

module.exports = server;

// ========== UTILITY FUNCTIONS ==========

function checkRequiredParameters( params, requiredList, res )
{
	var missingParams = [],	
	    paramName;
	
	for( var i = 0, rl = requiredList.length; i < rl; ++i ) {
		paramName = requiredList[ i ];
		
		if( params[ paramName ] == null || params[ paramName ].length === 0 ) {
			missingParams.push( paramName );
		}
	}
	
	if( missingParams.length === 0 ) {
		return true;
		
	} else {
		res.send( 400, 'Missing parameters: '+ missingParams.join(', ') );
		return false;
	}
}

function applyDefaultParameters( params, defaults )
{
	for( var idx in defaults ) {		
		if( params[ idx ] == null || params[ idx ].length === 0 ) {
			params[ idx ] = defaults[ idx ];
		}
	}	
}

function parseDateParam( value, adjust )
{
	var time = Date.parse( value );
		
	if( isNaN( time ) ) {
		return null;
	}
	
	return new Date( time );
}

function adjustDateParam( date, adjust )
{
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	
	if( adjust == 'higher' ) {
		date.setDate( date.getDate() + 1 );
	}
}

//========== REQUEST HANDLERS ==========

server.get( '/events/:id', function( req, res )
{
	var id = req.uriParams.id;
	
	if( id == null ) {
		res.send( 400, { message: 'Invalid event ID: '+id } );
		return;
	}
	
	db.getEvent( id, function( event ) {
		if( event == null ) {
			res.send( 400, { message: 'Invalid event ID: '+id } );
			return;			
		}
		
		res.send( 200, event.toJson() );
	});
});

server.get( '/cinemas', function( req, res )
{
	db.findCinemas( '?', [ 1 ], function( error, results ) {
		var data = [];
		
		for( var i = 0, rl = results.length; i < rl; ++i ) {
			data = data.concat( results[i].toJson() );
		}
		
		res.send( 200, data );
	});
});

server.get( '/cinemas/:id', function( req, res )
{
	var id = req.uriParams.id;
	
	if( id == null ) {
		res.send( 400, { message: 'Invalid cinema ID: '+id } );
		return;
	}
	
	db.getCinema( id, function( error, cinema ) {
		if( cinema == null ) {
			res.send( 400, { message: 'Invalid cinema ID: '+id } );
			return;			
		}
		
		res.send( 200, cinema.toJson() );
	});
});

server.get( '/movies/:id', function( req, res )
{
	var id = req.uriParams.id;
	
	if( id == null ) {
		res.send( 400, { message: 'Invalid movie ID: '+id } );
		return;
	}
	
	db.getMovie( id, function( error, movie ) {
		if( movie == null ) {
			res.send( 400, { message: 'Invalid movie ID: '+id } );
			return;			
		}
		
		res.send( 200, movie.toJson() );
	});
});



server.get( '/search', function( req, res )
{
	var params = req.params;
	
	switch( params.type ) {
		// search cinema program
		case 'cinema':
			// check required parameters
			var requiredParams = ['cinema','branch'];			
			if( checkRequiredParameters( params, requiredParams, res ) === false ) {
				return;
			}
			
			// parse dates
			params.startDate = parseDateParam( params.startDate );
			params.endDate   = parseDateParam( params.endDate );
			
			// apply defaults
			var defaultParams = {
				startDate : new Date(),
				endDate   : new Date()
			};
			applyDefaultParameters( params, defaultParams );
			
			// location
			var queryFilter = 'location_ID IN ( SELECT ID FROM cinemas_branches WHERE code_name = ? AND cinema_ID IN ( SELECT ID FROM cinemas WHERE code_name = ? ) )',
			    queryData   = [ params.branch, params.cinema ];
			
			// startDate
			var startDate = params.startDate;
			adjustDateParam( startDate, 'lower' );
			
			queryFilter += ' AND start_date >= ?';
			queryData.push( startDate.getTime() );
			
			
			// endDate
			var endDate = params.endDate;
			adjustDateParam( endDate, 'higher' );
			
			queryFilter += ' AND start_date < ?';
			queryData.push( endDate.getTime() );
			
			// movie
			if( params.movie ) {
				queryFilter += ' AND name = ?';
				queryData.push( params.movie );
			}
			
			queryFilter += ' ORDER BY start_date ASC';
			
			console.log(queryFilter, queryData);
			db.findEvents( queryFilter, queryData, function( error, results ) {
				if( error ) {
					res.send( 500, 'Something bad happened..' );
					throw error;
				}
				
				var data = [];
				for( var i = 0, rl = results.length; i < rl; ++i ) {
					data.push( results[i].toJson() );
				}
				
				res.send( 200, data );
			});
			
			break;
		
		// find movie play-times
		case 'movie':
			// check required parameters
			var requiredParams = ['movie'];			
			if( checkRequiredParameters( params, requiredParams, res ) === false ) {
				return;
			}
			
			// parse dates
			params.startDate = parseDateParam( params.startDate );
			params.endDate   = parseDateParam( params.endDate );
			
			// apply defaults
			var defaultParams = {
				startDate : new Date(),
				endDate   : new Date()
			};
			applyDefaultParameters( params, defaultParams );
			
			// location
			var queryFilter = 'name LIKE ?',
			    queryData   = [ '%'+params.movie+'%' ];
			
			// startDate
			var startDate = params.startDate;
			adjustDateParam( startDate, 'lower' );
			
			queryFilter += ' AND start_date >= ?';
			queryData.push( startDate.getTime() );
			
			
			// endDate
			var endDate = params.endDate;
			adjustDateParam( endDate, 'higher' );
			
			queryFilter += ' AND start_date < ?';
			queryData.push( endDate.getTime() );
			
			console.log(queryFilter, queryData);
			db.findEvents( queryFilter, queryData, function( error, results ) {
				if( error ) {
					res.send( 500, 'Something bad happened..' );
					throw error;
				}
				
				var data = [];
				for( var i = 0, rl = results.length; i < rl; ++i ) {
					data.push( results[i].toJson() );
				}
				
				res.send( 200, data );
			});
			break;
			
		default:
			res.send( 400, 'Invalid parameter "type:'+params.type+'"' );
			return;
	}
});

server.get( '/load', function( req, res )
{
	var p = req.params;
	
	CineProg.loadProgram( p.cinema, p.place, new Date( p.date ), function() {
		res.send( 200 );		
	});
});

server.get( '/loadProgram', function( req, res )
{
	var p = req.params;
	
	try {
		CineProg.loadProgram( p.cinema, p.branch, new Date( p.date ), function( evtsCount ) {
			res.send( 200, { message: 'OK, '+ evtsCount +' events loaded' } );		
		});
		
	} catch( e ) {
		res.send( 400, { message: 'Invalid parameters' } );
	}
});