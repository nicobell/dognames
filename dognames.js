const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const Alexa = require('ask-sdk');
let skill;

exports.handler = async function (event, context) {
    //console.log('REQUEST ' + JSON.stringify(event));
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addRequestHandlers(
                CancelAndStopIntentHandler,
                HelpIntentHandler,
                LaunchRequestHandler,
                ShowDogPictureIntentHandler,
                ShowAllPicturesIntentHandler
            )
            .addErrorHandlers(ErrorHandler)
            .create();
    }

    const response = await skill.invoke(event, context);
    //console.log('RESPONSE :' + JSON.stringify(response));
    return response;
};

const ShowDogPictureIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ShowDogPictureIntent';
    },
    async handle(handlerInput) {
        let dognumber = handlerInput.requestEnvelope.request.intent.slots.number.value;
        let speechText = '';

        try {
            let data = await ddb.update({
                TableName: "DogPictures",
                Key: {
                    "pictureid": 0,
                },
                ExpressionAttributeValues: {
                    ":newimagenumber": dognumber
                },
                UpdateExpression: "set picturetoshow = :newimagenumber"
            }).promise();

            speechText = "Ok! Showing image number " + dognumber;

        } catch (err) {
            speechText = "Ops! I found an error while searching for image " + dognumber;
        };

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const ShowAllPicturesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ShowAllPicturesIntent';
    },
    async handle(handlerInput) {
        let speechText = '';

        try {
            let data = await ddb.update({
                TableName: "DogPictures",
                Key: {
                    "pictureid": 0,
                },
                ExpressionAttributeValues: {
                    ":newimagenumber": 0
                },
                UpdateExpression: "set picturetoshow = :newimagenumber"
            }).promise();

            speechText = "As you say, here there are all images!";

        } catch (err) {
            speechText = "Ops! I found an error loading all the images!";
        };

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to Images controller app!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can ask me to show an image, for example try to say: "Show me image number 1"';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle(handlerInput) {
        return true;
    },
    handle(handlerInput, error) {
        console.log('Error handled: ' + JSON.stringify(error.message));

        const speechText = 'Ouch! There was an error with message: ' + JSON.stringify(error.message);
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};
