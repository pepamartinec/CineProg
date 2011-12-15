CineProg - Cinema program scrapper and semantic repository
==========================================================

Installation
------------
    npm install

Start
-----
    node server.js

REST interface
--------------
 - Fetch cinema program within date range
   - url: /search
   - params:
     - type = cinema
     - cinema
     - branch
     - startDate
     - endDate
   - example:

    GET http://127.0.0.1:8080/search?cinema=CineStar&branch=plzen&startDate=2011-12-15&endDate=2011-12-15&type=cinema

 - Fetch play-times of given movie
   - url: /search
   - params:
     - type = movie
     - movie
     - startDate
     - endDate
   - example:

    GET http://127.0.0.1:8080/search?movie=Poupata&startDate=2011-12-15&endDate=2011-12-15&type=movie

 - Get known cinemas list (including their branches)
   - url: /cinemas
   - example:

    GET http://127.0.0.1:8080/cinemas

Response is always in JSON-LD format.
