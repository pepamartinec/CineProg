var CineProg    = require('./CineProg.js'),
    Event      = require('./Event.js'),
    abstractFn = require('./utils.js').abstractFn,
    doCallback = require('./utils.js').doCallback,
    dataStoreCb = require('./utils.js').dataStoreCb,
    asyncblock  = require('asyncblock'),
    httpLoader = require('./utils.js').httpLoaderFn;

/**
 * CinemaPlace object prototype
 * 
 * @class CinemaPlace
 */
var CinemaPlace = function( cinema, def )
{
	this.id       = null,
	this.codeName = def.codeName;
	this.name     = cinema.name +' '+ def.name;
	this.url      = def.url;
	this.cinemaId = cinema.id;
	this.uri      = CineProg.baseUri +'cinemas/'+ cinema.codeName +'#'+ this.codeName;
	
	this.cinema   = cinema;
	
	this.programParser = def.programParser;
	this.programUrlGen = def.programUrlGen;
};

CinemaPlace.prototype = {
	id       : null,
	codeName : null,
	name     : null,
	url      : null,
	uri      : null,
	cinemaId : null,
	
	cinema   : null,
	
	programParser : abstractFn,
	programUrlGen : abstractFn,
	
	/**
	 * 
	 * @param date
	 * @param dataStore
	 * @param callback
	 */
	loadProgram : function( date, dataStore, callback )
	{
		var me = this;
		
		asyncblock( function( flow ) {
			var registerEvent = function( def ) {
				me.registerEvent( dataStore, def, flow.add() );
			};
			
			var flowCb = flow.add();
			
			httpLoader( me.programUrlGen( date ), function( window ) {
				me.programParser.call( me, window, date, registerEvent );
				flowCb.call( this );
			});
			
			flow.wait();
			doCallback( callback );
		});
	},
	
	/**
	 * Parses given time string and creates according date object
	 * 
	 * @protected
	 * @param {Date}   baseDate
	 * @param {String} timeString
	 * @return {Date|null}
	 */
	parseTime : function( baseDate, timeString )
	{
		var timeParts = /(\d{1,2})[:\.\-](\d{1,2})/.exec( timeString );
		
		// invalid string format
		if( timeParts == null ) {
			return null;
		}
		
		var date = new Date( baseDate );
		date.setHours( timeParts[1], timeParts[2], 0, 0 );
		return date;
	},
	
	/**
	 * Registers event to dataStore
	 * 
	 * @param {Object}   def
	 * @param {Function} callback
	 */
	registerEvent : function( db, def, callback )
	{
		def.locationId = this.id;
		
		db.saveEvent( new Event( def ), callback );
		
//		Movie.find( db, 'name = ?', [ def.name ], function( results ) {
//			if( results.length == 0 ) {
//				var movie = new Movie({
//					name : def.name
//				});
//				
//				movie.save( db, function() {
//					event.save( db, callback );
//				});
//				
//			} else {
//				event.save( db, callback );
//			}
//			
//		});
		
	},
	
	/**
	 * Returns JSON-LD representation of cinema branch
	 * 
	 * @returns {Object}
	 */
	toJson : function()
	{
		return {
			'@context' : {
				'sch' : 'http://www.schema.org/',
				'@coerce' : {
					'@iri' : 'sch:branchOf'
				}
			},
			
			'@subject'     : this.uri,
			'@type'        : 'sch:MovieTheater',
			'sch:name'     : this.name,
			'sch:url'      : this.url,
			'sch:branchOf' : CineProg.baseUri +'cinemas/'+ this.cinema.codeName
		};
	}
};

module.exports = CinemaPlace;