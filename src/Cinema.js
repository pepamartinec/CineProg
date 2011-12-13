var CineProg    = require('./CineProg.js'),
    CinemaPlace = require('./CinemaPlace.js'),
    abstractFn  = require('./utils.js').abstractFn,
    doCallback  = require('./utils.js').doCallback,
    dataStoreCb = require('./utils.js').dataStoreCb,
    asyncblock  = require('asyncblock');

/**
 * Cinema object prototype
 * 
 * @class Cinema
 */
var Cinema = function( codeName, definition )
{
	this.codeName   = codeName;
	this.branches = {};
	this.url        = '';
	
	for( var item in definition ) {
		if( definition.hasOwnProperty( item ) === false ) {
			continue;
		}
		
		this[ item ] = definition[ item ];
	}
};

Cinema.prototype = {
	id       : null,
	codeName : null,
	name     : null,
	url      : null,
	
	/**
	 * @var {Object} branches
	 */
	branches : null,
	
	buildBranches : abstractFn,
	
	init : function( callback )
	{
		this.buildBranches( callback );
	},
	
	register : function( db, callback )
	{
		var cinema = this;
		
		asyncblock( function( flow ) {
			
			var flowCb = flow.add();
			
			db.saveCinema( cinema, function( error ) {
				if( error == null ) {					
					// register places
					for( var id in cinema.branches ) {
						db.saveBranch( cinema.branches[ id ], flow.add() );
					}
				}
				
				flowCb.apply( this, arguments );
			});
			
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
		this.branches[ def.codeName ] = new CinemaPlace( this, def );
	},
	
	/**
	 * Returns cinema place
	 * 
	 * @param  {String} placeName
	 * @return {CinemPlace}
	 */
	getPlace : function( placeName )
	{
		if( this.branches[ placeName ] === undefined ) {
			throw "Invalid place '"+ placeName +'"';
		}
		
		return this.branches[ placeName ];
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
	},
	
	/**
	 * Returns JSON-LD representation of cinema
	 * 
	 * @returns {Object}
	 */
	toJson : function()
	{
		var items = [{
			'@context' : {
				'sch' : 'http://www.schema.org/'
			},
			
			'@subject' : CineProg.baseUri +'cinemas/'+ this.codeName,
			'@type'    : 'sch:Organization',
			'sch:name' : this.name,
			'sch:url'  : this.url
		}];
		
		for( var id in this.branches ) {
			items.push( this.branches[ id ].toJson() );
		}
		
		return items;
	}
};

module.exports = Cinema;