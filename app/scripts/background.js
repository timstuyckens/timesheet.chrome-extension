'use strict';

var manifest = chrome.runtime.getManifest();

var postGeoLocation=function(position){
	//console.log(position.coords);
	var loc=[position.coords.latitude,position.coords.longitude];

	var url="http://timesheetservice.herokuapp.com/entry"
	//var url="http://localhost:3000/entry"
	var data = { 
		type: 'locationinfo', 
		userinfo: { 
			deviceid: manifest.name+"-"+manifest.version, 
			devicetype: 'Chrome'
		},
		loc: loc
	};

	$.post(url,data).done(function(d){
		console.table("POST SUCCES",d);
	}).fail(function(a,b,c,d){
		console.log("POST failed",a,b,c,d);
	});	
};
var logError=function(err){
	console.log("Error getting current position",err);
};


var alarmKey="servicePostAlarm";
var alarmInfo={periodInMinutes : 0.1};
var alarmCallbacks={};
alarmCallbacks[alarmKey]=function(){
	navigator.geolocation.getCurrentPosition(postGeoLocation, logError);
};

var alarm=chrome.alarms.create(alarmKey, alarmInfo);
chrome.alarms.onAlarm.addListener(function(aInfo){
	alarmCallbacks[aInfo.name]();
});