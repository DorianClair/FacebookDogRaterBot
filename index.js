//start

//npm packages

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const token = process.env.FB_VERIFY_TOKEN
const access = process.env.FB_ACCESS_TOKEN

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())

app.get('/', function(req,res) {
  res.send("!!Ashley You Are Extremely Beautiful!!!!!")
})

app.get('/webhook/', function(req, res) {
  if(req.query['hub.verify_token'] ===
      token) {
      res.send(req.query['hub.challenge'])
    }
    res.send('no entry')
})
app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
   var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'hi':
        sendGenericMessage(senderID, " ");
        break;

      default:
        sendGenericMessage(senderID, "Only pictures please");
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, " ");
  }
}

function sendGenericMessage(recipientId, messageText) {
  // To be expanded in later sections
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  callSendAPI(messageData);
}
function log(data){
   console.log(data);
   return data;
}
function sendTextMessage(recipientId, messageText) {

  var randomNum = randomInt(0,10);
  var stringToSend = '';
  if(randomNum >= 7); {
    stringToSend = 'Hey thats not that bad!';
  }
  if(randomNum < 7) {
   stringToSend = '.. Not that bad... atleast you got higher than ' + (randomNum-1);
  }
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'You asked: ' + messageText + '. \n youre dog is about a: ' + randomNum + '\n' + stringToSend
    }
  };

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
callSendAPI(messageData);

}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: access },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}


app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'))
})
