var express 		= require('express');
var router			= express.Router();	 
var fs 				= require("fs");	
var request			= require('request');
var config			= require('./config.js');
var path			= require("path");	
var incident = require("./sn_api/incident");
var Otps ={};
router.get('/close',function(req,res){
	res.redirect('close.html');
})

router.post('/botHandler',function(req, res){		
	var responseObj = JSON.parse(JSON.stringify(config.responseObj));
	var actionName = req.body.queryResult.action;
	switch(actionName){
		case 'input.welcome':func = welcome;break;
		case 'input.verifyOtp': func = verifyOtp;break;
		case 'input.unknown':func = defaultFallBack;break;
		case 'input.create_incident': func = createIncident;break;
		case 'input.incident_status_by_id': func = getIncidentById;break;
	}
	func(req.body,responseObj)
	.then(function(result){
		console.log(result);
		console.log(JSON.stringify(result));
		res.json(result).end();
	})
	
	/*
	
	*/
	
});	


router.post('/validateUser',function(req, res){
	var emps = config.employees;
	currentSession = req.body.sess;
	console.log(typeof(emps[req.body.username]));
	if(typeof(emps[req.body.username])!='undefined'){
		var smsApi = config.smsApi.replace('phonenumber',emps[req.body.username].ph);	
		smsApi = smsApi.replace('Otpnumber',45627);
		smsApi = smsApi.replace('name',emps[req.body.username].name);
		Otps[req.body.sess] = 45627;
		console.log(smsApi,emps[req.body.username].ph);
		request(smsApi,function(error,response,body){
			console.log(error,body);
			res.status(200);
			res.json({status:true}).end();
		});		
	}else{
		console.log('fail');
		res.status(400);
		res.json({status:false}).end();
	}		
});
var welcome = function(req, responseObj){
	return new Promise(function(resolve,reject){
		simpleResponse(responseObj, "Hi I'm Hema !. I can help you to manage your leaves,search an employee, account recovery and create or track your service tickets. Please login to begin.")
		.then(function(result){
			var buttons = [
			  {
				"title": "Login",
				"openUrlAction": {
				  "url": "https://logintests.herokuapp.com/login.html?convId="+req.originalDetectIntentRequest.payload.conversation.conversationId
				}
			  }
			]
			return basicCard(result,"Please login to Help you", buttons);
		})
		.then(function(result){
			resolve(result);		
		})
	});
}

var createIncident = function(req, responseObj){
	return new Promise(function(resolve,reject){
		console.log('Description::',req.queryResult.parameters.Incident_Description,"Urgency",req.queryResult.parameters.Urgency_Level);
		/*simpleResponse(responseObj, "Your incident has been created successfully.")
		.then(function(result){
			var chips = [{"title": "Menu"}]
			return suggestions(result,chips);
		})
		.then(function(result){
			resolve(result);		
		})*/
		console.log("Inside Create Incident");
		
						var description = "";
						var urgency = "";
						var message = "";
		
						description = req.queryResult.parameters.Incident_Description;
						urgency = req.queryResult.parameters.Urgency_Level;
		
						console.log("Description " + description + "\nUrgency " + urgency);
		
		
						incident.createIncident(description, urgency).then(function(resultObj){ //returns promise 
								console.log(resultObj)
		
								message = "We are sorry for the inconvenience.We have logged your incident in our system with the incident iD '" + resultObj.number.replace("INC", "INC ") + "'";
							simpleResponse(responseObj, message)
								.then(function(result){
									var chips = [{"title": "Menu"}]
									return suggestions(result,chips);
								})
								.then(function(result){
									resolve(result);		
								})
								console.log(message);
						});
	});
	/*console.log("Inside Create Incident");
	
					var description = "";
					var urgency = "";
					var message = "";
	
					description = req.body.result.parameters.Incident_Description;
					urgency = req.body.result.parameters.Urgency_Level;
	
					console.log("Description " + description + "\nUrgency " + urgency);
	
	
					incident.createIncident(description, urgency).then(function(result){ //returns promise 
							console.log(result)
	
							message = "We are sorry for the inconvenience.<br>We have logged your incident in our system with the incident id '" + result.number.replace("INC", "INC ") + "'";
	
							callback({
									status: "ok",
									speech: message,
									displayText:message,
									data: {
											"facebook":{
													"attachment": {
															"type": "template",
															"payload": {
																	"template_type": "button",
																	"text": message + "<br><br>What do you want to do next?",
																	"buttons": [
																			{
																					"type": "postback",
																					"title": "Start Over",
																					"payload": "Hi"
																			},
																			{
																					"type": "postback",
																					"title": "End Conversation",
																					"payload": "Bye"
																			}
																	]
															}
													}
											}
									},
									contextOut: [],
									source: "boehringer-ingelheim"
							});
	
					});*/
}


