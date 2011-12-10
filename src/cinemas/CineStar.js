var Cinema = require('../Cinema.js'),
    doCallback = require('../utils.js').doCallback;

module.exports = new Cinema( 'CineStar',
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
		    url = 'http://www.cinestar.cz/vyber-kina/';
		
		me.httpLoaderFn( url, function( window ) {
			var places  = me.buildPlacesList_parsePlaces( window ),
			    counter = 0,
			    place   = null;
			
			var createParser = function() {
				var p = place;
				
				return function( window ) {
					p.url = window.jQuery('#menu .program a').attr('href');
					
			    	if( --counter <= 0 ) {
			    		doCallback( callback, [ places ]);
			    	}
				};
			};
			
			me.places = places;
			
			for( var id in places ) {
				place = places[ id ];
				
				++counter;
				me.httpLoaderFn( 'http://www.cinestar.cz'+ place.url, createParser() );
			}
		});
	},

	/**
	 * Parses list of available places from web page
	 * 
	 * @private
	 * @returns {Array}
	 */
	buildPlacesList_parsePlaces : function( window )
	{
		var me     = this,
            jQuery = window.jQuery,
		    places = {};
		
		try {
			jQuery('#vyber-kina select').find( 'option' ).each( function( i ) {				
				var url   = this.value,
				    title = this.innerHTML,
				    idMatches = /\/(\w+)\//.exec( url );
				
				// not a valid place
				if( url == '#' || idMatches == null ) {
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
			throw "Failed on parsing CineStar places list";
		}
		
		return places;
	},
	
	/**
	 * Loads program for given date & place
	 * 
	 * @return {Program}
	 */
	loadProgram : function( place, date, callback )
	{
		var me = this;
		
		if( typeof place === 'string' ) {
			if( me.places[ place ] == null ) {
				throw new "Invalid place '"+ place +"' for CineStar loader";
			}
			
			place = me.places[ place ];
		}		
		
		var config = {
				url    : place.url,
				method : 'POST',
				data   : {
					datum : date.valueOf().toString().slice( 0, -3 ) // strip milisecs
				}
			};
		
		me.httpLoaderFn( config, function( window ) {
			me.loadProgram_parse( window, place, date );
			
			doCallback( callback, [ me ]);
		});
	},

	/**
	 * Parses program from page
	 * 
	 * @private
	 * @returns {Program}
	 */
	loadProgram_parse : function( window, place, date )
	{
		var me     = this,
            jQuery = window.jQuery;
		
		try {
			jQuery('.table-program').each( function() {
				jQuery( this ).find( 'tr' ).each( function( i ) {
				    if( i == 0 ) {
				        return;
				    }
				    
					var tableRow  = this,
					    titleCol  = tableRow.children[1],
					    langCol   = tableRow.children[2];
					
					var item = {
				    	title        : me.loadProgram_parseTitle( titleCol ),
				    	hasDubbing   : false,
				    	hasSubtitles : false,
				    	times        : me.loadProgram_pickMovieTimes( window, date, tableRow )
				    };
					
					jQuery( langCol ).find('span').each( function() {
						if( this.style.display == 'none' ) {
							return;
						}
						
						switch( this.innerHTML ) {
							case 'T' : item.hasSubtitles = true; break;
							case 'D' : item.hasDubbing   = true; break;
						}
					});
					
					me.addProgramItem( place, item );
				});
			});
			
		} catch( e ) {
			throw "Failed on parsing CinemaCity program";
		}
		
		return program;
	},
	
	/**
	 * Clears parsed movie title
	 * 
	 * @private
	 * @param   {String} title
	 * @returns {String}
	 */
	loadProgram_parseTitle : function( tCol )
	{
		var title = tCol.childNodes[1].childNodes[2].innerHTML;
		
		title = title.replace( ' FFF', '' );
		title = title.replace( ' (Digital)', '' );
		title = title.replace( ' (digital)', '' );
		title = title.replace( ' - titulky', '' );
		title = title.replace( ' - dabing', '' );
		title = title.replace( ' GC', '' );
		return title.trim();
	},


	/**
	 * Picks time of play within supplied program row
	 * 
	 * @param   {Date}   date
	 * @param   {}       tableRow
	 * @param   {Object} window
	 * @returns {Array}
	 */
	loadProgram_pickMovieTimes : function( window, date, tableRow )
	{
		var times  = [],
            jQuery = window.jQuery;
		
		jQuery( tableRow ).find( '.active' ).each( function() {
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