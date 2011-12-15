var sqlite     = require('sqlite3').verbose(),
    asyncblock = require('asyncblock'),
    doCallback = require('./utils.js').doCallback,
    Cinema     = require('./Cinema.js'),
    Event      = require('./Event.js');

var db = new sqlite.Database(':memory:');

var cinemas  = {},
    branches = {};


/**
 * Database initialization
 * 
 * @param {Function} callback
 */
db.init = function( callback )
{
	var queries = [
		"CREATE TABLE cinemas ( ID INTEGER PRIMARY KEY AUTOINCREMENT, code_name TEXT NOT NULL, name TEXT NOT NULL, url TEXT NULL );",
		"CREATE TABLE cinemas_branches ( ID INTEGER PRIMARY KEY AUTOINCREMENT, code_name TEXT NOT NULL, name TEXT NOT NULL, url TEXT NULL, cinema_ID INTEGER, FOREIGN KEY ( cinema_ID ) REFERENCES cinemas ( ID ) );",
		"CREATE TABLE events ( ID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, start_date INTEGER NOT NULL, location_URI TEXT, location_ID INTEGER, FOREIGN KEY ( location_ID ) REFERENCES cinemas_branches ( ID ) );"
	];
	
	asyncblock( function( flow ) {
		for( var i = 0, ql = queries.length; i < ql; ++i ) {
			db.run( queries[i], flow.add() );
		}
		
		flow.wait();
		doCallback( callback );
	});	
};

function refreshLocationsCache()
{
	for( var cIdx in cinemasRegistry ) {
		var cinema = cinemasRegistry[ cIdx ];
		
		for( var bIdx in cinema.branches ) {
			var branch = cinema.branches[ bIdx ];
			
			locationsCache[ branch.id ] = branch;
		}
	}	
}

function saveNewObject( object, query, data, callback )
{
	db.run( query, data, function( error ) {
		if( error == null ) {
			object.id = this.lastID;
		}
		
		doCallback( callback, arguments );
	});	
}

db.saveCinema = function( cinema, callback )
{
	var query = "INSERT INTO cinemas ( code_name, name, url ) VALUES ( ?, ?, ? )",
	    data = [ cinema.codeName, cinema.name, cinema.url ];
	
	saveNewObject( cinema, query, data, function() {
		cinemas[ cinema.id ] = cinema;
		
		doCallback( callback, arguments );
	});
};

db.getCinema  = function( id, callback )
{
	doCallback( callback, [ null, cinemas[ id ] ]);
};

db.saveBranch = function( branch, callback )
{
	var query = "INSERT INTO cinemas_branches ( code_name, name, url, cinema_ID ) VALUES ( ?, ?, ?, ? )",
	    data = [ branch.codeName, branch.name, branch.url, branch.cinema.id ];
	
	saveNewObject( branch, query, data, function() {
		branches[ branch.id ] = branch;
		
		doCallback( callback, arguments );
	});
};

db.getBranch  = function( id, callback )
{
	if( callback ) {
		doCallback( callback, [ null, branches[ id ] ]);
		
	} else {
		return branches[ id ];
	}
};

db.saveEvent = function( event, callback )
{
	var data  = [ event.name, event.startDate.getTime(), event.location.id ],
	    query = "INSERT INTO events ( name, start_date, location_ID ) VALUES ( ?, ?, ? )";
	
	saveNewObject( event, query, data, callback );
};

db.getEvent = function( id, callback )
{
	db.findEvents( 'ID = ?', [ id ], function( error, events ) {
		doCallback( callback, [ error, events[0] ]);
	});
};

db.findEvents = function( filters, data, callback )
{
	db.all( 'SELECT * FROM events WHERE '+ filters, data, function( error, results ) {
		var items = [];
		
		if( error == null && results != null && results.length != 0 ) {
			for( var i = 0, rl = results.length; i < rl; ++i ) {
				var result = results[i];				
				
				items.push( new Event({
					id         : result.ID,
					name       : result.name,
					startDate  : new Date( result.start_date ),
					locationId : result.location_ID
				}) );
			}
		}		
		
		doCallback( callback, [ error, items ]);
	});	
};



db.findCinemas = function( filters, data, callback ) {
	var arr = [];
	
	for( var idx in cinemas ) {
		arr.push( cinemas[ idx ] );
	}
	
	doCallback( callback, [ null, arr ]);
};

module.exports = db;