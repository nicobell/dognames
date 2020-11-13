const Alexa = require('ask-sdk');
let skill;

exports.handler = async function (event, context) {
    //console.log('REQUEST ' + JSON.stringify(event));
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addErrorHandlers(ErrorHandler)
            .addRequestHandlers(
                // delete undefined built-in intent handlers
                CancelIntentHandler,
                HelpIntentHandler,
                StopIntentHandler,
                NavigateHomeIntentHandler,
                FallbackIntentHandler,
                LaunchRequestHandler,
                SessionEndedRequestHandler
                // add custom Intent handlers
            ).create();
    }

    const response = await skill.invoke(event, context);
    //console.log('RESPONSE :' + JSON.stringify(response));
    return response;
};
