var CineProg   = require('./CineProg.js'),
    doCallback = require('./utils.js').doCallback,
    applyConfig = require('./utils.js').applyConfig;

/**
 * Movie class
 * 
 * @param {Object} config
 */
var Movie = function( config )
{
	applyConfig( this, config );
};

Movie.prototype = {
	id   : null,
	name : null,
	
	save : function( db, callback )
	{
		var movie       = this,
		    isPersisted = ( movie.id != null ),
		    data        = [ this.name ],
		    query;
		
		if( isPersisted ) {
			query = "UPDATE movies SET name = ? WHERE ID = ?";
			data.push( movie.id );
			
		} else {
			query = "INSERT INTO movie ( name ) VALUES ( ? )";
		}
	
		db.run( query, data, function( error ) {
			if( error ) { throw error; }
			
			if( isPersisted == false ) {
				movie.id = this.lastID;
			}
			
			doCallback( callback );
		});
	},
	
	/**
	 * Returns JSON-LD representation of event
	 * 
	 * @returns {Object}
	 */
	toJson : function()
	{
		return {
			'@context' : {
				'sch' : 'http://www.schema.org/',
				'xsd' : 'http://www.w3.org/2001/XMLSchema#'
			},
		
			'@subject' : CineProg.baseUri +'movies/'+ this.id,
			'@type'    : 'sch:Movie',
			'sch:name' : this.name
		};
	}
};

Movie.load = function( db, id, callback )
{
	db.get( 'SELECT * FROM movies WHERE ID = ?', [ id ], function( error, result ) {
		if( error ) { throw error; }
		
		var movie = null;
		
		if( result != null ) {
			movie = new Movie({
				id   : result.ID,
				name : result.name
			});
		}
		
		doCallback( callback, [ movie ]);
	});	
};

Movie.find = function( db, filters, data, callback )
{
	db.each( 'SELECT * FROM movies WHERE '+ filters, data, function( error, results ) {
		if( error ) { throw error; }
		
		var movies = [];
		
		if( results != null && results.length != 0 ) {
			movies.push( new Movie({
				id   : result.ID,
				name : result.name
			}) );
		}
		
		doCallback( callback, [ movies ]);
	});	
};

module.exports = Movie;