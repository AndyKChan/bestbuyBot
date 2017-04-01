var restify = require('restify');
var builder = require('botbuilder');
var request = require('superagent');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/603163cb-a45c-4308-a518-6d48d0b65618?subscription-key=ea2c31d50ef04c339bf5637ed3dcc758&timezoneOffset=0.0&verbose=true&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

bot.dialog('/', dialog);

dialog.onDefault([

    function () {
        builder.Prompts.text('Hi! What would you like to filter today?');
    }
]);


dialog.matches('Upload_Pic', [

	function (session) {
		builder.Prompts.attachment(session, "Upload a picture of food for me to analyze!");
	},
	
	function (session, results) {
		var moreInfo = false;
		var result = ''
		console.log(results.response[0].contentUrl);
		session.userData.foodPic = results.response;
		
		if(results.response[0].contentUrl.match(/localhost/i)){
			result = 'https://g.foolcdn.com/editorial/images/225916/getty-apple_large.jpg'
		} else {
			result = results.response[0].contentUrl;
		}
		
		request
		   .post('https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories,Tags&language=en')
		   .send({"url":result})
		   .set('Content-Type', 'application/json')
		   .set('Ocp-Apim-Subscription-Key', '450efdb5185b46eca7f09bf89646731c')
		   .end(
		   	function (err, res){
		
				if (err || !res.ok) {
					session.send('oops')
				} else {
					console.log(res)
					var food = res.body.tags.filter(function(t){return t.hint == 'food'});
					session.userData.food = food;
					session.beginDialog('/moreInfo');
					console.log(food);
					
					//food[0].name is the food
					if(food.length){
						getNutrition(food[0].name).then(facts => session.send(facts));
					} else { 
					session.send('no food was found!')
					}
					
					console.log('success');
				}

				session.endDialog();
			});
				
		}
]);