var getIncidentById = function(req, responseObj){
	return new Promise(function(resolve,reject){
		//console.log('Description::',req.queryResult.parameters.Incident_Description,"Urgency",req.queryResult.parameters.Urgency_Level);
		/*simpleResponse(responseObj, "Your incident has been created successfully.")
		.then(function(result){
			var chips = [{"title": "Menu"}]
			return suggestions(result,chips);
		})
		.then(function(result){
			resolve(result);		
		})*/
		console.log("Inside Incident status");
		
					var incident_number = "";
					incident_number = "INC"+req.queryResult.parameters.incident_number;
		
						//console.log("Description " + description + "\nUrgency " + urgency);
		
		
						var message = "";
						
								console.log("Incident Number " + incident_number)
						
						
								incident.getIncidentByIncidentId(incident_number).then(function(resultobj){ //returns promise 
									console.log(resultobj[0]);
								
									if (resultobj.length == 0) {
										message = "There is no record for the given incident number " + incident_number.replace("INC", "INC ");
							simpleResponse(responseObj, message)
								.then(function(result){
									var chips = [{"title": "Menu"}]
									return suggestions(result,chips);
								})
								.then(function(result){
									resolve(result);		
								})
								console.log(message);
							}
							else{
								message = "<strong>Below are the details for the requested Incident:-</strong><br><br><strong>Incident ID :</strong> " + resultobj[0].number.replace("INC", "INC ") + "<br><strong>Short Description :</strong> " + resultobj[0].short_description + "</br><strong>Status :</strong> " + stateDecode(resultobj[0].state) + "<br><strong>Assigned To :</strong> " + req.app.locals.decodeAssignedTo(resultobj[0].assigned_to);
								simpleResponse(responseObj, message)
									.then(function(result){
										var chips = [{"title": "Menu"}]
										return suggestions(result,chips);
									})
									.then(function(result){
										resolve(result);		
									})
									console.log(message);
							}
						});
	});
	console.log("Inside Incident Status");
	
			var incident_number = "";
			incident_number = "INC"+req.body.result.parameters.incident_number;
	
			var message = "";
	
			console.log("Incident Number " + incident_number)
	
	
			incident.getIncidentByIncidentId(incident_number).then(function(result){ //returns promise 
				console.log(result[0]);
			
				if (result.length == 0) {
					message = "There is no record for the given incident number " + incident_number.replace("INC", "INC ");
	
					callback({
						status: "ok",
						speech: message,
						displayText:message,
						data: {
							"facebook":[
								{
									"sender_action": "typing_on"
								},
								{
									"text": message,
								},
								{
									"sender_action": "typing_off"
								},
							]
						},
						contextOut: [],
						source: "boehringer-ingelheim"
					});
				} else {
					
					message = "<strong>Below are the details for the requested Incident:-</strong><br><br><strong>Incident ID :</strong> " + result[0].number.replace("INC", "INC ") + "<br><strong>Short Description :</strong> " + result[0].short_description + "</br><strong>Status :</strong> " + stateDecode(result[0].state) + "<br><strong>Assigned To :</strong> " + req.app.locals.decodeAssignedTo(result[0].assigned_to);
	
					callback({
						status: "ok",
						speech: message,
						displayText:message,
						data: {
							"facebook":{
								"attachment": {
									"type": "template",
									"payload": {
										"template_type": "button",
										"text": message + "<br><br>What do you want to do next?",
										"buttons": [
											{
												"type": "postback",
												"title": "Start Over",
												"payload": "Hi"
											},
											{
												"type": "postback",
												"title": "End Conversation",
												"payload": "Bye"
											}
										]
									}
								}
							}
						},
						contextOut: [],
						source: "boehringer-ingelheim"
					});
				}
			});
}

