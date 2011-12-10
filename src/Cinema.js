var CinemaPlace = require('./CinemaPlace.js'),
    abstractFn  = require('./utils.js').abstractFn;

/**
 * Cinema object prototype
 * 
 * @class Cinema
 */
var Cinema = function( name, definition )
{
	this.name       = name;
	this.placesList = {};
	
	for( var item in definition ) {
		if( definition.hasOwnProperty( item ) === false ) {
			continue;
		}
		
		this[ item ] = definition[ item ];
	}
};

Cinema.prototype = {
	name       : null,
	placesList : null,
	
	buildPlacesList : abstractFn,
	
	init : function( callback )
	{
		this.buildPlacesList( callback );		
	},
	
	/**
	 * Adds new cinema place
	 * 
	 * @param id
	 * @param name
	 * @param url
	 * @param programLoaderFn
	 */
	addPlace : function( id, name, url, programLoaderFn )
	{
		this.placesList[ id ] = new CinemaPlace( this, id, {
			name : name,
			url  : url,
			
			loadProgram : this.place_loadProgram
		});
		
		console.log( 'New place for '+this.name+' cinema registered - '+name+' ('+id+')' );
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