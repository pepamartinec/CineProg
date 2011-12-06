// utilities
var abstractFn = function() {};

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

/**
 * Cinema object
 * 
 * @class Cinema
 */
var Cinema = function( name )
{
	this.name       = name;
	this.placesList = {};
};

Cinema.prototype = {
	name         : null,
	program      : null,
	httpLoaderFn : null,
	placesList   : null,
	
	buildPlacesList : abstractFn, 
	loadProgram     : abstractFn,
	
	init : function( program, httpLoaderFn, callback )
	{
		this.program      = program;
		this.httpLoaderFn = httpLoaderFn;
		this.buildPlacesList( callback );		
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

var WindowCtx = function( document, jQuery )
{
	this.document = document;
	this.jQuery   = jQuery;
};

WindowCtx.prototype = {
	document : null,
	jQuery   : null
};
	
var loadPage = null;
	
// NodeJS environment
if( typeof module !== 'undefined' && module.exports ) {
	
	var request = require('request');
	var jsdom   = require('jsdom');
	
	loadPage = function( config, callback ) {
		console.log( '>>> load page', config );
		
		var handler = function( error, response, body ) {
			console.log( '>>> page loaded', config );
			
			if( error && response.statusCode !== 200 ) {
				console.log('Error when contacting google.com');
			}
			
			jsdom.env({
				html    : body,
				scripts : [ 'http://code.jquery.com/jquery-1.5.min.js' ],
				done    : function( error, window ) {
					doCallback( callback, [ window.document, window.jQuery ]);
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
	
// browser environment	
} else {		
	loadPage = function( config, callback ) {
		console.log( '>>> load page', config );
		
		if( typeof config !== 'object' ) {
			config = {
				url    : config,
				method : 'get',
				data   : {}
			};
			
		} else {
			config = {
				url    : config.url,
				method : config.method | 'get',
				data   : config.data   | {}
			};
		}
		
		var iframeID = 'abcdefg';
		
		var formItems = [];
		for( var idx in config.data ) {
			formItems.push( '<input name="'+ idx +'" value="'+ config.data[ idx ] +'" />' );
		}
		
		var loadFrame = jQuery(
			'<div style="width:0px;height:0px;display:none;">'+
				'<iframe name="'+ iframeID +'" id="'+ iframeID +'"></iframe>'+
				'<form action="'+ config.url +'" method="'+ config.method +'" target="'+ iframeID +'">'+ formItems.join('') +'</form>'+
			'</div>'
		);
		
		loadFrame.find( 'iframe' ).bind( 'load', function() {			
			console.log( '>>> page loaded', config );
			
			jQuery( this.contentDocument ).ready( function( localJQ ) {
				doCallback( callback, [ this.contentDocument, localJQ ]);
				loadFrame.remove();
			});
		});

		loadFrame.appendTo('body');
		loadFrame.find('form').submit();
	};
}

var loaders = {};

/**
 * Defines new program loader
 * 
 * @public
 * @param {String} name
 * @param {Object} definition
 */
var defineCinema = function( name, definition )
{	
	var loader = new Cinema();
	
	for( var item in definition ) {
		if( definition.hasOwnProperty( item ) === false ) {
			continue;
		}
		
		loader[ item ] = definition[ item ];
	}
	
	
	loaders[ name ] = loader;
};

/**
 * Initializes supplied loaders
 * 
 * @public
 * @param {Array}    loaderNames list of loader names
 * @param {Function} callback    done callback
 */
var initCinemas = function( loaderNames, program, callback )
{
	var loadersNo = loaderNames.length;
	
	for( var i = 0, ln = loaderNames.length; i < ln; ++i ) {
		var loaderName = loaderNames[ i ];
				
		if( loaders[ loaderName ] == null ) {
			throw "Invalid loader name '"+ loaderName +"'";
		}
		
		console.log( '   - starting initialization of '+ loaderName +' loader' );
		loaders[ loaderName ].init( program, loadPage, function() {
			console.log( '   - '+ loaderName +' loader initialized' );
			
			if( --loadersNo === 0 && callback ) {
				doCallback( callback );
			}
		});
	}
};

/**
 * Loads program by supplied criteria
 * 
 * @param {String}   cinema   cinema name
 * @param {String}   place    cinema place
 * @param {String}   date     program date
 * @param {Function} callback done callback
 */
var loadProgram = function( cinema, place, date, program, callback )
{
	if( loaders[ cinema ] == null ) {
		throw "Invalid loader name '"+ loaderName +"'";
	}
	
	console.log( "Loading "+ cinema +" - "+ place +" program on "+ date );
	
	loaders[ cinema ].loadProgram( place, date, program, callback );
};

// export public items
exports.Program      = Program;
exports.defineCinema = defineCinema;
exports.initCinemas  = initCinemas;
exports.loadProgram  = loadProgram;
exports.loaders      = loaders;
