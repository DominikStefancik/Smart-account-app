/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a sample skill built with Amazon Alexa Skills nodejs
 * skill development kit.
 * This sample supports multiple languages (en-US, en-GB, de-GB).
 * The Intent Schema, Custom Slot and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-howto
 **/

'use strict';

const Alexa = require('alexa-sdk');
const recipes = require('./recipes');
//for Java Spring or others
//const baseurl = "localhost:3000"
const baseurl = "http://5aadf98b7389ab0014b7b900.mockapi.io";

//needed for https requests or just use http
//var rootCas = require('ssl-root-cas').create();
//require('https').globalAgent.options.ca = rootCas;

const getContent = function(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};

function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
      var updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      this.emit(":delegate");
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).

const languageStrings = {
    'en': {
        translation: {
            RECIPES: recipes.RECIPE_EN_US,
            SKILL_NAME: 'Smart Account',
            WELCOME_MESSAGE: "Welcome to %s. Could you please identify yourself with your passcode?",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: '%s  - Recipe for %s.',
            HELP_MESSAGE: "You can ask questions such as, how much money do I have on my bank account, or, you can say exit...Now, what can I help you with?",
            HELP_REPROMPT: "You can say things like, how much money do I have on my bank account, or you can say exit...Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
            TASK_REPEAT_MESSAGE: 'Try saying repeat.',
            TASK_NOT_FOUND_MESSAGE: "I\'m sorry, I currently do not know ",
            TASK_NOT_FOUND_WITH_ITEM_NAME: 'the task for %s. ',
            TASK_NOT_FOUND_WITHOUT_ITEM_NAME: 'that task. ',
            TASK_NOT_FOUND_REPROMPT: 'What else can I help with?',
        },
    },
};
const handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'LoginRequest': function () {
        let passcode = this.event.request.intent.slots.passcode.value;
        console.log("login requested");
        let testcode = 3521;
        let url = baseurl + "/passcode" //wrong spelling in API
        getContent( url ).then((response) => {
            console.log("Success!", response); // Yea, REST all the things
            response = JSON.parse(response);
            testcode = response[0];
            console.log(testcode);
            if(passcode == testcode){
                this.attributes.speechOutput = "Thank you. Now, what can I help you with?";
                this.event.session.attributes['auth'] = true;
            }
            else{
                this.attributes.speechOutput = "The code does not match. Please try again.";
            }
            this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');
    
            this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
            this.emit(':responseReady');
            }, (error) => {
                console.error("Failure!", error); // Boo, bad feels 
                this.emit(':tell', 'Hmm.. that didn\'t work.  Check the CloudWatch Luke.');
        });
            
        /*if(passcode == testcode){
            this.attributes.speechOutput = "Thank you. Now, what can I help you with?";
            this.event.session.attributes['auth'] = true;
        }
        else{
            this.attributes.speechOutput = "The code does not match. Please try again.";
        }
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');*/
        
    },
    'BalanceIntent': function() {
        if(this.event.session.attributes['auth'] == undefined){
            let error = "You are not signed in";
            this.attributes.speechOutput = error;
            this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');

            this.response.speak(error).listen(this.attributes.repromptSpeech);
            this.emit(':responseReady');
        }
        else {
            //for testing
            let balance = ""; //You currently have 10241 Euros, 3820 Euros on your Deutsche Bank account";
            //balance += "and 6421 Euros on your DKB account. What can I do for you?";

            let url = baseurl + "/finances" //wrong spelling in API financies
            getContent( url ).then((response) => {
                console.log("Success!", response); // Yea, REST all the things
                response = JSON.parse(response);
                balance = response[0];
                console.log(response);
                this.attributes.speechOutput = balance;
                this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');
    
                this.response.speak(balance).listen(this.attributes.repromptSpeech);
                this.response.cardRenderer("Bank account", balance);
                this.emit(':responseReady');
                }, (error) => {
                    console.error("Failure!", error); // Boo, bad feels 
                    this.emit(':tell', 'Hmm.. that didn\'t work.  Check the CloudWatch Luke.');
            });
            
            /*this.attributes.speechOutput = balance;
            this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');

            this.response.speak(balance).listen(this.attributes.repromptSpeech);
            this.response.cardRenderer("Bank account", balance);
            this.emit(':responseReady');*/
        }
    },
    'TransferIntent': function() {
        if(this.event.session.attributes['auth'] == undefined){
            let error = "You are not signed in";
            this.attributes.speechOutput = error;
            this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');

            this.response.speak(error).listen(this.attributes.repromptSpeech);
            this.emit(':responseReady');
        }
        else {
            //delegate to Alexa to collect all the required slot values
            var filledSlots = delegateSlotCollection.call(this);
            
            let amount = this.event.request.intent.slots.amount.value;
            let account = this.event.request.intent.slots.account.value;
            let name = this.event.request.intent.slots.name.value;
            // for testing
            //let response = "I have transferred 50 Euros to Peter. You still have 10191 Euro on your current account.";
            //response += "Do you want me to transfer some of it to the MSCI World ETF again?";
            
            let url = baseurl + "/transferToSon"
            getContent( url ).then((response) => {
                console.log("Success!", response); // Yea, REST all the things
                response = JSON.parse(response);
                response = response[0];
                console.log(response);
                this.attributes.speechOutput = response;
                this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');
    
                this.response.speak(response).listen(this.attributes.repromptSpeech);
                this.response.cardRenderer("Transfer", response);
                this.emit(':responseReady');
                }, (error) => {
                    console.error("Failure!", error); // Boo, bad feels 
                    this.emit(':tell', 'Hmm.. that didn\'t work.  Check the CloudWatch Luke.');
            });
            
            /*this.attributes.speechOutput = response;
            this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');

            this.response.speak(response).listen(this.attributes.repromptSpeech);
            this.response.cardRenderer("Transfer", response);
            this.emit(':responseReady');*/
        }
    },
    'InvestIntent': function() {
        if(this.event.session.attributes['auth'] == undefined){
            let error = "You are not signed in";
            this.attributes.speechOutput = error;
            this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');

            this.response.speak(error).listen(this.attributes.repromptSpeech);
            this.emit(':responseReady');
        }
        else {
            //delegate to Alexa to collect all the required slot values
            var filledSlots = delegateSlotCollection.call(this);
        
            let amount = this.event.request.intent.slots.amount.value;
            let company = this.event.request.intent.slots.company.value;
            let fund = this.event.request.intent.slots.fund.value;
            // for testing
            let response = ""; //Roger that. Your new account balance is 8191 Euro.";
            
            let url = baseurl + "/transferToDKB";
            getContent( url ).then((response) => {
                console.log("Success!", response); // Yea, REST all the things
                response = JSON.parse(response);
                response = response[0];
                console.log(response);
                this.attributes.speechOutput = response;
                this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');
    
                this.response.speak(response).listen(this.attributes.repromptSpeech);
                this.response.cardRenderer("Bank account", response);
                this.emit(':responseReady');
                }, (error) => {
                    console.error("Failure!", error); // Boo, bad feels 
                    this.emit(':tell', 'Hmm.. that didn\'t work.  Check the CloudWatch Luke.');
            });
            
            
            /*this.attributes.speechOutput = response;
            this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');

            this.response.speak(response).listen(this.attributes.repromptSpeech);
            this.response.cardRenderer("Bank account", response);
            this.emit(':responseReady');*/
        }
    },
    'MoneyIntent': function() {
        let quote = "Random quote";
        const url = "https://talaikis.com/api/quotes/random/";
        console.log("http start");

        getContent( url ).then((response) => {
            console.log("Success!", response); // Yea, REST all the things
            response = JSON.parse(response);
            let quote = response.quote;
            let author = response.author;
            this.attributes.speechOutput = quote;
            this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');
            this.response.speak(quote).listen(this.attributes.repromptSpeech);
            this.response.cardRenderer(author, quote);
            this.emit(':responseReady');
        }, (error) => {
            console.error("Failure!", error); // Boo, bad feels 
            this.emit(':tell', 'Hmm.. that didn\'t work.  Check the CloudWatch Luke.');
        });
    },
    // for a change, money isn't everything in life 
    'RecipeIntent': function () {
        const itemSlot = this.event.request.intent.slots.Item;
        let itemName;
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        const cardTitle = this.t('DISPLAY_CARD_TITLE', this.t('SKILL_NAME'), itemName);
        const myRecipes = this.t('RECIPES');
        const recipe = myRecipes[itemName];

        if (recipe) {
            this.attributes.speechOutput = recipe;
            this.attributes.repromptSpeech = this.t('TASK_REPEAT_MESSAGE');

            this.response.speak(recipe).listen(this.attributes.repromptSpeech);
            this.response.cardRenderer(cardTitle, recipe);
            this.emit(':responseReady');
        } else {
            let speechOutput = this.t('TASK_NOT_FOUND_MESSAGE');
            const repromptSpeech = this.t('TASK_NOT_FOUND_REPROMPT');
            if (itemName) {
                speechOutput += this.t('TASK_NOT_FOUND_WITH_ITEM_NAME', itemName);
            } else {
                speechOutput += this.t('TASK_NOT_FOUND_WITHOUT_ITEM_NAME');
            }
            speechOutput += repromptSpeech;

            this.attributes.speechOutput = speechOutput;
            this.attributes.repromptSpeech = repromptSpeech;

            this.response.speak(speechOutput).listen(repromptSpeech);
            this.emit(':responseReady');
        }
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.event.request.reason = "";
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.event.request.reason = "";
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', 'See you soon'); //':tell' ends the session but looks ugly
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
