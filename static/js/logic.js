// Store our API endpoint inside queryUrl
// var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2019-01-01&endtime=" +
//   "2019-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"

// Function to determine marker size based on earthquake magnitude
function markerSize(feature) {
  return Math.sqrt(Math.abs(feature.properties.mag)) * 5;  // Option 1
  // return Math.pow(2, feature.properties.mag) / 2;  // Option 2
}

// Function to set colors based on the earthquake magnitude (purple/violet scheme)
function getColor(d) {
  return d > 5.5 ? '#8C00FC' : // '#011E58' :  blue scheme doesn't show on ocean
        d > 5.3 ?  '#9C14FC' : // '#0622B4' :
        d > 5.1  ?  '#AF2EFA' : // '#0040E0' :
        d > 4.9  ?  '#C74EF4' : // '#427CEC' :
        d > 4.7   ?  '#DE6DF1' : // '#5F9EFF' :
                    '#ED81EE'; // '#78B6FF';
 }

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
}); //ends d3.json

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the magniture, place, and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup('<div align="center">' + "<h3>" + "Magnitude: "  + feature.properties.mag + "<p>" + feature.properties.place + "</p>" +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p></div>");
  }  //ends function onEachFeature

  // Works with pointToLayer below to provide circles with certain colors 
  // from the function above: getColor
  function style(feature) {
    var mag = feature.properties.mag; 
    var color_value=getColor(mag)
  
    return {radius: feature.properties.mag*2,
      color: "#000",
      fillColor:color_value,
      fillOpacity: 0.8,
      weight: 1,
      opacity: 0}
    }
  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // Works with the function style and to change the default markers to circles
    // with specific colors
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, style(feature));
    },

  });  //ends var earthquakes

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
} //ends function createFeatures

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
        1.2921, 36.8219   // Nairobi, Kenya
    ],
    zoom: 2,  // to view most of the world
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var magRange = [4, 5, 6, 7, 8, 9];
    var labels = [];
    var legendInfo = "<h5>Earthquake Magnitude</h5>";

    // Loop through the density intervals and generate a label 
    // with a colored square for each interval
    for (var i = 0; i < magRange.length; i++) {
      div.innerHTML += 
          '<i style="background:' + getColor(magRange[i]+0.01 ) + '"></i> ' +
          magRange[i] + (magRange[i + 1] ? '&ndash;' + magRange[i + 1] + '<br>' : '+');
    } // ends for loop

    return div;

    // magRange.forEach(function(magRange, i) {
    //   labels.push("<li style=\"background-color: " + colors[i] + "\"></li>");
    // }); // ends magRange.forEach

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };  // ends legend.onAdd


legend.addTo(myMap);
                        
};  //ends function createMap
