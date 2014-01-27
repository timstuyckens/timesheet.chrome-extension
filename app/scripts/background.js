'use strict';

var manifest = chrome.runtime.getManifest();

if(chrome.identity.onSignInChanged){	
	//currently only in canary
	chrome.identity.onSignInChanged.addListener(function(identity){
		console.log("Identity changed",identity);
	});	
}

var tryGetCurrentUser=function(){	
	//http://developer.chrome.com/extensions/app_identity.html#update_manifest
	var dfd=new $.Deferred();
	chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
		if(token){
			console.log("token", token);
			dfd.resolve(token);
		}	
	 	dfd.resolve("");
	});
	return dfd;
};
var getLocation=function(){
	var dfd=new $.Deferred();
	navigator.geolocation.getCurrentPosition(function(position){
		dfd.resolve(position.coords);
	}, function(err){
		dfd.reject(err);
		console.log("Error getting current position",err);
	});
	return dfd;
}

var postGeoLocation=function(){

	$.when(tryGetCurrentUser(),getLocation()).then(function(user,coords){
		var loc=[coords.latitude,coords.longitude];
		var url="http://timesheetservice.herokuapp.com/entry"
		//var url="http://localhost:3000/entry"
		var data = { 
			type: 'locationinfo', 
			userinfo: { 
				deviceid: manifest.name+"-"+manifest.version, 
				devicetype: 'Chrome',
				mail:user
			},
			loc: loc
		};

		$.post(url,data).done(function(d){
			console.table("POST SUCCES",d,data);
		}).fail(function(a,b,c,d){
			console.log("POST failed",a,b,c,d);
		});	

	});
};


var alarmKey="servicePostAlarm";
//locally you can set this lower than 1 (eg: for debugging, set 0.1)
var alarmInfo={periodInMinutes :0.1 };
var alarmCallbacks={};
alarmCallbacks[alarmKey]=function(){
	postGeoLocation();
};

var alarm=chrome.alarms.create(alarmKey, alarmInfo);
chrome.alarms.onAlarm.addListener(function(aInfo){
	alarmCallbacks[aInfo.name]();
});