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

import React from 'react';
import PropTypes from 'prop-types';
import SkewMetricsView from './SkewMetricsView';
import ApiCallMetricsView from './ApiCallMetricsView';

const ThemedMetricsView = ({ log, indexedLogs }) => (
    <div>
        <SkewMetricsView log={log} />
        <ApiCallMetricsView log={log} indexedLogs={indexedLogs} />
    </div>
);

ThemedMetricsView.propTypes = {
    log: PropTypes.array.isRequired,
    indexedLogs: PropTypes.object.isRequired,
};

export default ThemedMetricsView;
