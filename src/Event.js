/**
 * Event class
 * 
 * @param {Object} config
 */
var Event = function( config )
{
	for( var idx in config ) {
		if( config.hasOwnProperty( idx ) === false || this[ idx ] === undefined ) {
			continue;
		}
		
		this[ idx ] = config[ idx ];
	}
};

Event.prototype = {
	// mandatory fields
	startDate : null,
	location  : null,
	name      : null,
	url       : null,	
	duration  : null,
	
	// local proprietary fields
	hasSubbtitles : null,
	hasDubbing    : null,
	
	performers : null,
};

module.exports = Event;