var loginSucess = function(responseObj){
	return new Promise(function(resolve,reject){
		console.log('login success');
		simpleResponse(responseObj, "Login success")
		.then(function(result){	
			console.log('simple response');
			var items = [
				{
				  "optionInfo": {
					"key": "HR",
					"synonyms": [
						"HR Self Service"
					]
				  },
				  "title": "HR Self Service",
				  "description": "for Leave management, Employee Search",				  
				},
				{
				  "optionInfo": {
					"key": "IT",
					"synonyms": [
						"IT Self Service"
					]
				  },
				  "title": "IT Self Service",
				  "description": "For : Account recovery , Help desk",				  
				},
				{
				  "optionInfo": {
					"key": "Meeting",
					"synonyms": [
						"Meeting Self Service"
					]
				  },
				  "title": "Meeting Self Service",
				  "description": "For : creating create, cancel and reschedule meeting",				  
				}
			  ];
			return listItem(result, "Kindly select the service category",items);	
		})
		.then(function(result){		
			var chips = [];							
			console.log('sugge');
			return suggestions(result, chips);
		})
		.then(function(result){	
			//console.log(JSON.stringify(result));
				console.log('leving log sucess');
			resolve(result);
		})
		
	});
};

var verifyOtp = function(req,responseObj){
	return new Promise(function(resolve,reject){
		console.log(req.originalDetectIntentRequest.payload.conversation.conversationId);
		console.log(JSON.stringify(Otps));
		console.log(req.queryResult.parameters.otp);
		if(Otps[req.originalDetectIntentRequest.payload.conversation.conversationId]==req.queryResult.parameters.otp){		
			loginSucess(responseObj)
			.then(function(result){	
					console.log('leveing verify OTp');
			//	console.log(JSON.stringify(result));			
				resolve(result);
			})		
		}else{
			simpleResponse(responseObj, "Invalid OTP : please enter valid password")
			.then(function(result){
				resolve(result);				
			});		
		}
	});
}
var listItem = function (response,text, items){
	return new Promise(function(resolve,reject){		
		console.log(' list item');
			response.payload.google.systemIntent = {
				"intent": "actions.intent.OPTION",
				"data": {
					"@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
					"listSelect": {
					  "title": text,
					  "items": items
					}
				}
			}		
		resolve(response);
	});
}
var simpleResponse = function(response, responseText){
	return new Promise(function(resolve,reject){
		response.payload.google.richResponse.items.push({
			"simpleResponse": {
				"textToSpeech": responseText,
				"displayText": responseText
			}
		});	
		resolve(response);
	})
			
}
var basicCard = function(response,text, buttons){
	return new Promise(function(resolve,reject){		
		response.payload.google.richResponse.items.push(
			{"basicCard": {
			  "formattedText": text,			 
			  "buttons": buttons,
			   "image": {},
			}		
		});		
	resolve(response);
	});
}

var suggestions = function(response, chips){
	console.log('suggestions');
	return new Promise(function(resolve,reject){		
		response.payload.google.richResponse.suggestions = chips;		
		//console.log(JSON.stringify(response));
		resolve(response);
	});	
}

var defaultFallBack = function(req, response){
	return new Promise(function(resolve,reject){
		response.payload.followupEvent = {
					name:"HRService",
					data:{},
			}
		resolve(response);		
	});
}
module.exports = router;





