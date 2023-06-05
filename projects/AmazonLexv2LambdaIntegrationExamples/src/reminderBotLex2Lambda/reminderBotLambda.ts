// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { LexCodeHookInputEvent } from "../sharedLibraries/LexCodeHookInterfaces"
import { IntentNames } from "./intentHandlers/constants"
const DialogHelpers = require("../sharedLibraries/DialogHelpers")
const CommonUtils = require("../sharedLibraries/CommonUtils")
import * as emailIntentHandler from "./intentHandlers/emailIntentHandler"
import * as callIntentHandler from "./intentHandlers/callIntentHandler"

exports.handler = async (event: LexCodeHookInputEvent) => {
  console.debug("event", JSON.stringify(event, null, 2))

  CommonUtils.logEventDetails(event)

  let response = DialogHelpers.passThrough(event)
  const sessionStateIntentName = event.sessionState.intent?.name || ""

  if (sessionStateIntentName === IntentNames.CALL_INTENT) {
    console.debug("Handling call intent")
    response = callIntentHandler.handler(event)
  } else if (sessionStateIntentName === IntentNames.EMAIL_INTENT) {
    console.debug("Handling email intent")
    response = emailIntentHandler.handler(event)
  }

  console.debug("response", JSON.stringify(response, null, 2))
  return response
}
