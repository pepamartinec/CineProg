var request = require('request'),
    jsdom   = require('jsdom'),
    doCallback = require('./utils.js').doCallback;

var abstractFn = function() { throw 'Unimplemented abstract function'; };

/**
 * Cinema object prototype
 * 
 * @class Cinema
 */
var Cinema = function( name, definition )
{
	this.name       = name;
	this.placesList = {};
	
	for( var item in definition ) {
		if( definition.hasOwnProperty( item ) === false ) {
			continue;
		}
		
		this[ item ] = definition[ item ];
	}
};

Cinema.prototype = {
	name         : null,
	program      : null,
	httpLoaderFn : null,
	placesList   : null,
	
	buildPlacesList : abstractFn, 
	loadProgram     : abstractFn,
	
	init : function( program, callback )
	{
		this.program = program;
		this.buildPlacesList( callback );		
	},
	
	httpLoaderFn : function( config, callback ) {
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
	},
	
	getPlacesList : function()
	{
		return this.placesList;
	},
	
	addProgramItem : function( place, item )
	{
		item.place = place;
		
		this.program.addItem( item );
	}
};

module.exports = Cinema;