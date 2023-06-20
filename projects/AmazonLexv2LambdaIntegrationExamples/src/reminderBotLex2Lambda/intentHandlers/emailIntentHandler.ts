import { LexCodeHookInputEvent, InvocationSource } from "../../sharedLibraries/LexCodeHookInterfaces"
import { IntentNames } from "./constants"
const DialogHelpers = require("../../sharedLibraries/DialogHelpers")

const DAYS_BEFORE_SLOT = "DaysBefore"

const INITIAL_CODE_HOOK_LABEL = "EmailIntent_InitialCodeHook"
const DAYS_BEFORE_SLOT_PROMPT_CODE_HOOK_LABEL = "EmailIntent_DaysBeforeSlot_PromptCodeHook"
const DAYS_BEFORE_VALIDATION_CODE_HOOK_LABEL = "EmailIntent_DaysBeforeSlot_ValidationCodeHook"

export function handler(event: LexCodeHookInputEvent) {
  let response = DialogHelpers.passThrough(event)
  const intent = event.sessionState.intent

  // @ts-ignore intent will never be undefined in the Intent Handler
  if (intent.name !== IntentNames.EMAIL_INTENT) {
    console.error(`Wrong handler for intent called, current intent is ${intent}`)
    // Decide how you would like to handle this with the least disruption to your user
    return response
  }

  if (event.invocationSource === InvocationSource.DIALOG_CODE_HOOK) {
    if (event.invocationLabel == INITIAL_CODE_HOOK_LABEL) {
      response = DialogHelpers.passThrough(event)
    } else if (event.invocationLabel == DAYS_BEFORE_SLOT_PROMPT_CODE_HOOK_LABEL) {
      response = DialogHelpers.passThrough(event)
    } else if (event.invocationLabel == DAYS_BEFORE_VALIDATION_CODE_HOOK_LABEL) {
      response = DialogHelpers.passThrough(event)
    } else {
      response = DialogHelpers.passThrough(event)
    }
  } else if (event.invocationSource === InvocationSource.FULFILLMENT_CODE_HOOK) {
    response = DialogHelpers.passThrough(event)
  }

  return response
}
