var CineProg    = require('./CineProg.js'),
    doCallback  = require('./utils.js').doCallback,
    applyConfig = require('./utils.js').applyConfig;

/**
 * Event class
 * 
 * @param {Object} config
 */
var Event = function( config )
{
	applyConfig( this, config );
	
	this.location = CineProg.db.getBranch( this.locationId );
};

Event.prototype = {
	id            : null,
	name          : null,
	startDate     : null,
	locationId    : null,
	location      : null,
	hasSubbtitles : null,
	hasDubbing    : null,
	
	save : function( db, callback )
	{
		var event       = this,
		    isPersisted = ( event.id != null ),
		    data        = [ this.name, this.startDate.getTime(), this.location.id ],
		    query;
		
		if( isPersisted ) {
			query = "UPDATE events SET name = ?, start_date = ?, location_ID = ? WHERE ID = ?";
			data.push( event.id );
			
		} else {
			query = "INSERT INTO events ( name, start_date, location_ID ) VALUES ( ?, ?, ? )";
		}
		
		db.run( query, data, function( error ) {
			if( error ) { throw error; }
			
			if( isPersisted == false ) {
				event.id = this.lastID;
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
				'xsd' : 'http://www.w3.org/2001/XMLSchema#',
				'@coerce' : {
					'@iri'         : 'sch:location',
					'xsd:date'     : 'sch:startDate',
					'xsd:duration' : 'sch:duration'
				}
			},
		
			'@subject'      : CineProg.baseUri +'events/'+ this.id,
			'@type'         : 'sch:TheaterEvent',
			'sch:name'      : this.name,
			'sch:startDate' : this.startDate.toISOString(),
			'sch:duration'  : null,
			'sch:location'  : this.location.uri,
		};
	}
};

Event.load = function( db, id, callback )
{
	db.get( 'SELECT * FROM events WHERE ID = ?', [ id ], function( error, result ) {
		if( error ) { throw error; }
		
		var event = null;
		
		if( result != null ) {
			event = new Event({
				id         : result.ID,
				name       : result.name,
				startDate  : new Date( result.start_date ),
				locationId : result.location_ID
			});
		}
		
		doCallback( callback, [ event ]);
	});	
};

Event.find = function( db, filters, data, callback )
{
	db.all( 'SELECT * FROM events WHERE '+ filters, data, function( error, results ) {
		if( error ) { throw error; }
		
		var items = [];
		
		if( results != null && results.length != 0 ) {
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
		
		doCallback( callback, [ items ]);
	});	
};

module.exports = Event;