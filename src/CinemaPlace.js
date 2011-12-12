var Event      = require('./Event.js'),
    abstractFn = require('./utils.js').abstractFn,
    doCallback = require('./utils.js').doCallback,
    dataStoreCb = require('./utils.js').dataStoreCb,
    asyncblock  = require('asyncblock'),
    httpLoader = require('./utils.js').httpLoaderFn;

var eventsCounter = 0;

/**
 * CinemaPlace object prototype
 * 
 * @class CinemaPlace
 */
var CinemaPlace = function( cinema, def )
{
	this.id     = def.id;
	this.url    = def.url;
	this.name   = cinema.name +' '+ def.name;
	this.cinema = cinema;
	
	this.programParser = def.programParser;
	this.programUrlGen = def.programUrlGen;
};

CinemaPlace.prototype = {
	id     : null,
	url    : null,
	name   : null,
	cinema : null,
	
	programParser : abstractFn,
	programUrlGen : abstractFn,
	
	register : function( dataStore, flow )
	{
		var obj = {
			'@context' : {
				'sch' : 'http://www.schema.org/',
				'@coerce' : {
					'@iri' : 'sch:branchOf'
				}
			},
			
			'@subject'     : this.cinema.id +'#'+ this.id,
			'@type'        : 'sch:MovieTheater',
			'sch:name'     : this.name,
			'sch:url'      : this.url,
			'sch:branchOf' : this.cinema.id
		};
		
		dataStore.load( 'application/json', obj, dataStoreCb( flow ) );
	},
	
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
	registerEvent : function( dataStore, def, callback )
	{
		var obj = {
			'@context' : {
				'sch' : 'http://www.schema.org/',
				'xsd' : 'http://www.w3.org/2001/XMLSchema#',
				'@coerce' : {
					'@iri'         : 'sch:location',
					'xsd:date'     : 'sch:startDate',
					'xsd:duration' : 'sch:duration'
				}
			},
			
			'@subject'      : 'http://cineprog.local/events/'+( ++eventsCounter ),
			'@type'         : 'sch:TheaterEvent',
			'sch:name'      : def.name,
			'sch:startDate' : def.startDate.toISOString(),
			'sch:duration'  : null,
			'sch:location'  : this.url
		};
		
		dataStore.load( 'application/json', obj, function() {
			console.log('NEW event : '+ def.name +' : '+ def.startDate);
			doCallback( callback );
		});
	}
};

module.exports = CinemaPlace;