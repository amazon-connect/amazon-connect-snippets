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

import { TIMESTAMP_KEY, WEBRTC_METRICS_KEYS } from '../constants';

// default maximum number of data points to return
const DEFAULT_MAX_DATA_COUNT = 1000;
// default minimum time interval between datapoints
const DEFAULT_MIN_DATA_STEP = 1500;

/**
 * Interpolates continuous time series data from discontinuous data by filling empty datapoints
 * @param {*} timeData the discontinuous time series data
 * @param {*} timeRange time range of timeKey attribute, must be passed as an array of [start, end]
 * @param {*} timeKey the key name of timeData for time
 * @param {*} valueKeys the key names of timeData for value
 * @param {*} maxCount maximum number of data points to return (default: 1000)
 * @param {*} minStep minimum time interval between datapoints (default: 1500)
 * @returns array of datapoints
 */
export default function interpolate(
    timeData,
    timeRange = [null, null],
    timeKey = TIMESTAMP_KEY,
    valueKeys = WEBRTC_METRICS_KEYS,
    maxCount = DEFAULT_MAX_DATA_COUNT,
    minStep = DEFAULT_MIN_DATA_STEP,
) {
    // output array
    const data = [];

    // calculate time range if null is passed
    const [startTime, endTime] = [
        timeRange[0] || Math.min(...timeData.map((d) => d[timeKey])),
        timeRange[1] || Math.max(...timeData.map((d) => d[timeKey])),
    ];

    // deterimine step
    const step = Math.max(minStep, (endTime - startTime) / maxCount);

    // seek until the first datapoint appears
    let ptr = 0;
    while (timeData[ptr][timeKey] < startTime) ptr += 1;

    // interpolate every {step} interval
    let t = startTime;
    while (t < endTime || (startTime === endTime && t === startTime)) {
        t += step;

        // iterate data to find data points between (t - step) and t
        const start = ptr;
        while (ptr < timeData.length && timeData[ptr][timeKey] <= t) ptr += 1;
        const end = ptr;

        // get datapoints from the original data
        const datapoints = timeData.slice(start, end);

        // if no datapoint exists, make an empty one
        if (datapoints.length === 0) {
            const datapoint = {
                [timeKey]: t - (step / 2),
                ...valueKeys.reduce((acc, valueKey) => {
                    acc[valueKey] = null;
                    return acc;
                }, {}),
            };
            datapoints.push(datapoint);
        }

        // push datapoint to output data
        data.push(...datapoints);
    }

    return data;
}
