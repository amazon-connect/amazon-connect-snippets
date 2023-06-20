// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DialogAction, Intent, Message, SessionState, Slot, SentimentResponse } from "@aws-sdk/client-lex-runtime-v2"
import { QueryResult } from "@aws-sdk/client-kendra"

export interface LexCodeHookResponse {
  /**
   * The current state of the conversation with the user.
   *
   * The actual contents of the structure depends on the type of dialog action.
   */
  sessionState: LambdaCodeHookSessionState

  /**
   * One or more messages that Amazon Lex V2 shows to the customer to perform the next turn of the conversation.
   * If you don't supply messages, Amazon Lex V2 uses the appropriate message defined when the bot was created
   *
   * Required if dialogAction.type is ElicitIntent.
   */
  messages?: Message[]

  /**
   * Request-specific attributes
   */
  requestAttributes?: Attributes
}

/**
 * Note that per the docs https://docs.aws.amazon.com/lexv2/latest/dg/lambda.html the input format may change
 *   without a corresponding change to the messageVersion
 *
 * If this happens this interface will need updated, it is designed as a guide to allow you more easily understand
 *   and create code that can use this event and not as official documentation.
 */
export interface LexCodeHookInputEvent {
  /**
   * The version of the message that identifies the format of the event data going into the Lambda function
   *   and the expected format of the response from a Lambda function.
   *  In the current implementation, only message version 1.0 is supported.
   *
   *  You configure this value when you define an intent, in the Console this defaulted to 1.0 and doesn't show onscreen.
   */
  messageVersion: "1.0" | string

  /**
   * Session identifier used for the conversation.
   */
  sessionId: string

  /**
   * The action that called the Lambda function.
   *
   * When the source is DialogCodeHook, the Lambda function was called after input from the user.
   *
   * When the source is FulfillmentCodeHook the Lambda function was called after all required slots have been
   *      filled and the intent is ready for fulfillment.
   */
  invocationSource: InvocationSource

  /**
   * A value that indicates the specific Dialog code hook that invoked the Lambda function
   *   within the initial response, slots, or confirmation response. These labels are set when creating the Intent and are optional.
   *
   * Maximum 100 characters. Valid characters: A-Z, a-z, 0-9, -, _
   */
  invocationLabel?: string

  /**
   * The mode of the user utterance (text, speech, DTMF)
   */
  inputMode: InputMode

  /**
   * The mode the bot will use for the response (text or speech)
   * If the value is text/plain;charset=utf-8, Amazon Lex V2 returns text in the response.
   * If the value begins with audio/, Amazon Lex V2 returns speech in the response.
   * Amazon Lex V2 uses Amazon Polly to generate the speech using the configuration that you specified in the responseContentType parameter.
   * The following are the accepted values: audio/mpeg, audio/ogg, audio/pcm (16 KHz), audio/* (defaults to mpeg), text/plain; charset=utf-8
   */
  responseContentType: string

  /**
   * The text that was used to process the input from the user.
   *
   * For text or DTMF input, this is the text that the user typed.
   * For speech input, this is the text that was recognized from the speech.
   */
  inputTranscript: string
  rawInputTranscript?: string

  /**
   * One or more transcriptions that Amazon Lex V2 considers possible matches to the user's audio utterance.
   *
   * Alternate transcriptions are only supported for 8 kHz audio input, and this object will not appear on other
   *  forms of audio, though will appear on text inputs and show a single transcription with a confidence of 1.
   *
   * See https://docs.aws.amazon.com/lexv2/latest/dg/using-transcript-confidence-scores.html
   */
  transcriptions?: Transcription[]

  /**
   * Information about the bot that processed the request
   */
  bot: Bot

  /**
   *  One or more intents that Amazon Lex V2 considers possible matches to the user's utterance ordered by confidence.
   *
   *  The Interpretation object differs from the API_runtime_Interpretation because of the format of the nluConfidence property.
   */
  interpretations: LambdaCodeHookInterpretation[]

  /**
   * The next state of the dialog between the user and the bot if the Lambda function sets the dialogAction of the sessionState to Delegate.
   *
   * If you override the dialog behavior in sessionState the next state depends on the settings that you return from your Lambda function and not
   *  the state proposed
   *
   * This structure is only present when the invocationSource field is DialogCodeHook and when the proposed dialog action is ElicitSlot,
   *  and can be used to add in Runtime Hints at the right point in the conversation.
   */
  proposedNextState?: ProposedNextState

