var restify = require('restify');
var builder = require('botbuilder');
var superagent = require('superagent');

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
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6179af9a-c7b6-4c18-bddc-0af0c9a59b9d?subscription-key=ea2c31d50ef04c339bf5637ed3dcc758&timezoneOffset=0.0&verbose=true&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

dialog.matches('product-search', (session, result) => {
    if (result.entities && result.entities[0]) {
        var product = result.entities[0].entity;
        superagent
            .get('https://msi.bbycastatic.ca/mobile-si/si/v3/products/search')
            .query({query: product})
            .end((err, res) => {
                var products = res.body.searchApi.documents.slice(0, 3);
                var msg = new builder.Message(session).text("Here are a few things you might like...");
                products.map(p => msg.addAttachment(createHeroCard(session, p)));
                session.send(msg);
                session.send("Would you like to learn more about a product? If so, please enter the web code printed in the picture.");
            });
    } else {
        session.send('no product');
    }
})
.matches('analyze-sku', (session, result) => {
	var product = result.entities[0].entity;
	var text = "";
	 superagent
            .get('https://msi.bbycastatic.ca/mobile-si/si/pdp/reviewDetails/' + product)
            .end((err, res) => {
            	if (err) {
            		return console.err(err);
            	}
             	res.body.si.response.results.forEach((result) => text += " " + result.reviewText);

			     superagent
			            .post('https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases')
			            .send({
						  "documents": [
						    {
						      "language": "en",
						      "id": "string",
						      "text": text.slice(0,1000)
						    }
						  ]
						})
			            .set('Ocp-Apim-Subscription-Key', '9dc65f3a3e3c4b17aaee324b81b88f9e')
			            .set('Content-Type', 'application/json')
			            .end((err, res) => {
			            	if (err) {
			            		return console.log(err);
			            	}
			            	session.send("Top User Review Keywords: " + res.body.documents[0].keyPhrases.slice(0,5).join(', '));
			            });
            });


           
})
.matches(/^upload/i, [
	function (session) {
		builder.Prompts.attachment(session, "Upload a picture of your product");
	},
	
	function (session, results) {
		session.send("Top User Review Keywords: Great computer, fantastic keyboard, lightweight");	
	}
])
.matches('hello', (session, result) => {
    session.send('hello!');
})
.onDefault((session) => {
    superagent
        .post('https://westus.api.cognitive.microsoft.com/qnamaker/v1.0/' + 
            '/knowledgebases/434f8163-42cf-4ff4-97f5-df2f8cc97fd1/generateAnswer')
        .send({"question": session.message.text})
        .set('Ocp-Apim-Subscription-Key', '22fa7c593b0740dbb81eac9bd0cfafb1')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
            if (err) {
                session.send('err' + res.text);
            } else {
                session.send(res.body.answer);
            }
        });
});

bot.dialog('/', dialog);


function createHeroCard(session, product) {
    var price = product.priceBlock.itemPrice.currentPrice;
    var title = product.summary.names.short;
    var image = product.summary.media.primaryImage.url;
    var description = product.summary.descriptions.short || product.summary.descriptions.long;
    var productUrl = "http://www.bestbuy.ca" + product.summary.url;
    var sku = product.skuId;
    return new builder.HeroCard(session)
        .title(title)
        .subtitle('$' + price)
        .subtitle('Web Code: ' + sku)
        //.text(description)
        .images([
            builder.CardImage.create(session, image)
        ])
        .buttons([
            builder.CardAction.openUrl(session, productUrl, 'View')
        ]);
};