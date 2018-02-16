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
   
  // we have a simple authentication
 /* if (REQUIRE_AUTH) {
    if (req.headers['auth-token'] !== AUTH_TOKEN) {
      return res.status(401).send('Unauthorized')
    }
  }*/

  // and some validation too
/*if (!req.body || !req.body.result || !req.body.result.parameters) {
    return res.status(400).send('Bad Request')
  }*/

  // the value of Action from api.ai is stored in req.body.result.action
  //console.log('Authentication Successful...')
  if(!req.body.result){
    console.log("result is null")
  }else{
    console.log("result=>"+req.body.result)
  }
  if(!req.body.result.parameters)  {
    console.log("parameters is null")
  }else{
    console.log("parameters=>"+req.body.result.parameters)
  }
  
   if(!req.body.result.parameters)  {
    console.log("parameters is null")
  }else{
    console.log("parameters=>"+req.body.result.parameters)
  }
  if(!req.body.result.parameters.given-name)  {
    console.log("parameters.given-name is null")
  }else{
    console.log("given-name=>"+req.body.result.parameters.given-name)
  }
  // parameters are stored in req.body.result.parameters
  var userName = req.body.result && req.body.result.parameters && req.body.result.parameters.given-name ? req.body.result.parameters.given-name : 'Guest';
  
  var webhookReply = 'Hello ' + userName + '! Welcome from the webhook.'

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
