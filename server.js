var restify  = require('restify'),
	http     = require('http'),
	url      = require('url'),
    CineProg = require('./src/CineProg.js');

// register & init cinemas
var cinemas = ['CinemaCity','CineStar'];

console.log( '-- initializing cinemas', cinemas );
CineProg.registerCinemas( cinemas, function() {
	console.log( '-- cinemas initialized' );

	

});


var server = restify.createServer({
	serverName : 'CineProg',
	vesrion    : '0.1.0'
});

server.get( '/search', function( req, res )
{
	var rUrl   = url.parse( req.url, true ),
	    rQuery = rUrl.query.q;
	
	console.log( 'QUERY:',rQuery );
	
	var query = '\
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
		PREFIX sch: <http://www.schema.org/>\
		PREFIX :    <http://cineprog.local/>\
		SELECT * { '+ rQuery +' }\
	';
	
	CineProg.search( query, function( result ) {
		console.log('RESULT:',result);
		res.send( 200, result );
	});
});

server.get( '/load', function( req, res )
{
	var p = req.params;
	
	CineProg.loadProgram( p.cinema, p.place, new Date( p.date ), function() {
		res.send( 200 );		
	});
});

// run server
server.listen( 8080 );

/*
// start server
http.createServer( function ( request, response )
{
	var rUrl = url.parse( request.url );
	
	console.log( '<<< request: '+ request.url );
	
	switch( rUrl.pathname ) {
		case '/events':
		case '/cinemas':
			request_node( request, response );
			break;
			
		case '/search':
			request_search( request, response );
			break;
			
		default:
			request_404( request, response );
			break;
	}
	
	response.end();
	
}).listen(8080);

function request_404( request, response )
{
	response.writeHead( 404, { 'Content-Type': 'text/html' } );
	response.write( '<h1>404 Not Found</h1>' );
	response.write( 'The page you were looking for: '+ request.url +' can not be found' );
}

function request_node( request, response )
{
	response.writeHead( 200, { 'Content-Type': 'text/html' } );
	response.write( '<h1>This is not implemented yet..</h1>' );	
}

function request_search( request, response )
{
	var rUrl   = url.parse( request.url, true ),
	    rQuery = rUrl.query.q;
	
	console.log('QUERY: '+rQuery);
	
	var query = '\
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
		PREFIX sch: <http://www.schema.org/>\
		PREFIX :    <http://cineprog.local/>\
		SELECT * { '+ rQuery +' }\
	';
	
	
	response.writeHead( 200, { 'Content-Type': 'text/html' } );
	response.write( '<h1>This is not implemented yet..</h1>' );
}
*/