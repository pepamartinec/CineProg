var Program = function( location )
{
	this.items = {};
}; 

Program.prototype =
{
	items : null,
	
	findItem : function( movieObj )
	{
		var title = movieObj.title;
		
		if( this.items.hasOwnProperty( title ) === false ) {
			return false;
		}
		
		var item = this.items[ title ];
		
		if( item.hasDubbing !== movieObj.hasDubbing ||
			item.hasSubtitles !== movieObj.hasSubtitles
		) {	
			return false;
		}
		
		return item;
	},
	
	addItem : function( movieObj )
	{
		var item = this.findItem( movieObj );
		
		if( item !== false ) {
			item.times.push.apply( item.times, movieObj.times );
			
		} else {
			this.items[ movieObj.title ] = movieObj;
		}
	}
};

module.exports = program;