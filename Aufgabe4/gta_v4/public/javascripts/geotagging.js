/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function(onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function(error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function(position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function(position) {
        return position.coords.longitude;
    };

    // Hier API Key eintragen
    var apiKey = "Lg59AjpLTaw87fTokRohhp5GyP6i0rAp";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function() {
            if (document.getElementById("result-img").dataset.tags === "" ||
                document.getElementById("result-img").dataset.tags === "[]") {
                tags = undefined;
            } else {
                tags = JSON.parse(document.getElementById("result-img").dataset.tags);
            }

            if(document.getElementById("latitude").value === "" ||
                document.getElementById("longitude").value === "" ||
                document.getElementById("latitudeDiscovery").value === "" ||
                document.getElementById("longitudeDiscovery").value === "") {
                tryLocate(function (geo) {
                    document.getElementById("latitude").value = geo.coords.latitude;
                    document.getElementById("longitude").value = geo.coords.longitude;

                    //Im Discovery Teil die hidden Werte latitude und longtitude auf aktuellen Wert setzen.
                    document.getElementById("latitudeDiscovery").value = geo.coords.latitude;
                    document.getElementById("longitudeDiscovery").value = geo.coords.longitude;

                    //Map erzeugen
                    mapUrl = getLocationMapSrc(geo.coords.latitude, geo.coords.longitude, tags, undefined);
                    document.getElementById("result-img").src = mapUrl;
                },function (msg) {
                    alert(msg);
                });
            } else {
                //Zeichne Karte mit Koordinaten immer neu, könnten sich ja bei jedem Aufruf ändern?
                //Unsicher hier prüfen ob das Sinn macht oder dämlich ist.
                mapUrl = getLocationMapSrc(document.getElementById("latitudeDiscovery").value,
                    document.getElementById("longitudeDiscovery").value,
                    tags, undefined);
                document.getElementById("result-img").src = mapUrl;
            }
        }

    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

/**
 * Neue Methoden für Aufgabe 4 folgen hier!!
 */

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

//ajax initialisieren
var ajax = new XMLHttpRequest();

/**
 * Methode für readystate changes
 */
ajax.onreadystatechange = function () {
    //if(ajax.readyState === 4) {
        console.log("server state changed:" + ajax.readyState);
        //ajax.setRequestHeader("Content-Type", "application/json");
        //ajax.send(JSON.stringify({name: "test"}));
    //}
};

/**
 * EventListener Methode für Tagging Button
 */
function eventHandlerTagging(event) {
    console.log("Daten senden:");
    //starte ajax verbindung und sende Daten
    ajax.open("POST", "/tags", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify(new GeoTag(document.getElementById("name").value, document.getElementById("longitude").value,
        document.getElementById("latitude").value, document.getElementById("hashtag").value)));

    //updateMap();
}

/**
 * EventListener Methode für Button Discovery
 */
function eventHandlerDiscovery(event) {
    ajax.open("GET", "/discovery", true);
    ajax.send(null);

    updateMap();
}

/**
 * Funktion zum aktualisieren der Ergebnisliste und Karte
 */
function updateMap() {
    //Kein Plan ob das hier Sinn macht!
    console.log("update map"); //@todo
    //gtaLocator.updateLocation();
}

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function() {
    //alert("Please change the script 'geotagging.js'");
    //gtaLocator.updateLocation();

    //EventListenerMethoden auf den Buttons registrieren.
    document.getElementById("submit").addEventListener("click", eventHandlerTagging, true);
    //document.getElementById("apply").addEventListener("click", eventHandlerDiscovery, true);

});
