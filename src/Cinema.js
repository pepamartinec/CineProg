var CinemaPlace = require('./CinemaPlace.js'),
    abstractFn  = require('./utils.js').abstractFn,
    doCallback  = require('./utils.js').doCallback,
    dataStoreCb = require('./utils.js').dataStoreCb,
    asyncblock  = require('asyncblock');

/**
 * Cinema object prototype
 * 
 * @class Cinema
 */
var Cinema = function( id, definition )
{
	this.id         = 'http://cineprog.local/cinemas/'+ id;
	this.placesList = {};
	
	for( var item in definition ) {
		if( definition.hasOwnProperty( item ) === false ) {
			continue;
		}
		
		this[ item ] = definition[ item ];
	}
};

Cinema.prototype = {
	id         : null,
	name       : null,
	
	/**
	 * @var {Object} placesList
	 */
	placesList : null,
	
	buildPlacesList : abstractFn,
	
	init : function( callback )
	{
		this.buildPlacesList( callback );
	},
	
	register : function( dataStore, callback )
	{
		var cinema = this;
		
		asyncblock( function( flow ) {
			// register self
			var obj = {
				'@context' : {
					'sch' : 'http://www.schema.org/'
				},
				
				'@subject' : cinema.id,
				'@type'    : 'sch:Organization',
				'sch:name' : cinema.name,
				'sch:url'  : ''
			};
			
			dataStore.load( 'application/json', obj, dataStoreCb( flow ) );
			
			// register places
			for( var id in cinema.placesList ) {
				cinema.placesList[ id ].register( dataStore, flow );
			}
			
			// synchronize
			flow.wait();
			
			doCallback( callback );
		});
	},
	
	/**
	 * Adds new cinema place
	 * 
	 * @param {Object} def
	 */
	addPlace : function( def )
	{
		this.placesList[ def.id ] = new CinemaPlace( this, def );
	},
	
	/**
	 * Returns cinema place
	 * 
	 * @param  {String} placeName
	 * @return {CinemPlace}
	 */
	getPlace : function( placeName )
	{
		if( this.placesList[ placeName ] === undefined ) {
			throw "Invalid place '"+ placeName +'"';
		}
		
		return this.placesList[ placeName ];
	},
	
	/**
	 * Loads program of given place
	 * 
	 * @param placeName {String}
	 * @param date      {Date}
	 * @param callback  {Function}
	 */
	loadProgram : function( placeName, date, callback )
	{
		this.getPlace( placeName ).loadProgram( date, callback );
	}
};

module.exports = Cinema;