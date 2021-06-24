/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
//let radius = 100;

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */
app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */
var nextID = 0;

function GeoTag(name, longitude, latitude, hashtag) {
    this.id = nextID;
    nextID++;
    this.name = name;
    this.longitude = longitude;
    this.latitude = latitude;
    this.hashtag = hashtag;
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */
var taglist = [];

function addGeoTag(tag) {
    taglist.push(tag);
}

function deleteGeoTag(tag) {
    if (tag !== undefined) {
        var index = 0;
        var indexOfElement;
        taglist.forEach(function (gtag) {
            if (gtag === tag) {
                indexOfElement = index;
            } else {
                index++;
            }
        })
        taglist.splice(indexOfElement,1);
    }
}

function getGeoTagsInRadius(longitude, latitude, radius) {
    var res = [];
    taglist.forEach(function (gtag) {
        var a = gtag.longitude - longitude;
        var b = gtag.latitude - latitude;
        var hypothenuse = Math.hypot(a, b);
        if (hypothenuse <= radius) {
            res.push(gtag);
        }
    });
    return res;
}

function getGeoTagsByText(text) {
    var res = [];
    taglist.forEach(function (gtag) {
        if (gtag.name === text || gtag.hashtag === text) {
            res.push(gtag);
        }
    });
    return res;
}

function getGeoTagsByID(id) {
    let res;
    taglist.forEach(function (gtag) {
        if (gtag.id === id) {
            res = gtag;
        }
    });
    return res;
}

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function (req, res) {
    url_parts = new URL(req.url, 'http://${req.headers.host}');
    res.render('gta', {
        coordinates: [url_parts.latitude, url_parts.longitude],
        taglist: []
    });
});


/**
 * Neue Methoden für Aufgabe 4
 */

/**
 * POST Methode für GeoTag API zum Erstellen eines neuen GeoTags
 */
app.post('/geotags', function (req, res) {
    var postData = "";
    req.on("data", function (data) {
        postData += data;
    });

    req.on("end", function () {
        postData = JSON.parse(postData);
        console.log(postData);
        geotag = new GeoTag(postData.name, postData.longitude, postData.latitude, postData.hashtag);
        addGeoTag(geotag);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Location', "http://localhost:3000/geotags/" + geotag.id);
        res.send(null);
        //res.send(JSON.stringify(getGeoTagsInRadius(postData.longitude, postData.latitude, 100)));
    });

});

/**
 * GET Methode für das Erhalten aller (gefilterten) GeoTags
 * Filterung über Query Parameter "searchterm"
 */
app.get('/geotags', function (req, res) {
    let ret;
    let search = req.query.searchterm;
    if (search === undefined || search === "") {
        ret = taglist;
    } else {
        ret = getGeoTagsByText(search);
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(ret));
});

app.put('/geotags/:id', function (req, res) {
    var id = parseInt(req.params.id);
    var postData = "";
    req.on("data", function (data) {
        postData += data;
    });
    req.on("end", function () {
        postData = JSON.parse(postData);
        name = postData.name;
        longitude = postData.longitude;
        latitude = postData.latitude;
        hashtag = postData.hashtag;
        geotag = getGeoTagsByID(id);
        if (geotag === undefined) {
            res.status(404);
            res.send(null);
        } else {
            geotag.name = name;
            geotag.longitude = longitude;
            geotag.latitude = latitude;
            geotag.hashtag = hashtag;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(geotag));
        }
    });

});

app.delete('/geotags/:id', function (req, res) {
    var id = parseInt(req.params.id);
    geotag = getGeoTagsByID(id);
    deleteGeoTag(geotag);
    res.status(204);
    res.send(null);
});

app.get('/geotags/:id', function (req, res) {
    var id = parseInt(req.params.id);
    geotag = getGeoTagsByID(id);
    if (geotag === undefined) {
        res.status(404);
        res.send(null);
    } else {
        console.log(id);
        console.log(geotag);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(geotag));
    }
});


/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
