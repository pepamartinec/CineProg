CREATE TABLE cinemas (
	ID        INTEGER PRIMARY KEY AUTOINCREMENT,
	code_name TEXT NOT NULL,
	name      TEXT NOT NULL,
	url       TEXT NULL
);

CREATE TABLE cinemas_branches (
	ID        INTEGER PRIMARY KEY AUTOINCREMENT,
	code_name TEXT NOT NULL,
	name      TEXT NOT NULL,
	url       TEXT NULL,
	cinema_ID INTEGER,
	
	FOREIGN KEY ( cinema_ID ) REFERENCES cinemas ( ID )
);

CREATE TABLE events (
	ID          INTEGER PRIMARY KEY AUTOINCREMENT,
	name        TEXT NOT NULL,
	start_date  INTEGER NOT NULL,
	location_ID INTEGER,
	
	FOREIGN KEY ( location_ID ) REFERENCES cinemas_branches ( ID )
);


CREATE TABLE cinemas ( ID INTEGER PRIMARY KEY AUTOINCREMENT, code_name TEXT NOT NULL, name TEXT NOT NULL, url TEXT NULL );
CREATE TABLE cinemas_branches ( ID INTEGER PRIMARY KEY AUTOINCREMENT, code_name TEXT NOT NULL, name TEXT NOT NULL, url TEXT NULL, cinema_ID INTEGER, FOREIGN KEY ( cinema_ID ) REFERENCES cinemas ( ID ) );
CREATE TABLE events ( ID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, start_date INTEGER NOT NULL, location_ID INTEGER, FOREIGN KEY ( location_ID ) REFERENCES cinemas_branches ( ID ) );