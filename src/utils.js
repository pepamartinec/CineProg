exports.doCallback = function( callback, args )
{
	if( callback == null ) {
		return true;
	}
	
	if( typeof callback === 'function' ) {
		callback = [ callback, {} ];
	}
	
	if( typeof callback === 'object' && callback.length === 2 ) {
		return callback[0].apply( callback[1], args );
	}
	
	throw "Invalid callback definition supplied";
};