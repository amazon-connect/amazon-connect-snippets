// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { LexCodeHookInputEvent, LexCodeHookResponse } from "../sharedLibraries/LexCodeHookInterfaces"
const DialogHelpers = require("../sharedLibraries/DialogHelpers")
const CommonUtils = require("../sharedLibraries/CommonUtils")

exports.handler = async (event: LexCodeHookInputEvent) => {
  console.debug("event", JSON.stringify(event, null, 2))

  CommonUtils.logEventDetails(event)

  const response: LexCodeHookResponse = DialogHelpers.passThrough(event)

  console.debug("response", JSON.stringify(response, null, 2))
  return response
}
