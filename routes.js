var express 		= require('express');
var router			= express.Router();	 
var fs 				= require("fs");	
var request			= require('request');
var config			= require('./config.js');
var path			= require("path");	
var incident = require("./sn_api/incident");
var Otps ={};
var initialReq = {};
var initalResp={};
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
		case 'input.get_leave_balance': func = getLeaveBalance;break;
	}
	func(req.body,responseObj)
	.then(function(result){
		console.log(result);
		console.log(JSON.stringify(result));
		if(actionName == 'input.welcome')
			res.json(result);
		else
		res.json(result).end();
	})	
});	


router.post('/validateUser',function(req, res){
	console.log(typeof(req.body.username));
	if(typeof(req.body.username)!='undefined'){
		/*var smsApi = config.smsApi.replace('phonenumber',emps[req.body.username].ph);	
		smsApi = smsApi.replace('Otpnumber',45627);
		smsApi = smsApi.replace('name',emps[req.body.username].name);
		Otps[req.body.sess] = 45627;
		console.log(smsApi,emps[req.body.username].ph);*/
		generateUserToken(req).then(function(data){
			if(data.auth){
				simpleResponse(initalResp, "Hi I'm Hema !. I can help you to manage your leaves,search an employee, account recovery and create or track your service tickets. Please select an option to begin.")
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
						res.json(result).end();
				})
			}
			else{
				console.log('fail');
				res.status(400);
				res.json({status:false}).end();
			}	
		})
		// request(smsApi,function(error,response,body){
		// 	console.log(error,body);
		// 	res.status(200);
		// 	res.json({status:true}).end();

		// });		
	}else{
		console.log('fail');
		res.status(400);
		res.json({status:false}).end();
	}		
});


generateUserToken = function(req){
	return new Promise(function(resolve,reject){
	console.log(initialReq.originalDetectIntentRequest.payload.user);
	var reqBody = initialReq.originalDetectIntentRequest.payload.user;
	reqBody.userName = req.body.username;
	reqBody.password = req.body.password;
	console.log('Request:',request);	
	var options ={
		method: "POST",
		url: config.generateTokenURL,
		body:reqBody,
		json:true
	}
	console.log(options);
	request(options,function(err,resp,body){
		if(err)
			//console.log(err);
		resolve(err);
		else	
			//console.log(body);
			resolve(body);
	});
});	
}

verifyUserToken = function(req){
	return new Promise(function(resolve,reject){
	console.log(req.originalDetectIntentRequest.payload);
	var options ={
		method: "POST",
		url: config.verifyTokenURL,
		body:req.originalDetectIntentRequest.payload.user,
		json:true
	}
	console.log(options);
	request(options,function(err,resp,body){
		if(err)
			//console.log(err);
			resolve(err)
		else	
			//console.log(body);
			resolve( body);
	});
	
	})
}
var welcome = function(req, responseObj){
console.log('inside welcome');
initialReq = req;
initalResp = responseObj;
	return new Promise(function(resolve,reject){
		verifyUserToken(req).
		then(function(data){
			if (data.auth){
				console.log('login success');
				simpleResponse(responseObj, "Hi I'm Hema !. I can help you to manage your leaves,search an employee, account recovery and create or track your service tickets. Please select an option to begin.")
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
					//responseObj.json(result)
				})			
	
			}
			else{
				simpleResponse(responseObj, "Hi I'm Hema !. I can help you to manage your leaves,search an employee, account recovery and create or track your service tickets. Please login to begin.")
				.then(function(result){
					var buttons = [
					  {
						"title": "Login",
						"openUrlAction": {
						  "url": "https://esbottest.herokuapp.com/login.html?convId="+req.originalDetectIntentRequest.payload.conversation.conversationId
						}
					  }
					]
					return basicCard(result,"Please login to Help you", buttons);
				})
				.then(function(result){
					resolve(result);		
					//responseObj.json(result);
				})
			}
		})
	});
}

