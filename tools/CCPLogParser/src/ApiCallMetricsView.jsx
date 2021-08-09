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

/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import Container from 'aws-northstar/layouts/Container';
// import Paper from '@material-ui/core/Paper';
// import Typography from '@material-ui/core/Typography';
import {
    ResponsiveContainer, Line, CartesianGrid,
    XAxis, YAxis, Label, Tooltip, ComposedChart, Dot,
} from 'recharts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const styles = (theme) => ({
    root: {
        '& > *': {
            marginTop: 16,
        },
    },
    header: {
        position: 'static',
        width: '100%',
        display: 'flex',
        zIndex: 1100,
        boxSizing: 'border-box',
        flexShrink: 0,
        flexDirection: 'column',
        padding: theme.spacing(1, 2),
        background: '#f7f7f7',
    },
    headerInside: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    content: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    tooltip: {
        border: '1px rgba(0, 0, 0, 0.35) solid',
        background: 'rgba(255, 255, 255, 0.96)',
        fontSize: '14px',
        padding: theme.spacing(0.5),
        '&$normal': {},
        '&$abnormal': {
            border: '1px rgba(200, 0, 0, 0.35) solid',
            background: 'rgba(255, 235, 235, 0.96)',
        },
        '& .date': {
            fontWeight: 'bold',
            textAlign: 'right',
        },
        '& .alert': {
            color: 'red',
        },
        '& p': {
            margin: 0,
        },
    },
    normal: {},
    abnormal: {},
});

class ApiCallMetricsView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.renderCustomAxisTick = this.renderCustomAxisTick.bind(this);
        this.renderCustomTooltip = this.renderCustomTooltip.bind(this);
    }

    getInitialState() {
        return {
            hideLatencyGraph: false,
        };
    }

    // eslint-disable-next-line class-methods-use-this
    renderCustomAxisTick({
        x, y, payload,
    }) {
        return (
            <text x={x - 35} y={y + 15}>{dayjs(payload.value).utc().format('HH:mm:ss')}</text>
        );
    }

    // eslint-disable-next-line class-methods-use-this
    renderDots({
        key, cx, cy, r, payload,
    }) {
        if (payload && payload.status && payload.status === 'failed') {
            return (
                <Dot key={key} cx={cx} cy={cy} r={r} fill="red" />
            );
        }
        return false;
    }

    // eslint-disable-next-line class-methods-use-this
    renderActiveDots({
        key, cx, cy, r, fill, strokeWidth, payload,
    }) {
        if (payload && payload.status && payload.status === 'failed') {
            return (
                <Dot key={key} cx={cx} cy={cy} r={r} fill="red" />
            );
        }
        return (<Dot key={key} cx={cx} cy={cy} r={r - 1} stroke={fill} strokeWidth={strokeWidth} fill="white" />);
    }

    renderCustomTooltip({ payload, active }) {
        const { classes } = this.props;

        if (active && payload) {
            return (
                <div className={clsx(classes.tooltip)}>
                    <p className="date">
                        Local Time:
                        {payload[0].payload.localTimestamp}
                    </p>
                    <p className="state">
                        API:
                        {payload[0].payload.apiName}
                    </p>
                    <p className="state">
                        Latency:
                        {payload[0].payload.latency}
                        {' '}
                        ms
                    </p>
                    { payload[0].payload.status && (
                        <p className="state">
                            Status:
                            {payload[0].payload.status}
                            {' '}
                            {payload[0].payload.status === 'failed' ? '⚠️' : ''}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    }

    render() {
        const {
            classes, className: classNameProp, log, indexedLogs,
        } = this.props;

        // filtering out the following APIs for a better representation of the latency
        const apiFilter = new Set([
            'getAgentSnapshot',
        ]);

        const latencies = log
            .filter((event) => (indexedLogs.has(event._key)))
            .flatMap((event) => ({
                _localTimestamp: event._ts,
                localTimestamp: event.time,
                _type: 'LATENCY',
                ...indexedLogs.get(event._key),
            }))
            .filter((event) => !(apiFilter.has(event.apiName) || event.type === 'SEND'));

        return (
            <div className={clsx(classes.root, classNameProp)}>
                <Container
                    title="API Call Metrics"
                    gutters={false}
                >
                    <div className={classes.content}>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart
                                data={latencies}
                                margin={{
                                    top: 5, right: 20, bottom: 5, left: 20,
                                }}
                            >
                                <YAxis>
                                    <Label angle={270} position="left" style={{ textAnchor: 'middle' }}>
                                        Latency (ms)
                                    </Label>
                                </YAxis>
                                <XAxis dataKey="_localTimestamp" type="number" scale="time" domain={['auto', 'auto']} tick={this.renderCustomAxisTick} />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                {/* eslint-disable-next-line max-len */}
                                <Line type="linear" dataKey="latency" stroke="#8884d8" strokeWidth={2} dot={this.renderDots} activeDot={this.renderActiveDots} connectNulls isAnimationActive={false} />
                                <Tooltip content={this.renderCustomTooltip} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Container>
            </div>
        );
    }
}

ApiCallMetricsView.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    log: PropTypes.array.isRequired,
    indexedLogs: PropTypes.object.isRequired,
};
ApiCallMetricsView.defaultProps = {
    className: '',
};

export default withStyles(styles)(ApiCallMetricsView);
