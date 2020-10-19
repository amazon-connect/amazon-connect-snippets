/** ****************************************************************************
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not
 *  use this file except in compliance with the License. A copy of the License
 *  is located at
 *
 *      http://www.apache.org/licenses/
 *  or in the 'license' file accompanying this file. This file is distributed on
 *  an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 *  implied. See the License for the specific language governing permissions and
 *  limitations under the License.
***************************************************************************** */

const Messages = [
    {
        message: 'unsupported_browser',
        cause: "Agent is using an unsupported browser. Only the latest 3 versions of Chrome or Firefox is supported. Upgrade the agent's browser to resolve this error. See <a href=\"https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html#browsers\">Supported browsers</a> for more information.",
    },
    {
        message: 'microphone_not_shared',
        cause: 'The microphone does not have permission for the site on which the CCP is running. For Google Chrome steps, see <a href="https://support.google.com/chrome/answer/2693767?hl=en">Use your camera and microphone in Chrome</a>. For Mozilla Firefox steps, see <a hrf="https://support.mozilla.org/en-US/kb/firefox-page-info-window">Firefox Page Info window</a>.',
    },
    {
        message: 'signalling_handshake_failure',
        cause: 'Error connecting the CCP to the Signaling Endpoint (TCP on port 443). This could happen due to a network issue or the required port not being open. Also see <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">Set Up Your Network</a> for further reference.',
    },
    {
        message: 'signalling_connection_failure',
        cause: 'Error connectiong the CCP to the Signaling Endpoint (TCP on port 443). This could happen due to a network issue or the required port not being open. Also see <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">Set Up Your Network</a> for further reference.',
    },
    {
        message: 'ice_collection_timeout',
        cause: 'Error connecting to the Media Endpoint (UDP on port 3478). This could happen due to a network issue or the required port not being open. Also see <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">Set Up Your Network</a> for further reference.',
    },
    {
        message: 'user_busy_error',
        cause: 'Agent has the CCP running in 2 distinct browsers at the same time, such as Chrome and Firefox. Use only one browser at a time to log in to the CCP.',
    },
    {
        message: 'webrtc_error',
        cause: 'An issue occurred due to either using an unsupported browser, or a required port/protocol is not open, such as not allowing UDP on port 3478. To resolve, confirm that the agent is using a supported browser, and that all traffic is allowed for all required ports and protocols. See <a href="https://docs.aws.amazon.com/connect/latest/adminguide/troubleshooting.html#ccp-networking">CCP Networking</a> and <a href="https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-contact-control-panel.html#phone-settings">Phone Settings</a> for more information.',
    },
    {
        message: 'realtime_communication_error',
        cause: 'An internal communication error occurred.',
    },
    {
        message: 'Failed connecting to signaling server',
        cause: 'Error connecting the CCP to the Signaling Endpoint (TCP on port 443). This could happen due to a network issue or the required port not being open. Also see <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">Set Up Your Network</a> for further reference.',
    },
    {
        message: 'ICE collection timed out',
        cause: 'Error connecting to the Media Endpoint (UDP on port 3478). This could happen due to a network issue or the required port not being open. Also see <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">Set Up Your Network</a> for further reference.',
    },
    {
        message: 'Lost ICE connection',
        cause: 'CCP lost ICE connection which means it could not communicate with the Media Endpoint (UDP on port 3478). This could happen due to a network issue.',
    },
    {
        message: 'Heartbeat response not received',
        cause: 'Heartbeat response was not received which means CCP could not connect to API Endpoint ( https://[your-instance].amazonaws.com/connect/api ). Check if you can see heart beats every 30 seconds.',
    },
    {
        message: 'NetworkError when attempting to fetch resource',
        cause: 'This can happen when CCP cannot connect to API Endpoint ( https://[your-instance].amazonaws.com.connect/api ). This could happen due to a network issue or the required port not being open. Also see <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">Set Up Your Network</a> for further reference.',
    },
    {
        message: 'API request failed',
        cause: 'API request failed. This could happen due to a network issue or the required port not being open. Also see <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">Set Up Your Network</a> for further reference.',
    },
    {
        message: 'Get new auth token failed',
        cause: 'For some reason, an attempt to get a new auth token failed. This could happen due to temporal network issue.',
    },
    {
        message: 'acceptContact',
        cause: 'Agent clicked the accept button.',
    },
    {
        message: 'rejectContact',
        cause: 'Agent clicked the reject button.',
    },
    {
        message: 'Failed to fetch agent configuration data',
        cause: 'This means getAgentConfiguration operation failed. This could happen due to a network issue or the required port not being open. Also see <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">Set Up Your Network</a> for further reference.',
    },
    {
        message: 'Failed to get agent data',
        cause: 'This means getAgentSnapshot operation failed. This could happen due to a network issue or the required port not being open. Also see <a href="https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html">Set Up Your Network</a> for further reference.',
    },
    {
        message: 'createOutboundContact',
        cause: 'createOutboundContact means the agent is making an outbound call.',
    },
    {
        message: 'destroyConnection',
        cause: 'Agent clicked the End call button.',
    },
    {
        message: 'clearContact',
        cause: 'Agent clicked the Clear Contact button.',
    },
    {
        message: 'agent::acw',
        cause: 'Agent moved to After Contact Work (ACW) state after last contact.',
    },
    {
        message: 'contact::destroyed',
        cause: "Agent moved out from After Contact Work (ACW) state after last contact. To check their latest status, check the following getAgentSnapshot API call's result.",
    },
    {
        message: 'contact::ended',
        cause: 'The contact ended. Agent should now be moved to After Contact Work (ACW) state, if this call was connected to the agent; or in error/missed state, if this call is not yet connected to the agent.',
    },
    {
        message: 'contact::missed',
        cause: 'CCP now shows Missed status for the agent. ',
    },
];

export default Messages;
