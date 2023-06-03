// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { InvocationSource, LexCodeHookInputEvent } from "./LexCodeHookInterfaces"
import { Value } from "@aws-sdk/client-lex-runtime-v2"

const logEventDetails = (event: LexCodeHookInputEvent) => {
  console.log(
    `Lambda invoked with type ${event.invocationSource} and label ${event.invocationLabel} for ${event.bot.name} version ${event.bot.version} and locale ${event.bot.localeId}`
  )
  console.log(`Calling system sent ${event.inputMode} and expects ${event.responseContentType} to be returned`)

  if (event.requestAttributes) {
    console.log("Request Attributes are:")
    for (const key in event.requestAttributes) {
      console.log(`- ${key} passed with value ${event.requestAttributes[key]}`)
    }
  } else {
    console.log("No Request Attributes passed")
  }

  console.log(`User said "${event.inputTranscript}"`)
  if (event.transcriptions) {
    console.log("Possible alternate transcriptions are:")
    for (const transcription of event.transcriptions || []) {
      console.log(`- "${transcription.transcription}" with confidence ${transcription.transcriptionConfidence}`)
    }
  } else {
    console.log("No other alternate transcriptions are listed")
  }

  const currentIntent = event.sessionState.intent
  console.log(`Current Intent is ${currentIntent?.name} with a state of ${currentIntent?.state}`)

  console.log("Possible interpretations are:")
  for (const interpretation of event.interpretations) {
    console.log(`- ${interpretation.intent?.name} with NLU confidence ${interpretation.nluConfidence}`)
  }

  if (event.invocationSource === InvocationSource.DIALOG_CODE_HOOK) {
    const { proposedNextState } = event
    console.log(`Proposed next action is ${proposedNextState?.dialogAction.type}`)
  }
}

const getSessionStateSlotValue = (event: LexCodeHookInputEvent, slotName: string): Value => {
  const emptySlotValue: Value = {
    originalValue: "",
    resolvedValues: [],
    interpretedValue: "",
  }
  let slotValue = emptySlotValue
  if (event.sessionState.intent?.slots && event.sessionState.intent.slots?.[slotName]) {
    slotValue = event.sessionState.intent.slots?.[slotName].value || emptySlotValue
  }
  return slotValue
}

module.exports = {
  logEventDetails,
  getSessionStateSlotValue,
}
