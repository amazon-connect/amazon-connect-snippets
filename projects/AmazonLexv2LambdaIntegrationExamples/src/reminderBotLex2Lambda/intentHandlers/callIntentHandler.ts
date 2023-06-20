import { InvocationSource, LexCodeHookInputEvent } from "../../sharedLibraries/LexCodeHookInterfaces"
import { MessageContentType, Value } from "@aws-sdk/client-lex-runtime-v2"
import { IntentNames } from "./constants"

import moment from "moment"

const DialogHelpers = require("../../sharedLibraries/DialogHelpers")
const CommonUtils = require("../../sharedLibraries/CommonUtils")

const TIME_SLOT = "Time"

const TIME_PERIOD_VALUES = ["AM", "PM", "MO", "AF", "EV", "NI"]
const TIME_PERIOD_SESSION_ATTR = "timeperiod"

const INITIAL_CODE_HOOK_LABEL = "CallIntent_InitialCodeHook"
const TIME_SLOT_PROMPT_CODE_HOOK_LABEL = "CallIntent_TimeSlot_PromptCodeHook"
const TIME_SLOT_VALIDATION_CODE_HOOK_LABEL = "CallIntent_TimeSlot_ValidationCodeHook"

export function handler(event: LexCodeHookInputEvent) {
  let response = DialogHelpers.passThrough(event)
  const intent = event.sessionState.intent

  // @ts-ignore intent will never be undefined in the Intent Handler
  if (intent.name !== IntentNames.CALL_INTENT) {
    console.error(`Wrong handler for intent called, current intent is ${intent}`)
    // Decide how you would like to handle this with the least disruption to your user
    return response
  }

  /**
   * Determine the correct logic to run based on what code hook the request has come from
   */
  if (event.invocationSource === InvocationSource.DIALOG_CODE_HOOK) {
    if (event.invocationLabel === INITIAL_CODE_HOOK_LABEL) {
      // Check if we already captured an ambiguous Time Slot value at this point,
      // so we can adjust the prompt if needed
      response = checkForAmbiguousTimeSlotValue(event)
    } else if (event.invocationLabel === TIME_SLOT_PROMPT_CODE_HOOK_LABEL) {
      // Check the user input, so we can adjust the prompt for ambiguous or time period values
      response = checkUserInput(event)
    } else if (event.invocationLabel === TIME_SLOT_VALIDATION_CODE_HOOK_LABEL) {
      // final validation on slot
      response = validateTimeSlot(event)
    }
  } else if (event.invocationSource === InvocationSource.FULFILLMENT_CODE_HOOK) {
    // book the call
    response = fulfillIntent(event)
  }

  return response
}

/**
 * For Fulfillment, we will take action on book the call and then send a
 *  response with State of Fulfilled and a DialogAction of CLOSE
 */
const fulfillIntent = (event: LexCodeHookInputEvent) => {
  //clear the time period session attribute
  event.sessionState.sessionAttributes[TIME_PERIOD_SESSION_ATTR] = ""

  // ****************************
  // ADD LOGIC HERE TO ACTUALLY BOOK THE CALL ....
  //
  // IN THE REAL WORLD WE WOULD BE REACHING OUT TO EXTERNAL SYSTEMS HERE
  // FOR NOW WE'RE JUST GOING TO RESPOND AS IF WE DID BOOK THE CALL
  // *****************************

  const humanFriendlyTime = moment(CommonUtils.getSessionStateSlotValue(event, TIME_SLOT).interpretedValue, [
    "HH:mm",
  ]).format("h:mm A")

  return DialogHelpers.fulfillIntent(event.sessionState, event.requestAttributes || {}, [
    {
      contentType: MessageContentType.PLAIN_TEXT,
      content: `Your call has been scheduled for ${humanFriendlyTime}`,
    },
  ])
}

/**
 * After we collect the slot value we want to
 *  - check it has been filled with a time and not a time period (in which case we would return to ElicitSlot)
 *  - if it is a valid time we return control to Lex to move to the next step
 * @param event
 */
const validateTimeSlot = (event: LexCodeHookInputEvent) => {
  const timeSlotValue = CommonUtils.getSessionStateSlotValue(event, TIME_SLOT)

  // Validate that the interpretedValue isn't a time period
  // (if value was collected at ElicitIntent the CallIntent_TimeSlot_PromptCodeHook will have been skipped)
  if (isTimePeriod(timeSlotValue.interpretedValue)) {
    return askForSpecificTimeWithinTimePeriod(timeSlotValue.interpretedValue, event)
  } else {
    // ****************************
    // LOGIC COULD BE ADDED HERE TO CHECK THIS TIME IS AVAILABLE BY REACHING OUT TO OUR BOOKING SYSTEM
    // THIS WOULD ALLOW US TO RE-PROMPT THE USER FOR A NEW TIME IF NEEDED
    // ****************************

    //If we have a valid time, pass through to next step
    return DialogHelpers.passThrough(event)
  }
}
/**
 * On each elicitation within the Time Slot we will do the following:
 * - If the slot is filled (has interpretedValue) we will check it is a valid time value
 *      - If not we will ask the user to clarify
 *      - Else we will just delegate back to Lex
 * - If the slot is NOT filled we will check if there is more than one resolved value
 *     - If there is more than one, we will use those to ask the user to clarify with one
 *     - Else we will just delegate back to Lex
 */
