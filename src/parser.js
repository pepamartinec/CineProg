var request = require('request'),
    jsdom   = require('jsdom');

exports.load = function( url, parser )
{
	var handler = function( error, response, body ) {
		if( error && response.statusCode !== 200 ) {
			console.log('Error when contacting google.com');
		}
		
		jsdom.env({
			html    : body,
			scripts : [
			  'http://code.jquery.com/jquery-1.5.min.js'
			]
		
		}, parser );
	};
	
	// do request
	request( { uri : url }, handler );	
};