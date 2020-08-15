// SDKライブラリを読み込む
const Alexa = require('ask-sdk-core');

// 開始処理を行う
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'G h A x To do へようこそ。何を To do リストに追加しますか？';
        const reprompt = '何を追加しますか？';
        return handlerInput.responseBuilder
            .speak(speakOutput)     // Alexaが話す
            .reprompt(reprompt)     // 8秒待っても応答がない場合は再度話しかける(さらに8秒経つと終了)
            .getResponse();         // Alexaがユーザーからのレスポンスを待つ
    }
};

// Todoリストに登録する処理を行う
const InsertIntentHandler = {
    // 自分が処理すべきリクエストなのかをチェックする
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InsertIntent';
    },
    // 処理する内容
    handle(handlerInput) {
        
        let todo = handlerInput.requestEnvelope.request.intent.slots.todo.value;    // 追加するTodoの名称取得
        
        const speakOutput = todo + 'を追加しました。';
        return handlerInput.responseBuilder
            .speak(speakOutput) // Alexaが話す
            .getResponse();     // Alexaがユーザーからのレスポンスを待つ
    }
};

// ヘルプ処理を行う(使い方を教えた後、どうしますか？と聞くこととAmazonのルールで決まっている)
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = '「りんごを買う を追加して」のように話しかければ To do リストに追加することができます。何を追加しますか？';
        const reprompt = '何を追加しますか？';

        return handlerInput.responseBuilder
            .speak(speakOutput)     // Alexaが話す
            .reprompt(reprompt)     // 8秒待っても応答がない場合は再度話しかける(さらに8秒経つと終了)
            .getResponse();         // Alexaがユーザーからのレスポンスを待つ
    }
};

// キャンセル処理を行う
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'さようなら';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

// 終了処理を行う
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// 何の処理が呼ばれているのかをAlexaが教えてくれる(デバック用)
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `${intentName}というインテントが呼ばれました。`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

// エラー処理
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `すみません、なんだかうまくいかないようです。もう一度お試し下さい。`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// スキルビルダーオブジェクトを生成する(おまじない)
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(    // Alexaに話しかけたとき、ここに書かれているHandlerを上から順に処理していく
        LaunchRequestHandler,
        InsertIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(  // エラーのとき
        ErrorHandler,
    )
    .lambda();