const checkUserInput = (event: LexCodeHookInputEvent) => {
  const timeSlotValue = CommonUtils.getSessionStateSlotValue(event, TIME_SLOT)

  // check it isn't a time period rather than a specific time
  if (isTimePeriod(timeSlotValue.interpretedValue)) {
    // if it is, ask for clarification
    return askForSpecificTimeWithinTimePeriod(timeSlotValue.interpretedValue, event)
  }
  // otherwise check if there are potential values listed
  else {
    return checkForAmbiguousTimeSlotValue(event)
  }
}

const isAmbiguousSlotValue = (slot: Value) => {
  return slot && slot.resolvedValues && slot.resolvedValues.length > 1
}

const checkForAmbiguousTimeSlotValue = (event: LexCodeHookInputEvent) => {
  const timeSlotValue = CommonUtils.getSessionStateSlotValue(event, TIME_SLOT)
  if (isAmbiguousSlotValue(timeSlotValue)) {
    return disambiguateValues(event, timeSlotValue.resolvedValues)
  } else {
    return DialogHelpers.passThrough(event)
  }
}

const isTimePeriod = (interpretedValue: string) => {
  return interpretedValue && interpretedValue !== "" && TIME_PERIOD_VALUES.includes(interpretedValue)
}

const disambiguateValues = (event: LexCodeHookInputEvent, resolvedValues: string[]) => {
  let disambiguatedValue = resolveTimeFromTimePeriod(event, resolvedValues)
  if (disambiguatedValue !== "") {
    // If we resolved a value, set the slot to the matched value before we pass back to Lex to handle the next step
    // @ts-ignore - to have reached this point this will have to exist so not adding null checks
    event.sessionState.intent.slots[TIME_SLOT].value.interpretedValue = disambiguatedValue
    return DialogHelpers.passThrough(event)
  } else {
    // If we haven't resolved a value, ask the user for clarification
    return askForTimeClarification(resolvedValues, event)
  }
}

const resolveTimeFromTimePeriod = (event: LexCodeHookInputEvent, resolvedValues: string[]) => {
  let disambiguatedTime = ""

  // check if the user already indicated a time period, if they haven't, we can return an empty string
  const timePeriod = event.sessionState.sessionAttributes[TIME_PERIOD_SESSION_ATTR]
  if (timePeriod && timePeriod != "") {
    // Try to match a resolved time with the time period the user has given
    resolvedValues.forEach((resolvedValue) => {
      if (["MO", "AM"].includes(timePeriod) && resolvedValue >= "00:00" && resolvedValue <= "12:00") {
        disambiguatedTime = resolvedValue
      } else if (["AF", "PM"].includes(timePeriod) && resolvedValue >= "12:00" && resolvedValue <= "18:00") {
        disambiguatedTime = resolvedValue
      } else if (["EV", "NI", "PM"].includes(timePeriod) && resolvedValue >= "18:00" && resolvedValue <= "23:59") {
        disambiguatedTime = resolvedValue
      }
    })
  }
  return disambiguatedTime
}

const askForTimeClarification = (resolvedValues: string[], event: LexCodeHookInputEvent) => {
  // map in a human friendly version of the times
  resolvedValues = resolvedValues.map((value) => moment(value, ["HH:mm"]).format("h:mm A"))

  // concatenate the resolved values with 'or' between them
  const resolvedValuesString = resolvedValues.join(" or ")

  // set the next step to a re-prompt for the slot
  return DialogHelpers.promptForSlot(
    event.sessionState,
    event.requestAttributes || {},
    TIME_SLOT,
    event.sessionState.intent,
    [
      {
        contentType: MessageContentType.PLAIN_TEXT,
        content: `Would you like ${resolvedValuesString}?`,
      },
    ]
  )
}

const askForSpecificTimeWithinTimePeriod = (value: string, event: LexCodeHookInputEvent) => {
  // map of values to human-friendly ones
  const timePeriodMapping: { [index: string]: string } = {
    AM: "morning",
    PM: "evening",
    MO: "morning",
    AF: "afternoon",
    EV: "evening",
    NI: "evening",
  }

  // add value to session, so we can use it for future disambiguation if needed
  event.sessionState.sessionAttributes[TIME_PERIOD_SESSION_ATTR] = CommonUtils.getSessionStateSlotValue(
    event,
    TIME_SLOT
  ).interpretedValue

  // add human-friendly value into message, or default to day if the value can't be mapped
  const message = {
    contentType: MessageContentType.PLAIN_TEXT,
    content: `What time in the ${timePeriodMapping[value] || "day"} would you like?`,
  }

  // set the next step to a re-prompt for the slot
  return DialogHelpers.promptForSlot(
    event.sessionState,
    event.requestAttributes || {},
    TIME_SLOT,
    event.sessionState.intent,
    [message]
  )
}
