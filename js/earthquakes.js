/* earthquakes.js
    Script file for the INFO 343 Lab 7 Earthquake plotting page

    SODA data source URL: https://soda.demo.socrata.com/resource/earthquakes.json
    app token (pass as '$$app_token' query string param): Hwu90cjqyFghuAWQgannew7Oi
*/

//create a global variable namespace based on usgs.gov
//this is how JavaScript developers keep global variables
//separate from one another when mixing code from different
//sources on the same page
var gov = gov || {};
gov.usgs = gov.usgs || {};

//base data URL--additional filters may be appended (see optional steps)
//the SODA api supports the cross-origin resource sharing HTTP header
//so we should be able to request this URL from any domain via AJAX without
//having to use the JSONP technique
gov.usgs.quakesUrl = 'https://soda.demo.socrata.com/resource/earthquakes.json?$$app_token=Hwu90cjqyFghuAWQgannew7Oi';

//current earthquake dataset (array of objects, each representing an earthquake)
gov.usgs.quakes;

//reference to our google map
gov.usgs.quakesMap;

gov.usgs.iw; //infowindow reference

//AJAX Error event handler
//just alerts the user of the error
$(document).ajaxError(function(event, jqXHR, err){
    alert('Problem obtaining data: ' + jqXHR.statusText);
});



$( function(){
	getQuakes();
	//handler for the refresh button
	$('.refresh-button').click( function(){
		var min = $('.min-magnitude').val();
		getQuakes(min);
	});

});


function getQuakes(minMagnitude){	
	//if minMagnitude was specified, add that as a filter
    var url = gov.usgs.quakesUrl;
    if (minMagnitude)
        url += '&$where=magnitude>=' + minMagnitude;
	$('.message').html('Loading... <img src="img/loading.gif">');
	$.getJSON(url, function(quakes){
	    //quakes is an array of objects, each of which represents info about a quake
	    //see data returned from:
	    //https://soda.demo.socrata.com/resource/earthquakes.json?$$app_token=Hwu90cjqyFghuAWQgannew7Oi
	    //if a quakes dataset already exists, remove those items from the map before adding the new set
	    if(gov.usgs.quakes){
	    $.each(gov.usgs.quakes, function(){
	    	this.mapMarker.setMap(null);
	    });
	}
	    //set our global variable to the current set of quakes
	    //so we can reference it later in another event
	    gov.usgs.quakes = quakes;
	    $('.message').html('Displaying ' +quakes.length + ' earthquakes.');
	    if(!gov.usgs.quakesMap){
		    gov.usgs.quakesMap = new google.maps.Map($('.map-container')[0], {
	   			center: new google.maps.LatLng(0,0),        //centered on 0/0
	   			zoom: 2,                                    //zoom level 2
	    		mapTypeId: google.maps.MapTypeId.TERRAIN,   //terrain map
	    		streetViewControl: false                    //no street view
			});
		}
		addQuakeMarkers(gov.usgs.quakes, gov.usgs.quakesMap);
	});
}


//this function will take quake events stored in quake and add them to the
//google map stored in quake
function addQuakeMarkers(quakes, map){
	var infoWindow;
	$.each(quakes, function(){
		if(this.location){
			this.mapMarker = new google.maps.Marker({
   			map: map,
    		position: new google.maps.LatLng(this.location.latitude, this.location.longitude) });
		}
		infoWindow = new google.maps.InfoWindow({
    	content: new Date(this.datetime).toLocaleString() + 
            ': magnitude ' + this.magnitude + ' at depth of ' + 
            this.depth + ' meters'
		});

		registerInfoWindow(map, this.mapMarker, infoWindow);

	});
}



function registerInfoWindow(map, marker, infoWindow) {
    google.maps.event.addListener(marker, 'click', function(){
    	if(gov.usgs.iw){
    		gov.usgs.iw.close();
    	}
        gov.usgs.iw = infoWindow;
        infoWindow.open(map, marker);

    });                
} //registerInfoWindow()
