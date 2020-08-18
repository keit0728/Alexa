// グローバル変数宣言 --------------------------------------------------------------------------------------------------
const Alexa = require('ask-sdk-core');  // SDKライブラリを読み込む
const AWS = require('aws-sdk');         // 永続アトリビュート用
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');   // 永続アトリビュート用
const S3_PERSISTENCE_BUCKET = '58db6cab-1edb-432c-bb1f-6cb0bf8eb298-us-east-1';
const REPROMPT = '何を登録しますか？';  // ユーザーからの応答がない場合にAlexaが呼びかける文章
const SKILL_NAME = 'G h A x To do';


// 開始処理を行う ------------------------------------------------------------------------------------------------------
const LaunchRequestHandler = {
    // 自分が処理すべきリクエストなのかをチェックする
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    // 処理する内容
    handle(handlerInput) {
        const speakOutput = `${SKILL_NAME}へようこそ。何を To do リストに登録しますか？`;
        return handlerInput.responseBuilder
            .speak(speakOutput)     // Alexaが話す
            .reprompt(REPROMPT)     // ユーザーからのレスポンスを待つ(Alexaが話しかけてから8秒間ユーザー応答が得られない->REPROMPTをAlexaが喋る->再度8秒経過で終了)
            .getResponse();         // ユーザーからのレスポンスをjson化
    }
};

// Todoリストに登録する処理を行う --------------------------------------------------------------------------------------
const InsertIntentHandler = {
    // 自分が処理すべきリクエストなのかをチェックする
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InsertIntent';
    },
    // 処理する内容
    async handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;   // 永続アトリビュート用
        
        let todo = handlerInput.requestEnvelope.request.intent.slots.todo.value;    // 追加するTodoの名称取得
        
        // 永続アトリビュート用(S3 データベースに保存)
        let lastTodo = {"todo":todo};
        attributesManager.setPersistentAttributes(lastTodo);
        await attributesManager.savePersistentAttributes();
        
        const speakOutput = `${todo}を登録しました。`;
        return handlerInput.responseBuilder
            .speak(speakOutput) // Alexaが話す
            .getResponse();     // ユーザーからのレスポンスをjson化
    }
};

// ヘルプ処理を行う(使い方を教えた後、どうしますか？と聞くこととAmazonのルールで決まっている) --------------------------
const HelpIntentHandler = {
    // 自分が処理すべきリクエストなのかをチェックする
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    // 処理する内容
    handle(handlerInput) {
        const speakOutput = '「りんごを買う を登録して」のように話しかければ To do リストに登録することができます。何を登録しますか？';

        return handlerInput.responseBuilder
            .speak(speakOutput)     // Alexaが話す
            .reprompt(REPROMPT)     // ユーザーからのレスポンスを待つ(Alexaが話しかけてから8秒間ユーザー応答が得られない->REPROMPTをAlexaが喋る->再度8秒経過で終了)
            .getResponse();         // ユーザーからのレスポンスをjson化
    }
};

// キャンセル処理を行う ------------------------------------------------------------------------------------------------
const CancelAndStopIntentHandler = {
    // 自分が処理すべきリクエストなのかをチェックする
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    // 処理する内容
    handle(handlerInput) {
        const speakOutput = 'さようなら';
        return handlerInput.responseBuilder
            .speak(speakOutput) // Alexaが話す
            .getResponse();     // ユーザーからのレスポンスをjson化
    }
};

// 終了処理を行う ------------------------------------------------------------------------------------------------------
const SessionEndedRequestHandler = {
    // 自分が処理すべきリクエストなのかをチェックする
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

// 何の処理が呼ばれているのかをAlexaが教えてくれる(デバック用) ---------------------------------------------------------
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    // 処理する内容
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `${intentName}というインテントが呼ばれました。`;

        return handlerInput.responseBuilder
            .speak(speakOutput) // Alexaが話す
            .getResponse();     // ユーザーからのレスポンスをjson化
    }
};

// エラー処理 ----------------------------------------------------------------------------------------------------------
const ErrorHandler = {
    // 自分が処理すべきリクエストなのかをチェックする
    canHandle() {
        return true;
    },
    // 処理する内容
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `すみません、なんだかうまくいかないようです。もう一度お試し下さい。`;

        return handlerInput.responseBuilder
            .speak(speakOutput)     // Alexaが話す
            .reprompt(speakOutput)  // ユーザーからのレスポンスを待つ(Alexaが話しかけてから8秒間ユーザー応答が得られない->REPROMPTをAlexaが喋る->再度8秒経過で終了)
            .getResponse();         // ユーザーからのレスポンスをjson化
    }
};

// スキルビルダーオブジェクトを生成する(おまじない) --------------------------------------------------------------------
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(    // Alexaに話しかけたとき、ここに書かれているHandlerを上から順に処理していく
        LaunchRequestHandler,
        InsertIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler,
    )
    .addErrorHandlers(  // エラーのとき
        ErrorHandler,
    )
    .withPersistenceAdapter(    // 永続アトリビュート用
        new persistenceAdapter.S3PersistenceAdapter({
            bucketName: S3_PERSISTENCE_BUCKET
        })
    )
    .lambda();
