var doCallback = require('./utils.js').doCallback;

var ProgramCache = function()
{
	this.cache = {};
};

ProgramCache.prototype = {
	cache : null,
	
	/**
	 * Generates unique place ID
	 * 
	 * @private
	 * @param {CinemaPlace} place
	 * @return {String}
	 */
	getPlaceId : function( place )
	{
		return place.cinema.id +'-'+ place.id;
	},
	
	/**
	 * Initializes cache storage
	 * 
	 * @private
	 * @param place {CinemaPlace}
	 * @param date  {Date}
	 */
	touchCache : function( place, date )
	{
		var placeId = this.getPlaceId( place ),
		    year    = date.getFullYear(),
		    month   = date.getMonth(),
		    day     = date.getDate();
		
		var cache = this.cache;
		
		if( cache[ placeId ] === undefined ) {
			cache[ placeId ] = {};
		}
		
		var placeCache = cache[ placeId ];
		
		if( placeCache[ year ] === undefined ) {
			placeCache[ year ] = {};
		}
		
		var yearCache = placeCache[ year ];
		
		if( yearCache[ month ] === undefined ) {
			yearCache[ month ] = {};
		}
		
		var monthCache = yearCache[ month ];
		
		if( monthCache[ day ] === undefined ) {
			monthCache[ day ] = null;
		}
	},
	
	/**
	 * Sets program for given date
	 * 
	 * @private
	 * @param {CinemaPlace} place
	 * @param {Date}        date
	 * @param {Event[]}     program
	 */
	setDayProgram : function( place, date, program )
	{
		this.touchCache( place, date );
		
		var placeId = this.getPlaceId( place ),
		    year    = date.getFullYear(),
		    month   = date.getMonth(),
		    day     = date.getDate();
		
		this.cache[ placeId ][ year ][ month ][ day ] = program;
	},
	
	/**
	 * Loads program of given cinemaPlace for given date
	 * 
	 * @param place    {CinemaPlace}
	 * @param date     {Date}
	 * @param callback {Function}
	 */
	loadProgram : function( place, date, callback )
	{
		var me = this;
		
		place.loadProgram( date, function( program ) {
			me.setDayProgram( place, date, program );
			
			doCallback( callback, [ program ]);
		});
	},
	
	/**
	 * Searches cache
	 * 
	 * @param {Function} filterFn
	 * @returns {Array}
	 */
	search : function( filterFn )
	{
		var results = [],
		    placeProgram, yearProgram, monthProgram, dayProgram,
		    placeId, year, month, day,
		    i, dpl;
		
		for( placeId in this.cache ) {
			placeProgram = this.cache[ placeId ];
			
			for( year in placeProgram ) {
				yearProgram = placeProgram[ year ];
				
				for( month in yearProgram ) {
					monthProgram = yearProgram[ month ];
					
					for( day in monthProgram ) {
						dayProgram = monthProgram[ day ];
						
						if( dayProgram === null ) {
							continue;
						}
						
						for( i = 0, dpl = dayProgram.length; i < dpl; ++i ) {
							if( filterFn.call( dayProgram[i] ) === true ) {
								results.push( dayProgram[i] );
							}
						}
					}
				}
			}
		}
		
		return results;
	}
};

module.exports = ProgramCache;