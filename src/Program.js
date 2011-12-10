/**
 * Program object
 * 
 * @class Program
 */
var Program = function( location )
{
	this.items   = [];
	this.movies  = {};
	this.cinemas = {};
};

Program.prototype = {
	items   : null,
	movies  : null,
	cinemas : null,
	
	find : function( list, matchObj )
	{
		return list.find( function( item ) {
			var item  = list[ i ];
			console.log(item);
			for( var prop in matchObj ) {
				if( item[ prop ] !== matchObj[ prop ] ) {
					return false;
				}
			}
			
			return true;
		});
	},
	
	addItem : function( movieObj )
	{
		var me = this;
		
		// pick movie
		var movieTitle = movieObj.title;
		
		if( me.movies.hasOwnProperty( movieTitle ) === false ) {
			me.movies[ movieTitle ] = {
				title : movieTitle
			};
		}
		
		var movie = me.movies[ movieTitle ];
		
		var item;
		for( var i = 0, tl = movieObj.times.length; i < tl; ++i ) {			
			item = {
				place        : movieObj.place,
				movie        : movie,
				hasDubbing   : movieObj.hasDubbing,
				hasSubtitles : movieObj.hasSubtitles,
				time         : movieObj.times[ i ]
			};
			
			if( me.find( me.items, item ).length === 0 ) {
				me.items.push( item );
			}
		}
	}
};

module.exports = Program;