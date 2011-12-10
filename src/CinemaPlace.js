var Event      = require('./Event.js'),
    abstractFn = require('./utils.js').abstractFn;

/**
 * CinemaPlace object prototype
 * 
 * @class CinemaPlace
 */
var CinemaPlace = function( cinema, id, definition )
{
	this.cinema = cinema;
	this.id     = id;
	
	for( var item in definition ) {
		if( definition.hasOwnProperty( item ) === false ) {
			continue;
		}
		
		this[ item ] = definition[ item ];
	}
};

CinemaPlace.prototype = {
	id     : null,
	name   : null,
	cinema : null,
	
	loadProgram : abstractFn,
	
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
	
	createEvent : function( config )
	{
		var event = new Event( config );
		
		return event;
	}
};

module.exports = CinemaPlace;