var createIncident = function(req, responseObj){
	return new Promise(function(resolve,reject){
						var description = "";
						var urgency = "";
						var message = "";
		
						description = req.queryResult.parameters.Incident_Description;
						urgency = req.queryResult.parameters.Urgency_Level;
		
						incident.createIncident(description, urgency).then(function(resultObj){ //returns promise 
						message = "We are sorry for the inconvenience.We have logged your incident in our system with the incident iD '" + resultObj.number.replace("INC", "INC ") + "'";
							simpleResponse(responseObj, message)
								.then(function(result){
									var chips = [{"title": "Menu"}]
									return suggestions(result,chips);
								})
								.then(function(result){
									resolve(result);		
								})
						});
	});
}



var getIncidentById = function(req, responseObj){
	return new Promise(function(resolve,reject){
		
					var incident_number = "";
					incident_number = "INC"+req.queryResult.parameters.incident_number;
					var message = "";
					incident.getIncidentByIncidentId(incident_number).then(function(resultobj){  
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
							}
							else{
								 var displayText = "Below are the details for the requested Incident:- ";
								displayText = displayText +"Incident ID : " + resultobj[0].number.replace("INC", "INC ") + " Short Description : " + resultobj[0].short_description + " Status : " + stateDecode(resultobj[0].state);// + "<br><strong>Assigned To :</strong> " + req.app.locals.decodeAssignedTo(resultobj[0].assigned_to);
								var speech = "These are the details for the requested Incident "
								responseObj.payload.google.richResponse.items.push({
									"simpleResponse": {
										"textToSpeech": speech,
										"displayText": displayText
									}
								});
								var chips = [{"title": "Menu"}]
								suggestions(responseObj,chips)
								.then(function(result){
									resolve(result);		
								})
								
							}
						});
	});
}

var getLeaveBalance = function(req, responseObj){
	return new Promise(function(resolve,reject){
	verifyUserToken(req).
		then(function(data){
			if(data.auth){
				var options ={
					method: "GET",
					url: config.leaveBalanceAPI,
					json:true
				}
				console.log(options);
				request(options,function(err,resp,body){
					if(err)
						//console.log(err);
						reject(err);
					else	
						console.log(body);
					var leave_balance =[];
					var dataitrate = body.root.HX_LV_BAL_SUB;
					for(var i in dataitrate){
						console.log(i);
						leave_balance.push({
							"optionInfo": { 
								"key":dataitrate[i].LEAVEDESC,
								"synonyms": [dataitrate[i].LEAVEDESC]
								},
								"title": dataitrate[i].LEAVEDESC,
								"description": dataitrate[i].LEAVEBALANCE
								})
					}
					console.log('leave_balance:',leave_balance );
					message = "Here are the available leave balance for you";
					simpleResponse(responseObj, message)
						.then(function(result){
							return listItem(result, "Leave Balance",leave_balance);
						})
						.then(function(result){
							var chips = [{"title": "Menu"}]
							return suggestions(result,chips);
						})
						.then(function(result){
							resolve(result);		
						})
						//resolve(body);
				});
			}else{
				simpleResponse(responseObj, "Seems you are not logged in.Please login to continue.")
				.then(function(result){
					var buttons = [
					  {
						"title": "Login",
						"openUrlAction": {
						  "url": "https://esbottest.herokuapp.com/login.html?convId="+req.originalDetectIntentRequest.payload.conversation.conversationId
						}
					  }
					]
					return basicCard(result,"Please login to Help you", buttons);
				})
				.then(function(result){
					resolve(result);		
					//responseObj.json(result);
				})
			}
			
		});					
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

//For decoding state from number to text
function stateDecode (state) {
    console.log("Inside stateDecode function");
    console.log("Recieved state " + state);

    var decodedState = ""

    switch (state) {
        case "1" :
            decodedState = "New";
            break;
        case "2" :
            decodedState = "In Progress";
            break;
        case "3" : 
            decodedState = "On Hold";
            break;
        case "6" :
            decodedState = "Resolved";
            break;
        case "7" :
            decodedState = "Closed";
            break;
        case "8" :
            decodedState = "Canceled";
    }

    return decodedState
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