  /**
   * Request-specific attributes that the client sends in the request.
   *
   * Request attributes should be used to pass information that doesn't need to persist for the entire session.
   */
  requestAttributes?: Attributes

  /**
   * The current state of the conversation between the user and your Amazon Lex V2 bot
   */
  sessionState: LambdaCodeHookSessionState
}

/**
 * Map of key/value pairs
 */
export type Attributes = Record<string, string>

/**
 * The Lambda function event Session state differs from the API_runtime_SessionState
 *  because of the format of the Intent
 */
export interface LambdaCodeHookSessionState extends SessionState {
  sessionAttributes: Attributes
  intent?: LambdaCodeHookSessionStateIntent
}

/**
 * The Lambda function event Intent state differs from the API_runtime_Intent
 *  because it can optionally include the kendraResponse when the intent is KendraSearchIntent
 */
export interface LambdaCodeHookSessionStateIntent extends Intent {
  kendraResponse?: QueryResult
}

export interface Transcription {
  transcription: string
  transcriptionConfidence: number
  resolvedContext: {
    intent: string
  }
  resolvedSlots: Record<string, Slot>
}

/**
 * The predicted next state of the dialog between the user and the bot if the Lambda function sets the dialogAction of the sessionState to Delegate.
 *
 * If you override the dialog behavior in sessionState, the next state depends on the settings that you return from your Lambda function.
 *
 * You can use the information to modify your Lambda function's behavior based on what Amazon Lex V2 proposes as the next action.
 */
export interface ProposedNextState {
  dialogAction: DialogAction
  intent: Intent

  /**
   * Indicates the number of times this slot has been prompted for in this session
   *
   * You can set the maximum number of consecutive retries when creating the Slot (up to 5).
   */
  prompt: {
    attempt?: PromptAttempt | string
  }
}

/**
 * The Interpretation object differs from the API_runtime_Interpretation only because of the format of the nluConfidence property.
 */
export interface LambdaCodeHookInterpretation {
  /**
   * A score that indicates the confidence that Amazon Lex V2 has that an intent is the one that satisfies the user's intent.
   *
   * This differs from the nluConfidence in the API_runtime_Interpretation because this just returns a number and not an API_runtime_ConfidenceScore object
   */
  nluConfidence?: number

  /**
   * Provides information about the sentiment expressed in a user's response in a conversation. Sentiments are determined using Amazon Comprehend.
   *
   * Sentiments are only returned if they are enabled for the bot.
   */
  sentimentResponse?: SentimentResponse

  /**
   * List of intents that might satisfy the user's utterance. The intents are ordered by the confidence score.
   */
  intent?: Intent
}

export interface Bot {
  /**
   * The identifier assigned to the bot when you created it.
   * You can see the bot ID in the Amazon Lex V2 console on the bot Settings page.
   */
  id: string

  /**
   * The name that you gave the bot when you created it.
   */
  name: string

  /**
   * The identifier assigned to the bot alias when you created it. You can see the bot alias ID in the Amazon Lex V2 console on the Aliases page.
   * If you can't see the alias ID in the list, choose the gear icon on the upper right and turn on Alias ID.
   */
  aliasId: string

  /**
   * The name you gave the bot alias when you created it.
   */
  aliasName: string

  /**
   * The identifier of the locale that you used for your bot. For a list of locales, see Languages and locales supported by Amazon Lex V2.*
   */
  localeId: string

  /**
   * The version of the bot that processed the request.
   */
  version: string
}

export const enum PromptAttempt {
  INITIAL = "Initial",
  RETRY_1 = "Retry1",
  RETRY_2 = "Retry2",
  RETRY_3 = "Retry3",
  RETRY_4 = "Retry4",
  RETRY_5 = "Retry5",
}

export const enum InvocationSource {
  DIALOG_CODE_HOOK = "DialogCodeHook",
  FULFILLMENT_CODE_HOOK = "FulfillmentCodeHook",
}

export const enum InputMode {
  DTMF = "DTMF",
  SPEECH = "Speech",
  TEXT = "Text",
}
