var Cinema = require('../Cinema.js'),
    doCallback = require('../utils.js').doCallback,
    httpLoader = require('../utils.js').httpLoaderFn;

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
		
		httpLoader( url, function( window ) {
			var jQuery  = window.jQuery,
			    counter = 0;
			
			jQuery('#vyber-kina select').find( 'option' ).each( function( i ) {
				var opt       = this,
				    url       = this.value,
				    idMatches = /\/(\w+)\//.exec( url );
				
				// not a valid place
				if( url == '#' || idMatches == null ) {
					return;
				}
				
				// increase found places counter
				++counter;				
				
				// load place details
				httpLoader( 'http://www.cinestar.cz'+ url, function() {
					var id   = idMatches[1],
					    name = opt.innerHTML;
					
					return function( window ) {
						var url = window.jQuery('#menu .program a').attr('href');
						
						me.addPlace( id, name, url, me.place_loadProgram );
						
				    	if( --counter <= 0 ) {
				    		doCallback( callback, [ me.placesList ]);
				    	}
					};
				}() );
			});
		});
	},
	
	/**
	 * Loads program for given date & place
	 * 
	 * @param {Date}     date
	 * @param {Function} callback
	 */
	place_loadProgram : function( date, callback )
	{
		var me = this;	
		
		var config = {
			url    : me.url,
			method : 'POST',
			data   : {
				datum : date.valueOf().toString().slice( 0, -3 ) // strip milisecs
			}
		};
		
		httpLoader( config, function( window ) {
			var jQuery = window.jQuery,
			    events = [];
			
			jQuery('.table-program').each( function() {
				jQuery( this ).find( 'tr' ).each( function( i ) {
					// skip head row
				    if( i == 0 ) {
				        return;
				    }
					
					// parse title
					var title = this.children[1].childNodes[1].childNodes[2].innerHTML;
						
						// remove garbage around movie title
						title = title.replace( ' FFF', '' );
						title = title.replace( ' (Digital)', '' );
						title = title.replace( ' (digital)', '' );
						title = title.replace( ' - titulky', '' );
						title = title.replace( ' - dabing', '' );
						title = title.replace( ' GC', '' );
						title = title.trim();
					
					// parse lang infos
					var hasSubtitles = false,
					    hasDubbing   = false;
						
					jQuery( this.children[2] ).find('span').each( function() {
						if( this.style.display == 'none' ) {
							return;
						}
						
						switch( this.innerHTML ) {
							case 'T' : hasSubtitles = true; break;
							case 'D' : hasDubbing   = true; break;
						}
					});
					
					// parse play times
					jQuery( this ).find( '.active' ).each( function() {
						var startDate = me.parseTime( date, this.innerHTML );
						
						events.push( me.createEvent({
							name         : title,
							startDate    : startDate,
							hasSubtitles : hasSubtitles,
							hasDubbing   : hasDubbing
						}) );
					} );
					
				});
			});
			
			doCallback( callback, [ events ]);
		});
	}
});