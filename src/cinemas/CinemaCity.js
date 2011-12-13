var Cinema = require('../Cinema.js'),
    doCallback = require('../utils.js').doCallback,
    httpLoader = require('../utils.js').httpLoaderFn;

module.exports = new Cinema( 'CinemaCity',
{
	name : 'CinemaCity',
	
	/**
	 * Builds list of available places
	 * 
	 * @protected
	 * @return {Object}
	 */
	buildBranches : function( callback )
	{
		var me        = this,
		    cinemaUrl = 'http://www.cinemacity.cz';
		
		httpLoader( cinemaUrl, function( window ) {
			var jQuery = window.jQuery;
						
			jQuery('#vyber_kina').find( 'a' ).each( function( i ) {
				var url   = this.href,
				    name  = this.childNodes[0].alt,
				    idMatches = /program=([\w\-]+)/.exec( url );
					
				// not a valid place
				if( idMatches == null ) {
					return;
				}
				
				var codeName = idMatches[1];
				
				me.addPlace({
					codeName : codeName,
					name     : name,
					url      : cinemaUrl +'/index.php?action=10101&program='+ codeName,
					
					programParser : me.parseProgram,
					programUrlGen : function( date ) {
						dateStr = date.getFullYear() +'-'+ ( date.getMonth() + 1 ) +'-'+ date.getDate();
						return this.url +'&date='+ dateStr;
					}
				});
			});
			
			doCallback( callback );
		});
	},
	
	/**
	 * Loads program for given date & place
	 * 
	 * @param {Window}   window
	 * @param {Date}     date
	 * @param {Function} registerEvent
	 */
	parseProgram : function( window, date, registerEvent )
	{
		var me     = this,
		    jQuery = window.jQuery;
		
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
				
				registerEvent({
					name         : title,
					startDate    : startDate,
					hasSubtitles : hasSubtitles,
					hasDubbing   : hasDubbing
				});
			} );
		});
	}
});