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

/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

/* eslint-disable no-underscore-dangle */
// Add your pattern with the following definition:
// {
//     pattern: a pattern javascript likes,
//     case: "give it a distinct name to pass to next stage",
//     group: which match group you want to specify, use 0 to return the whole thing
// },
// at the moment it returns the first match only so the sequence of the array patterns is critical.

const patterns = [
    {
        pattern: /SESSION\sonicecandidate\s(.+)/,
        case: 'CALLING_OPERATION',
        group: 1,
        messages: '🔽SESSION onicecandidate:',
    },
    {
        pattern: /SIGNALING\s(Received|Sending)\sSDP\s(.+)/s, // < s , single line, matches new line with a dot.
        case: 'PARSE_SDP',
        group: 0,
        messages: '🔽SDP signalling:',
    },
    {
        pattern: /Successfully\sfetched\swebSocket\sconnection\sconfiguration(.+)/,
        case: 'WSS_CONFIG',
        group: 1,
        messages: '🔽Successfully fetched webSocket connection configuration:',
    },
    {
        pattern: /Subscription\sMessage\sreceived\sfrom\swebSocket\sserver(.+)/,
        case: 'WSS_CONFIG',
        group: 1,
        messages: '🔽Subscription Message received from webSocket server:',
    },
    {
        pattern: /Contact detected:\scontactId\s([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\sagent\sconnectionId\s([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gs,
        case: 'CONTACT_DETECTED',
        group: 0,
        messages: '🔽Contact detected: ',
    },
    {
        pattern: /Softphone call detected:\scontactId\s([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\sagent\sconnectionId\s([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gs,
        case: 'CONTACT_DETECTED',
        group: 0,
        messages: '🔽Softphone call detected: ',
    },
    {
        pattern: /AWSClient:\s-->\sCalling\soperation\s'(\w+)'/,
        case: 'API_CALL',
        group: 1,
        messages: '💬AWSClient: --> ',
    },
    {
        // eslint-disable-next-line no-useless-escape
        pattern: /AWSClient:\s<--\sOperation\s'(\w+)'\s(succeeded|failed)[:\. ]{1,3}(\{.+\}){0,2}/,
        case: 'API_REPLY',
        group: 1,
        messages: 'AWSClient: <-- ',
    },
    {
        pattern: /Sending heartbeat/,
        case: 'HEART_BEAT_SEND',
        group: 0,
        messages: '',
    },
    {
        pattern: /Heartbeat response received/,
        case: 'HEART_BEAT_REPLY',
        group: 0,
        messages: '',
    },
    {
        pattern: /sendSoftphoneMetrics success(.+)/,
        case: 'SOFTPHONE_METRICS',
        group: 1,
        messages: '🔽Expand to see webrtc metrics (Very Long)',
    },
    {
        pattern: /sendSoftphoneReport success(.+)/,
        case: 'SOFTPHONE_REPORT',
        group: 1,
        messages: '🔽Expand to see end of call webrtc metrics report (Very Long)',
    },
];

let index = {
    contacts: [],
    latency: new Map(),
};

export const softphoneMetrics = {
    audio_input: [],
    audio_output: [],
    hasValues: false,
};

function pushMetrics(objects) {
    objects.map((event) => softphoneMetrics[event.softphoneStreamType].push({
        timestamp: event.timestamp,
        packetsLost: event.packetsLost,
        packetsCount: event.packetsCount,
        audioLevel: event.audioLevel,
        jitterBufferMillis: event.jitterBufferMillis,
        roundTripTimeMillis: event.roundTripTimeMillis,
        _ts: new Date(event.timestamp).getTime(),
    }));
}

const handlers = {};

handlers.CALLING_OPERATION = (input, matched, pattern) => {
    const output = input;
    output.text = pattern.messages;
    output.objects = [JSON.parse(matched[pattern.group])];
    return output;
};

handlers.PARSE_SDP = (input, matched, pattern) => {
    const output = input;
    output.text = pattern.messages;
    output.objects = matched[pattern.group];
    return output;
};

handlers.WSS_CONFIG = (input, matched, pattern) => {
    const output = input;
    output.text = pattern.messages;
    output.objects = [JSON.parse(matched[pattern.group])];
    return output;
};

handlers.CONTACT_DETECTED = (input, matched, pattern) => {
    // keep a record of the original text in case we need them.
    const output = input;
    output._originalText = input.text;
    output.text = `${pattern.messages}${matched[1]}`;
    output.objects = [{
        contactId: matched[1],
        agentConnectionId: matched[2],
    }];
    return output;
};

handlers.API_CALL = (input, matched, pattern) => {
    // keep a record of the original text in case we need them.
    const output = input;
    output._originalText = input.text;
    output.text = `${pattern.messages} '${matched[1]}'`;
    if (!index.latency.has(matched[1])) {
        // create key and array for this api now.
        index.latency.set(matched[1], []);
    }
    index.latency.get(matched[1]).push({
        _key: input._key,
        _ts: input._ts,
        type: 'SEND',
    });
    return output;
};

handlers.API_REPLY = (input, matched, pattern) => {
    // keep a record of the original text in case we need them.
    const output = input;
    output._originalText = input.text;
    // eslint-disable-next-line prefer-destructuring
    output.status = matched[2];
    output.text = `${matched[2] === 'succeeded' ? '✔ ' : '❗ '}${pattern.messages} '${matched[1]}' ${matched[2]}`;
    if (matched[2] === 'failed') {
        output.objects = [JSON.parse(matched[3])];
        output.highlight = true;
    }
    if (!index.latency.has(matched[1])) {
        // create key and array for this api now.
        index.latency.set(matched[1], []);
    }
    index.latency.get(matched[1]).push({
        _key: input._key,
        _ts: input._ts,
        type: 'REPLY',
        status: input.status,
    });
    return output;
};

handlers.HEART_BEAT_SEND = (input, _matched, _pattern) => {
    const output = input;
    if (!index.latency.has('wss')) {
        // create key and array for this api now.
        index.latency.set('wss', []);
    }
    index.latency.get('wss').push({
        _key: input._key,
        _ts: input._ts,
        type: 'SEND',
    });
    return output;
};

handlers.HEART_BEAT_REPLY = (input, _matched, _pattern) => {
    const output = input;
    if (!index.latency.has('wss')) {
        // create key and array for this api now.
        index.latency.set('wss', []);
    }
    index.latency.get('wss').push({
        _key: input._key,
        _ts: input._ts,
        type: 'REPLY',
    });
    return output;
};

handlers.SOFTPHONE_METRICS = (input, matched, pattern) => {
    const objects = JSON.parse(matched[1]);
    const output = input;
    output.objects = objects;
    output.text = pattern.messages;
    pushMetrics(objects);
    softphoneMetrics.hasValues = true;

    return output;
};

handlers.SOFTPHONE_REPORT = (input, matched, pattern) => {
    const objects = JSON.parse(matched[1]);
    const output = input;
    output.objects = [objects];
    output.text = pattern.messages;

    return output;
};

export function buildIndex() {
    // this function is quit ugly but I cannot find a prettier way to do it right now.
    // I am assuming that this function will be ran right after
    // the load of the file is complete and the `index` is not empty.
    // index shall have at least 2 items:
    // contacts: holds information about the information for a call;
    // latency: holds information about the latency,
    const outputIndex = new Map();
    // loop through the Index to sort the entries.
    index.latency.forEach((items, key) => {
        // sort the array here.
        // let timestamps = items.sort(); // < magically this actrually works.........
        // yeah according to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        items.sort((a, b) => a._key - b._key); // sort happens in-place.
        items.forEach((item, idx) => {
            switch (item.type) {
            case 'SEND':
                // find it's next reply
                if (items[idx + 1] !== undefined && items[idx + 1].type === 'REPLY') {
                    outputIndex.set(item._key, {
                        type: item.type,
                        apiName: key,
                        relatedWith: items[idx + 1]._key,
                        lastReplyInterval:
                            items[idx - 1] ? items[idx]._ts - items[idx - 1]._ts : null,
                    });
                    // push the next entry as well.
                    outputIndex.set(items[idx + 1]._key, {
                        type: items[idx + 1].type,
                        apiName: key,
                        relatedWith: item._key,
                        latency: items[idx + 1]._ts - items[idx]._ts,
                        status: items[idx + 1].status,
                    });
                } else {
                    // this SEND cannot find it's related REPLY
                    outputIndex.set(item._key, { type: item.type, apiName: key, relateWith: null });
                }
                break;
            case 'REPLY':
                // normally a REPLY should exist already in the index.
                // now picking up orphans
                if (!outputIndex.has(item._key)) {
                    outputIndex.set(items._key, {
                        type: item.type, apiName: key, relateWith: null, status: item.status,
                    });
                }
                break;
            default:
                // we shouldn't reach here.
                break;
            }
        });
    });
    return outputIndex;
}

export function resetIndex() {
    index = {
        contacts: [],
        latency: new Map(),
    };
}
export function findExtras(logEntry, idx) {
    // adding index in the logs
    const logEntryOutput = logEntry;
    logEntryOutput._key = idx;
    // convert the timestamp back to epoch for easier timediff
    // logEntry._ts = new Date(logEntry.time).getTime();
    // why signalling log entries have a space at front???
    logEntryOutput.text = logEntry.text.trim();

    // eslint-disable-next-line no-restricted-syntax, no-unused-vars
    for (const item of patterns) {
        let a = null;
        a = item.pattern.exec(logEntry.text);
        if (a !== null) {
            // we found a match pattern - now do something about it.
            return handlers[item.case](logEntry, a, item);
        }
        a = null;
    }
    return logEntry;
}

export function getSoftphoneMetrics() {
    return softphoneMetrics;
}

export function resetSoftphoneMetrics() {
    Object.keys(softphoneMetrics).forEach((item) => {
        delete softphoneMetrics[item];
    });
    //  for (const item in softphoneMetrics) {
    //  delete softphoneMetrics[item];
    //  }
    softphoneMetrics.audio_input = [];
    softphoneMetrics.audio_output = [];
    softphoneMetrics.hasValues = false;
}

export function sortSoftphoneMetrics() {
    softphoneMetrics.audio_input.sort((a, b) => a.ts - b._ts);
    softphoneMetrics.audio_output.sort((a, b) => a.ts - b._ts);
}

export function hasSoftphoneMetrics() {
    return softphoneMetrics.hasValues;
}
