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

/* eslint-disable class-methods-use-this */
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {
    ResponsiveContainer, Line, CartesianGrid, XAxis, YAxis, Tooltip, ComposedChart, Dot,
} from 'recharts';
import { getSoftphoneMetrics } from './utils/findExtras';

const styles = (theme) => ({
    root: {},
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
    toggleReferenceArea: {
        marginLeft: 'auto',
    },
    content: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    referenceArea: {
        opacity: '0.8',
    },
    legend: {
        padding: 0,
        marginTop: '6px',
        marginBottom: 0,
        textAlign: 'center',
        color: '#212121',
        fontSize: '14px',
        '& li': {
            display: 'inline-block',
            marginRight: 10,
        },
        '& .colorBox': {
            width: 10,
            height: 10,
            border: '1px #aaa solid',
            display: 'inline-block',
            marginRight: 2,
        },
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

class RtcMetricsView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.handleToggleReferenceArea = this.handleToggleReferenceArea.bind(this);
    }

    getInitialState() {
        return {};
    }

    renderCustomAxisTick({
        x, y, _width, _height, payload,
    }) {
        // console.log(payload.value);
        if (payload.value && payload.value.slice) {
            return (
                <text x={x - 35} y={y + 15}>
                    {payload.value.slice(11, 19)}
                </text>
            );
        }
        return null;
    }

    renderDots({
        key, cx, cy, r, payload,
    }) {
        if (payload && payload.status && payload.status === 'failed') {
            return <Dot key={key} cx={cx} cy={cy} r={r} fill="red" />;
        }
        return false;
    }

    renderActiveDots({
        key, cx, cy, r, fill, strokeWidth, payload,
    }) {
        if (payload && payload.status && payload.status === 'failed') {
            return <Dot key={key} cx={cx} cy={cy} r={r} fill="red" />;
        }
        return <Dot key={key} cx={cx} cy={cy} r={r - 1} stroke={fill} strokeWidth={strokeWidth} fill="white" />;
    }

    render() {
        const { classes, className: classNameProp } = this.props;
        const data = getSoftphoneMetrics();
        // console.log(data);

        return (
            <div>
                <div className={clsx(classes.root, classNameProp)}>
                    <Paper>
                        <div className={classes.header}>
                            <div className={classes.headerInside}>
                                <Typography className={classes.title} variant="h6" component="h3">
                                    WebRTC Metrics - Inbound Audio
                                </Typography>
                            </div>
                        </div>
                        <div className={classes.content}>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={data.audio_input}>
                                    <YAxis label={{
                                        value: 'data', angle: -90, offset: 0, position: 'left',
                                    }}
                                    />
                                    <XAxis dataKey="timestamp" tick={this.renderCustomAxisTick} />
                                    <CartesianGrid />
                                    <Line
                                        type="linear"
                                        dataKey="packetsLost"
                                        stroke="#0000ff"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        type="linear"
                                        dataKey="packetsCount"
                                        stroke="#0000ff"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                    {/* <Line
                    type="linear"
                    dataKey="audioLevel"
                    stroke="#0000ff"
                    strokeWidth={2}
                    dot={false}
                    activeDot={true}
                    connectNulls={false}
                    isAnimationActive={false}
                /> */}
                                    <Line
                                        type="linear"
                                        dataKey="jitterBufferMillis"
                                        stroke="#0000ff"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                    <Tooltip />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </Paper>
                </div>
                <div className={clsx(classes.root, classNameProp)}>

                    <Paper>
                        <div className={classes.header}>
                            <div className={classes.headerInside}>
                                <Typography className={classes.title} variant="h6" component="h3">
                                    WebRTC Metrics - Outbound Audio
                                </Typography>
                            </div>
                        </div>
                        <div className={classes.content}>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={data.audio_output}>
                                    <YAxis label={{
                                        value: 'data', angle: -90, offset: 0, position: 'left',
                                    }}
                                    />
                                    <XAxis dataKey="timestamp" tick={this.renderCustomAxisTick} />
                                    <CartesianGrid />
                                    <Line
                                        type="linear"
                                        dataKey="packetsLost"
                                        stroke="#0000ff"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        type="linear"
                                        dataKey="packetsCount"
                                        stroke="#0000ff"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                    {/* <Line
                    type="linear"
                    dataKey="audioLevel"
                    stroke="#0000ff"
                    strokeWidth={2}
                    dot={false}
                    activeDot={true}
                    connectNulls={false}
                    isAnimationActive={false}
                /> */}
                                    <Line
                                        type="linear"
                                        dataKey="jitterBufferMillis"
                                        stroke="#0000ff"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        type="linear"
                                        dataKey="roundTripTimeMillis"
                                        stroke="#0000ff"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                    <Tooltip />
                                </ComposedChart>

                            </ResponsiveContainer>
                        </div>
                    </Paper>
                </div>
            </div>
        );
    }
}

RtcMetricsView.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
};

export default withStyles(styles)(RtcMetricsView);
