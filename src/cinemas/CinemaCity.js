defineCinema( 'CinemaCity',
{	
	/**
	 * Builds list of available places
	 * 
	 * @protected
	 * @return {Object}
	 */
	buildPlacesList : function( callback )
	{
		var me  = this,
		    url = 'http://www.cinemacity.cz';
		
		me.httpLoaderFn( url, function( window ) {
			me.list = me.buildPlacesList_parsePlaces( window );
			
			doCallback( callback, [ me ]);
		});
	},

	/**
	 * Parses list of available places from web page
	 * 
	 * @private
	 * @returns {Object}
	 */
	buildPlacesList_parsePlaces : function( jQuery )
	{
		var me     = this,
		    places = {};
		
		try {			
			jQuery('#vyber_kina').find( 'a' ).each( function( i ) {
				var url   = this.href,
				    title = this.childNodes[0].alt,
				    idMatches = /program=(\w+)/.exec( url );
					
				// not a valid place
				if( idMatches == null ) {
					return;
				}
				
				var id = idMatches[1];
				
				places[ id ] = {
					cinema    : me,
					url       : url,
					title     : title,
					programId : id
				};
			});
			
		} catch( e ) {
			throw "Failed on parsing CinemaCity places list";
		}
		
		return places;
	},
	
	/**
	 * Loads program for given date & place
	 * 
	 * @param {String} place
	 * @param {Date}   date
	 * @return {Program}
	 */
	loadProgram : function( place, date, callback )
	{		
		var me  = this,
		    dateStr = date.getFullYear() +'-'+ date.getMonth() +'-'+ date.getDay(),
		    url = 'http://www.cinemacity.cz/index.php?action=10101&program='+ place +'&date='+ dateStr;
		
		me.httpLoaderFn( url, function( jQuery ) {
			me.loadProgram_parse( jQuery, place, date );
			
			doCallback( callback, [ me ]);
		});
	},

	/**
	 * Parses program from page
	 * 
	 * @private
	 * @returns {Program}
	 */
	loadProgram_parse : function( jQuery, place, date )
	{
		var me = this;
		
		try {
			jQuery('#program').find( 'tr' ).each( function( i ) {
			    if( i == 0 ) {
			        return;
			    }
			    
				var tableRow  = this,
				    titleCol  = tableRow.children[0],
				    langCol   = tableRow.children[2];
				
				me.addProgramItem( place, {
			    	title        : titleCol.children[0].innerHTML,
			    	hasDubbing   : langCol.innerHTML == 'DAB',
			    	hasSubtitles : langCol.innerHTML == 'ČT',
			    	times        : me.loadProgram_pickMovieTimes( jQuery, date, tableRow )
			    });
			});
			
		} catch( e ) {
			throw "Failed on parsing CinemaCity program";
		}
		
		return program;
	},

	/**
	 * Picks time of play within supplied program row
	 * 
	 * @param   {Date}   date
	 * @param   {}       tableRow
	 * @param   {Object} window
	 * @returns {Array}
	 */
	loadProgram_pickMovieTimes : function( jQuery, date, tableRow )
	{
		var times = [];
		
		jQuery( tableRow ).find( '.rezervace' ).each( function() {
			var timeParts = /(\d{1,2})[:\.\-](\d{1,2})/.exec( this.innerHTML ),
			    localDate = new Date( date );
			
			if( timeParts == null ) {
				return;
			}
			
			localDate.setHours( timeParts[1], timeParts[2], 0, 0 );
			times.push( localDate );
		} );
		
		return times;
	}
});