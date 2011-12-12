var rdfstore = require('rdfstore');

rdfstore.create( function( store ) {
	var cinemas = [{
		'@context' : {
			'sch' : 'http://www.schema.org/'
		},
		
		'@subject' : 'http://cineprog.local/cinemas/CineStar',
		'@type'    : 'sch:Organization',
		'sch:name' : 'Titanic',
		'sch:url'  : 'http://www.cinestar.cz/'
	},{
		'@context' : {
			'sch' : 'http://www.schema.org/',
			'@coerce' : {
				'@iri' : 'sch:branchOf'
			}
		},
		
		'@subject'     : 'http://cineprog.local/cinemas/CineStar#andel',
		'@type'        : 'sch:MovieTheater',
		'sch:name'     : 'CineStar Anděl',
		'sch:url'      : 'http://www.cinestar.cz/andel',
		'sch:branchOf' : 'http://cineprog.local/cinemas/CineStar'
	},{
		'@context' : {
			'sch' : 'http://www.schema.org/',
			'@coerce' : {
				'@iri' : 'sch:branchOf'
			}
		},
		
		'@subject'     : 'http://cineprog.local/cinemas/CineStar#flora',
		'@type'        : 'sch:MovieTheater',
		'sch:name'     : 'CineStar Flóra',
		'sch:url'      : 'http://www.cinestar.cz/flora',
		'sch:branchOf' : 'http://cineprog.local/cinemas/CineStar'
	}];
	
	var events = [{
		'@context' : {
			'sch' : 'http://www.schema.org/',
			'xsd' : 'http://www.w3.org/2001/XMLSchema#',
			'@coerce' : {
				'@iri'         : 'sch:location',
				'xsd:date'     : 'sch:startDate',
				'xsd:duration' : 'sch:duration'
			}
		},
		
		'@subject'      : 'http://cineprog.local/events/1',
		'@type'         : 'sch:TheaterEvent',
		'sch:name'      : 'Titanic',
		'sch:startDate' : new Date( 2010, 10, 12, 15, 45 ),
		'sch:duration'  : 'PT2H14M',
		'sch:location'  : 'http://cineprog.local/cinema/CineStar#plzen'
		
	},{
		'@context' : {
			'sch' : 'http://www.schema.org/',
			'xsd' : 'http://www.w3.org/2001/XMLSchema#',
			'@coerce' : {
				'@iri'         : 'sch:location',
				'xsd:date'     : 'sch:startDate',
				'xsd:duration' : 'sch:duration'
			}
		},
		
		'@subject'      : 'http://cineprog.local/events/2',
		'@type'         : 'sch:TheaterEvent',
		'sch:name'      : 'Titanic',
		'sch:startDate' : new Date( 2010, 10, 12, 18, 00 ),
		'sch:duration'  : 'PT2H14M',
		'sch:location'  : 'http://cineprog.local/cinema/CineStar#plzen'
		
	},{
		'@context' : {
			'sch' : 'http://www.schema.org/',
			'xsd' : 'http://www.w3.org/2001/XMLSchema#',
			'@coerce' : {
				'@iri'         : 'sch:location',
				'xsd:date'     : 'sch:startDate',
				'xsd:duration' : 'sch:duration'
			}
		},
		
		'@subject'      : 'http://cineprog.local/events/3',
		'@type'         : 'sch:TheaterEvent',
		'sch:name'      : 'Vetřelec',
		'sch:startDate' : new Date( 2010, 10, 12, 15, 25 ),
		'sch:duration'  : 'PT1H49M',
		'sch:location'  : 'http://cineprog.local/cinema/CineStar#plzen'
		
	},{
		'@context' : {
			'sch' : 'http://www.schema.org/',
			'xsd' : 'http://www.w3.org/2001/XMLSchema#',
			'@coerce' : {
				'@iri'         : 'sch:location',
				'xsd:date'     : 'sch:startDate',
				'xsd:duration' : 'sch:duration'
			}
		},
		
		'@subject'      : 'http://cineprog.local/events/4',
		'@type'         : 'sch:TheaterEvent',
		'sch:name'      : 'Titanic',
		'sch:startDate' : '2010-10-13+18:00',
		'sch:duration'  : 'PT2H14M',
		'sch:location'  : 'http://cineprog.local/cinema/CineStar#plzen'
		
	}];
	
	var query = 'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
				PREFIX sch: <http://www.schema.org/>\
				PREFIX : <http://cineprog.local/>\
				SELECT ?name ?date {\
					?m sch:name "Titanic" .\
					?m rdf:type sch:TheaterEvent .\
					?m sch:name ?name .\
					?m sch:startDate ?date\
				}';
	/*
	var query = 'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
				PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
				PREFIX sch: <http://www.schema.org/>\
				PREFIX : <http://cineprog.local/>\
				SELECT ?m {\
					?m sch:location <http://cineprog.local/cinema/CineStar#plzen> .\
					?m sch:startDate "2010-10-13+18:00"^^xsd:date\
				}';
	*/
	store.load( 'application/json', cinemas, function(success, results) {
	store.load( 'application/json', events, function(success, results) {
//		store.node("http://cineprog.local/events/1", 'http://cineprog.local/events/', function(success, graph) {
//			console.log(graph);
//			});
		
		store.execute( query, function( success, result ) {
			console.log(result);
		});
	});
	});
});
