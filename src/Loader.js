(function ()
{
	var load_nodejs = function( url, callback )
	{
		var handler = function( error, response, body ) {
			if( error && response.statusCode !== 200 ) {
				console.log('Error when contacting google.com');
			}
			
			jsdom.env({
				html    : body,
				scripts : [ 'http://code.jquery.com/jquery-1.5.min.js' ],
				done    : function( error, window ) {				
					callback.call( window );
				}
			});
		};
		
		// do request
		request( { uri : url }, handler );		
	};

	var load_browser = function( url, callback )
	{
		var iframe = jQuery( '<iframe scr="'+ url +'"></iframe>' );
		
		iframe.bind( 'load', function() {		
			callback.call( window );
			
			iframe.parentNode.removeChild( iframe );
		});
		
		iframe.appendTo( window.body );
	};
	
	var Loader = {
		load : null
	};
	
	if( typeof module !== 'undefined' && module.exports ) {
		module.exports = Loader;
		
		Loader.request = require('request');
		Loader.jsdom   = require('jsdom');
		Loader.load    = load_nodejs;
		
		
		
	} else {
		this.Loader = Loader;
		
		Loader.load = load_browser;
	}
	
})();