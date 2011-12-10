var Cinema = require('../Cinema.js'),
    doCallback = require('../utils.js').doCallback,
    httpLoader = require('../utils.js').httpLoaderFn;

module.exports = new Cinema( 'CinemaCity',
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
		
		httpLoader( url, function( window ) {
			var jQuery = window.jQuery;
			
			try {			
				jQuery('#vyber_kina').find( 'a' ).each( function( i ) {
					var url   = this.href,
					    name  = this.childNodes[0].alt,
					    idMatches = /program=(\w+)/.exec( url );
						
					// not a valid place
					if( idMatches == null ) {
						return;
					}
					
					var id = idMatches[1];
					
					me.addPlace( id, name, url, me.place_loadProgram );
				});
				
			} catch( e ) {
				throw "Failed on parsing CinemaCity places list";
			}
			
			doCallback( callback, [ me ]);
		});
	},
	
	/**
	 * Loads program for given date & place
	 * 
	 * @param {String} place
	 * @param {Date}   date
	 * @return {Program}
	 */
	place_loadProgram : function( date, callback )
	{
		var me      = this,
		    dateStr = date.getFullYear() +'-'+ ( date.getMonth() + 1 ) +'-'+ date.getDate(),
		    url     = 'http://www.cinemacity.cz/index.php?action=10101&program='+ me.id +'&date='+ dateStr;
		
		httpLoader( url, function( window ) {
			var jQuery = window.jQuery,
			    events = [];
			
			jQuery('#program').find( 'tr' ).each( function( i ) {				
				// skip header row
				if( i == 0 ) {
					return;
				}
				
				// parse title
				var title = this.children[0].children[0].innerHTML;
				
				// parse lang infos
				var langCol      = this.children[2],
					hasSubtitles = langCol.innerHTML == 'ČT',
				    hasDubbing   = langCol.innerHTML == 'DAB';
				
				// parse play times
				jQuery( this ).find( '.rezervace' ).each( function() {
					var startDate = me.parseTime( date, this.innerHTML );
					
					events.push( me.createEvent({
						name         : title,
						startDate    : startDate,
						hasSubtitles : hasSubtitles,
						hasDubbing   : hasDubbing
					}) );
				} );
			});
			
			doCallback( callback, [ events ]);
		});
	}
});