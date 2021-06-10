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
function GeoTag(name, longitude, latitude, hashtag) {
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
exports.taglist = taglist;

function addGeoTag(tag) {
    taglist.push(tag);
}

function deleteGeoTag(tag) {
    var index = 0;
    var indexOfElement;
    taglist.forEach(function (gtag) {
        if (gtag == tag) {
            indexOfElement = index;
        } else {
            index++;
        }
    })
    taglist.splice(indexOfElement);
}

function getGeoTagsInRadius(longitude, latitude, radius) {
    var result;
    taglist.forEach(function (gtag) {
        var a = gtag.longitude - longitude;
        var b = gtag.latitude - latitude;
        var hypothenuse = Math.hypot(a, b);
        if (hypothenuse <= radius) {
            result.push(gtag);
        }
    });
    return result;
}

function getGeoTagsByText(text) {
    var result;
    taglist.forEach(function (gtag) {
        if (gtag.name == text || gtag.hashtag == text) {
            result.push(gtag);
        }
    });
    return result;

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
    res.render('gta', {
        taglist: []
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */
app.post('/tagging', function (req, res) {
    long = req.body.longitude;
    lat = req.body.latitude;
    name = req.body.name;
    hash = req.body.hashtag;
    tag = new GeoTag(name, long, lat, hash);
    console.log(tag);
    addGeoTag(tag);
    res.render('gta', {
        taglist: getGeoTagsInRadius(long, lat, 100)
    });


    //Neues Geotag erstellen und speichern
    //Antwort erstellen
});

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

// TODO: CODE ERGÄNZEN

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
