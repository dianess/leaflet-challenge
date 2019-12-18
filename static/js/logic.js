// Store API endpoint inside queryUrl
// Using data for the last week and earthquakes with a magnitude of 4.5 & higher
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"

// Function to set colors based on the earthquake magnitude (purple/violet scheme)
function getColor(d) {
  return d > 5.5 ? '#8C00FC' : // '#011E58' :  blue scheme doesn't show on ocean
        d > 5.3 ?  '#9C14FC' : // '#0622B4' :
        d > 5.1 ?  '#AF2EFA' : // '#0040E0' :
        d > 4.9 ?  '#C74EF4' : // '#427CEC' :
        d > 4.7 ?  '#DE6DF1' : // '#5F9EFF' :
                    '#ED81EE'; // '#78B6FF';
 }

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
}); //ends d3.json

function createFeatures(earthquakeData) {

  // Define a function to run once for each feature in the features array
  // Give each feature a pop-up box describing the magnitude, place, and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup('<div align="center">' + "<h3>" + "Magnitude: "  + feature.properties.mag + "<p>" + feature.properties.place + "</p>" +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p></div>");
  }  //ends function onEachFeature

  // Works with pointToLayer below to provide circles with certain colors 
  // from the function above: getColor
  function style(feature) {
    var mag = feature.properties.mag; 
    var color_value = getColor(mag)
  
    // The calculation for radius determines the size of the circle based on the magnitude
    return {radius: Math.pow(2, feature.properties.mag) / 2,  // bigger differences in circle size for visibility because my range of mags is small
    // return {radius: Math.sqrt(Math.abs(feature.properties.mag)) * 5, // Option 2 - not as obvious (might work for range of 1-10 mags)
      color: "#000",
      fillColor:color_value,
      fillOpacity: 0.8,
      weight: 1,
      opacity: 0}
    }  //ends function "style"
  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // Works with the function style above and to change the default markers to circles
    // with specific colors
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, style(feature));
    },  // ends pointToLayer

  });  //ends var earthquakes

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);

// Tectonic Plates Section  ****  
  // Add tectonic plates (i.e. fault lines)
  var tectonicPlatesPath = "data/PB2002_boundaries.json";
  d3.json(tectonicPlatesPath,function(platesData) {
    console.log(platesData);
    var lines = platesData.features[0].geometry.coordinates;
    console.log(lines);

    var myLines = [{
      "type": "LineString",
      "coordinates": lines
  }];

    var myStyle = {
      "color": "#ff7800",
      "weight": 5,
      "opacity": 0.65,
    };   //ends variable myStyle

    const tectonicPlates = L.geoJson(myLines,{
      style: myStyle,
    }); //ends tectonicPlates
    console.log(tectonicPlates);
  });  // ends d3.json

  // Sending our tectonic plates layer to the createMap function
  createMap(tectonicPlates);
//  Ends Tectonic Plates Section ****

} //ends function createFeatures

function createMap(earthquakes) {

  // Define streetmap, darkmap, and satellitemap layers
  var streetMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetMap,
    "Dark Map": darkMap,
    "Satellite Map": satelliteMap
  };
  
  // Create overlay object to hold our overlay layers
  var overlayMaps = {
    Earthquakes: earthquakes,
    //"Tectonic Plates": tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
        1.2921, 36.8219   // Nairobi, Kenya
    ],
    zoom: 2,  // to view most of the world
    layers: [streetMap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });

  // Add information to the legend
  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "info legend");
    var magRange = [4.5, 4.7, 4.9, 5.1, 5.3, 5.5];
    var labels = ['<strong> Earthquake Magnitude </strong>'];
 
    // Loop through the intervals and generate a label 
    // with a colored circle for each interval
    for (var i = 0; i < magRange.length; i++) {
     labels.push(
      '<i class="circle" style="background:' + getColor(magRange[i]) + '"></i> ' +
      magRange[i] + (magRange[i+1] ? '&ndash;' + magRange[i+1] : '+'));
      }  //ends for loop
      div.innerHTML = labels.join('<br>');
      return div;

  };  // ends legend.onAdd

legend.addTo(myMap);
//tectonicPlates.addTo(myMap);
                        
};  //ends function createMap
