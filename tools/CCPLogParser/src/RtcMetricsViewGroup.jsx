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
import { withStyles } from '@material-ui/core/styles';
import { getSoftphoneMetrics } from './utils/findExtras';
import RtcMetricsView from './RtcMetricsView';

const styles = () => ({});

class RtcMetricsViewGroup extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeReset = this.handleRangeReset.bind(this);
    }

    getInitialState() {
        const { timeRange } = this.props;

        const metricsData = getSoftphoneMetrics();
        const audioInput = metricsData.audio_input.flat();
        const audioOutput = metricsData.audio_output.flat();

        return {
            audioInput,
            audioOutput,
            timeRange,
            originalTimeRange: timeRange,
            indexRange: [null, null],
            originalIndexRange: [null, null],
        };
    }

    handleRangeChange(timeRange, indexRange) {
        this.setState({ timeRange, indexRange });
    }

    handleRangeReset() {
        const { originalTimeRange, originalIndexRange } = this.state;
        this.setState({ timeRange: originalTimeRange, indexRange: originalIndexRange });
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const { classes } = this.props;
        const {
            audioInput, audioOutput, timeRange, indexRange,
        } = this.state;

        return (
            <>
                <RtcMetricsView
                    type="audio_input"
                    data={audioInput}
                    timeRange={timeRange}
                    indexRange={indexRange}
                    updateRange={this.handleRangeChange}
                    resetRange={this.handleRangeReset}
                />
                <RtcMetricsView
                    type="audio_output"
                    data={audioOutput}
                    timeRange={timeRange}
                    indexRange={indexRange}
                    updateRange={this.handleRangeChange}
                    resetRange={this.handleRangeReset}
                />
            </>
        );
    }
}

RtcMetricsViewGroup.propTypes = {
    classes: PropTypes.object.isRequired,
    timeRange: PropTypes.array.isRequired,
};
RtcMetricsViewGroup.defaultProps = {
};

export default withStyles(styles)(RtcMetricsViewGroup);
