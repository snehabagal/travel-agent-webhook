const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5001))

const REQUIRE_AUTH = true
const AUTH_TOKEN = 'an-example-token'

app.get('/', function (req, res) {
  res.send('Use the /webhook endpoint.')
})
app.get('/webhook', function (req, res) {
  res.send('You must POST your request')
})

app.post('/webhook', function (req, res) {
  // we expect to receive JSON data from api.ai here.
  
  console.log("Request body is as below")
  // the payload is stored on req.body
  console.log(req.body)
  console.log("-----------------------------------------")
   
   //var apiAIReq = JSON.parse(req.body);
   
  // we have a simple authentication
 /* if (REQUIRE_AUTH) {
    if (req.headers['auth-token'] !== AUTH_TOKEN) {
      return res.status(401).send('Unauthorized')
    }
  }*/

  // and some validation too
/*if ((!req.body || !req.body.result || !req.body.result.parameters)||(!req.body || !req.body.request || !req.body.request.intent)) {
    return res.status(400).send('Bad Request')
  }*/
  

  // the value of Action from api.ai is stored in req.body.result.action
  console.log('Authentication Successful...');
  var isApiAI = req.body && req.body.result && req.body.result.parameters;
  
  console.log('isApiAI=>'+isApiAI);
  // parameters are stored in req.body.result.parameters
  var webhookReply = '';
  if(req.body && req.body.result && req.body.result.parameters)
  {
  var intentName = req.body.result.metadata && req.body.result.metadata['intentName'] ? req.body.result.metadata['intentName'] : 'DefaultIntent';
  console.log('intentName=>'+intentName);
  
  if(intentName=='0 - getTravelDetails'){
  var missingParams='';
  var toCity='';
  var fromCity='';
  var travelDate='';
  var travelTime='';
  if(req.body.result.parameters)  {
    if(req.body.result.parameters['Tocity'])  {
      toCity=req.body.result.parameters['Tocity'];
    }else{
      missingParams = 'Tocity ,';
    }
    if(req.body.result.parameters['Fromcity'])  {
      fromCity=req.body.result.parameters['Fromcity'];
    }else{
      missingParams = 'Fromcity ,';
    }
    if(req.body.result.parameters['date'])  {
      travelDate=req.body.result.parameters['date'];
    }else{
      missingParams = 'date ,';
    }
    if(req.body.result.parameters['time'])  {
      travelTime=req.body.result.parameters['time'];
    }else{
      missingParams = 'time ,';
    }
  }else{
    webhookReply ="Insufficient information, won't be able to proceed with booking!!"
  }
  
  if(missingParams=='')  {
    webhookReply ="Your booking is confirmed from "+fromCity+" to "+toCity+" on "+travelDate+" at "+travelTime+" . How would you like to pay by card or cash?";
  }else{
    webhookReply ="Insufficient information. Following inputs are missing "+missingParams;
  }
  }else if(intentName =='1 - paymentPrompted'){
    var paymentMode='';
    if(req.body.result.parameters['paymentMethods'])  {
      paymentMode=req.body.result.parameters['paymentMethods'];
      webhookReply ="Okay, I've received your payment through "+paymentMode+", enjoy your flight.";
    }else{
      webhookReply ="I didn't get the payment mode.";
    }
  }else {
    webhookReply ="Something went wrong not matching intent found.";
  }
  }else if(req.body&&req.body.request&&req.body.request.intent){
	  let options={};
	  options.endSession = true;
        var intentName=req.body.request.intent.name;
        console.log("intentName=>"+intentName);
        if(intentName=="TravelIntent"){
          if(req.body.request.intent.slots)
          {
              let travelDate="";
              let fromCity="";
              let toCity="";
              let missingSlots="";
              if(req.body.request.intent.slots.travelDate)
              {
                  travelDate=req.body.request.intent.slots.travelDate.value;
              }else{
                  missingSlots="travelDate,"
              }
              if(req.body.request.intent.slots.fromCity)
              {
                  fromCity=req.body.request.intent.slots.fromCity.value;
              }else{
                  missingSlots+="fromCity,"
              }
              if(req.body.request.intent.slots.toCity)
              {
                  toCity=req.body.request.intent.slots.toCity.value;
              }else{
                  missingSlots+="toCity,"
              }
              if(missingSlots==""){
                  webhookReply ="Your booking is confirmed from "+fromCity+" to "+toCity+" on "+travelDate+". How would you like to pay by card or cash?";
		      options.endSession = false;
              }else{
                  webhookReply="Insufficient information. Following information is missing:"+missingSlots;
              }
              console.log("travelDate=>"+travelDate);
              console.log("fromCity=>"+fromCity);
              console.log("toCity=>"+toCity);
          }else{
              webhookReply="Insufficient information. Required slots information is missing.";
          }
      }else if(intentName=="PaymentIntent"){
		if(req.body.request.intent.slots)
          {
              let paymentMode="";
			  let missingSlots="";
              if(req.body.request.intent.slots.paymentMode)
              {
                  paymentMode=req.body.request.intent.slots.paymentMode.value;
              }else{
                  missingSlots="paymentMode";
              }
              
              if(missingSlots==""){
                  webhookReply ="Okay, I've received your payment through "+paymentMode+", enjoy your flight.";
              }else{
                  webhookReply="Insufficient information. Following information is missing:"+missingSlots;
              }             
          }else{
              webhookReply="Insufficient information. Required slots information is missing.";
          }
	  }else{
		  webhookReply="Unknown intent.";
	  }
	  options.speechText = webhookReply;
	  return buildResponse(options,res);
    }else{
    return res.status(400).send('Bad Request');
  }

  // the most basic response
  res.status(200).json({
    source: 'webhook',
    speech: webhookReply,
    displayText: webhookReply
  })
})

app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})

function buildResponse(options,res) {
    console.log("In build res");
    res.json( {
      version: "1.0",
      response: {
        outputSpeech: {
          type: "SSML",
          ssml: "<speak>"+options.speechText+"</speak>"
        },
        shouldEndSession: options.endSession
      }
    });
  
    if(options.repromptText) {
        res.response.reprompt = {
        outputSpeech: {
          type: "SSML",
          ssml: "<speak>"+options.repromptText+"</speak>"
        }
      };
    }
  
    if(options.session && options.session.attributes) {
        res.sessionAttributes = options.session.attributes;
    }
    //console.log("Response:\n"+JSON.stringify(res,null,2));
    return res;
  }
