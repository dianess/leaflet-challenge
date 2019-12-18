# leaflet-challenge

This visual shows the tectonic plates and the earthquakes of magnitude 4.5 and higher from the past 7 days, updated each time the page is loaded.

My data is pulled from this link: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php. I centered my map on Nairobi, Kenya, with a zoom level of 2 so that almost all the earth is visible when landing on the page.

A user has the choices of a street map, a dark map, or a satellite map to view the earthquakes from the data set above. The user can turn on/off the earthquake option and the tectonic plates option.

The legend describes the different colored circles based on earthquake magnitude. On the map, the size of the circles also corresponds to the earthquake magnitude, where larger and darker circles are those with higher magnitudes.

Notes: Web page to find color schemes: https://www.schemecolor.com/
       Web page to find code for legend: https://leafletjs.com/examples/choropleth/
       Web page where I found calculation for circles based on magnitude:
            https://developers.google.com/maps/documentation/javascript/earthquakes
       Web page for help with tectonic plates: https://leafletjs.com/examples/geojson/     