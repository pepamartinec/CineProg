var request = require('request'),
    jsdom   = require('jsdom');

var doCallback = function( callback, args )
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

var httpLoaderFn = function( config, callback ) {
	console.log( '>>> load page', config );
	
	var handler = function( error, response, body ) {
		if( error && response.statusCode !== 200 ) {
			console.log( '>>> failed to load page', config, response );
			return;
		}
		
		console.log( '>>> page loaded', config );
		
		jsdom.env({
			html    : body,
			scripts : [ 'http://code.jquery.com/jquery-1.5.min.js' ],
			done    : function( error, window ) {
				doCallback( callback, [ window ]);
			}
		});
	};
	
	if( typeof config !== 'object' ) {
		config = {
			url : config
		};
	}
	
	// do request
	request({
		uri    : config.url,
		method : config.method | 'GET',
		data   : config.data   | null
	}, handler );		
};

var abstractFn = function() { throw 'Unimplemented abstract function'; };

var applyConfig = function( target, config )
{
	for( var idx in config ) {
		if( config.hasOwnProperty( idx ) === false || target[ idx ] === undefined ) {
			continue;
		}
		
		target[ idx ] = config[ idx ];
	}	
};

// public module interface
exports.doCallback   = doCallback;
exports.httpLoaderFn = httpLoaderFn;
exports.abstractFn   = abstractFn;
exports.applyConfig  = applyConfig;