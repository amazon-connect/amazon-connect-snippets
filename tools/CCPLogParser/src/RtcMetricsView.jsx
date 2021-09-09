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
import Container from 'aws-northstar/layouts/Container';
import Button from 'aws-northstar/components/Button';
import {
    ResponsiveContainer, Line, CartesianGrid, XAxis, YAxis,
    Tooltip, Label, LineChart, ComposedChart, Legend, ReferenceArea, Brush,
} from 'recharts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import interpolate from './utils/interpolator';
import { TIMESTAMP_KEY } from './constants';

dayjs.extend(utc);

const colorMap = {
    packetsLost: '#da7c7c',
    packetsCount: '#8884d8',
    audioLevel: '#82ca9d',
    jitterBufferMillis: '#990099',
    roundTripTimeMillis: '#ff9933',
};

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
    zoomResetButton: {
        marginLeft: 'auto',
    },
    content: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        userSelect: 'none',
    },
    referenceArea: {
        opacity: '0.8',
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
        '& .packetsLost': {
            color: colorMap.packetsLost,
        },
        '& .packetsCount': {
            color: colorMap.packetsCount,
        },
        '& .audioLevel': {
            color: colorMap.audioLevel,
        },
        '& .jitterBufferMillis': {
            color: colorMap.jitterBufferMillis,
        },
        '& .roundTripTimeMillis': {
            color: colorMap.roundTripTimeMillis,
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
        this.handleChangeBrush = this.handleChangeBrush.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
        this.handleZoomReset = this.handleZoomReset.bind(this);
        this.formatBrushTick = this.formatBrushTick.bind(this);
        this.renderCustomAxisTick = this.renderCustomAxisTick.bind(this);
        this.renderCustomTooltip = this.renderCustomTooltip.bind(this);
    }

    getInitialState() {
        const { data: rawData, timeRange } = this.props;

        // interpolate
        const data = interpolate(rawData, timeRange);

        return {
            // the raw data passed in props
            rawData,
            // original interpolated data
            originalData: data,
            // rendered interpolated data
            data,
            // flag to indicate whether the mouse is on Brush
            brushHovering: false,
            // variables used for zoom feature
            refIndexLeft: -1,
            refIndexRight: -1,
            refAreaLeft: '',
            refAreaRight: '',
        };
    }

    componentDidUpdate(prevProps) {
        const { timeRange } = this.props;

        if (prevProps.timeRange !== timeRange) {
            // need to update the data
            const { rawData } = this.state;
            const data = interpolate(rawData, timeRange);

            // update data
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ data });
        }
    }

    handleChangeBrush(e) {
        const { startIndex, endIndex } = e;
        const { originalData } = this.state;

        // interpolate data
        const timeRange = [
            originalData[startIndex][TIMESTAMP_KEY],
            originalData[endIndex][TIMESTAMP_KEY],
        ];

        // update time range
        const { updateRange } = this.props;
        updateRange(timeRange, [startIndex, endIndex]);
    }

    handleMouseDown(e) {
        if (e) {
            this.setState({
                refIndexLeft: e.activeTooltipIndex - 1,
                refAreaLeft: e.activeLabel,
            });
        }
    }

    handleMouseMove(e) {
        if (e) {
            const { refAreaLeft } = this.state;
            if (refAreaLeft) {
                this.setState({
                    refIndexRight: e.activeTooltipIndex - 1,
                    refAreaRight: e.activeLabel,
                });
            }
        }
    }

    handleZoom() {
        const { originalData } = this.state;
        let {
            refIndexLeft, refIndexRight, refAreaLeft, refAreaRight,
        } = this.state;

        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            this.setState(() => ({
                refAreaLeft: '',
                refAreaRight: '',
            }));
            return;
        }

        // swap if needed to ensure left is smaller than right
        if (refIndexLeft > refIndexRight) {
            [refIndexLeft, refIndexRight] = [refIndexRight, refIndexLeft];
        }
        if (refAreaLeft > refAreaRight) {
            [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
        }

        // the time range
        const timeRange = [refAreaLeft, refAreaRight];

        // find the startIndex and endIndex in originalData array
        let ptr = 0;
        const indexRange = [0, 0];
        while (ptr < originalData.length && originalData[ptr][TIMESTAMP_KEY] < timeRange[0]) {
            ptr += 1;
        }
        indexRange[0] = ptr;
        while (ptr < originalData.length && originalData[ptr][TIMESTAMP_KEY] < timeRange[1]) {
            ptr += 1;
        }
        indexRange[1] = ptr;

        // update time range
        const { updateRange } = this.props;
        updateRange(timeRange, indexRange);

        // update state
        this.setState(() => ({
            refIndexLeft: -1,
            refIndexRight: -1,
            refAreaLeft: '',
            refAreaRight: '',
        }));
    }

    handleZoomReset() {
        const { originalData } = this.state;

        // update data
        this.setState(() => ({
            data: originalData,
            refIndexLeft: -1,
            refIndexRight: -1,
            refAreaLeft: '',
            refAreaRight: '',
        }));

        const { resetRange } = this.props;
        resetRange();
    }

    formatBrushTick(value) {
        return dayjs(value).utc().format('HH:mm:ss');
    }

    renderCustomAxisTick({
        x, y, payload,
    }) {
        return (
            <text x={x - 35} y={y + 15}>
                {dayjs(payload.value).utc().format('HH:mm:ss')}
            </text>
        );
    }

    renderCustomTooltip(keys) {
        return ({ payload, active }) => {
            const { classes } = this.props;

            if (active && payload && payload[0]) {
                return (
                    <div className={clsx(classes.tooltip)}>
                        <p className="date">
                            Timestamp:
                            {payload[0].payload.timestamp}
                        </p>
                        { keys.map((key) => (
                            <p key={key} className={key}>
                                {key}
                                :
                                {payload[0].payload[key]}
                            </p>
                        ))}
                    </div>
                );
            }
            return null;
        };
    }

    render() {
        const {
            classes, className: classNameProp,
            type, timeRange, indexRange: [startIndex, endIndex],
        } = this.props;
        const {
            data, originalData,
            brushHovering, refAreaLeft, refAreaRight,
        } = this.state;

        return (
            <div className={clsx(classes.root, classNameProp)}>
                <Container
                    title={`WebRTC Metrics - ${type}`}
                    gutters={false}
                    actionGroup={(
                        <Button
                            className={classes.zoomResetButton}
                            onClick={this.handleZoomReset}
                        >
                            Zoom Reset
                        </Button>
                    )}
                >

                    <div className={classes.content}>

                        {/* Audio Level */}
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                                data={data}
                                margin={{
                                    top: 5, right: 20, bottom: 5, left: 20,
                                }}
                                onMouseDown={this.handleMouseDown}
                                onMouseMove={this.handleMouseMove}
                                onMouseUp={this.handleZoom}
                            >
                                <YAxis allowDataOverflow type="number">
                                    <Label angle={270} position="left" style={{ textAnchor: 'middle' }}>
                                        Audio Level
                                    </Label>
                                </YAxis>
                                <XAxis allowDataOverflow dataKey={TIMESTAMP_KEY} tick={this.renderCustomAxisTick} type="number" domain={timeRange} />
                                <CartesianGrid />
                                <Line
                                    type="linear"
                                    dataKey="audioLevel"
                                    stroke={colorMap.audioLevel}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot
                                    connectNulls={false}
                                    isAnimationActive={false}
                                />
                                <Tooltip content={this.renderCustomTooltip(['audioLevel'])} />
                                <Legend verticalAlign="bottom" />
                                { (refAreaLeft && refAreaRight) && (
                                    <ReferenceArea
                                        x1={refAreaLeft}
                                        x2={refAreaRight}
                                        strokeOpacity={0.3}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>

                        {/* Packets */}
                        <ResponsiveContainer width="100%" height={200}>
                            <ComposedChart
                                data={data}
                                margin={{
                                    top: 5, right: 20, bottom: 5, left: 20,
                                }}
                                onMouseDown={this.handleMouseDown}
                                onMouseMove={this.handleMouseMove}
                                onMouseUp={this.handleZoom}
                            >
                                <YAxis allowDataOverflow type="number">
                                    <Label angle={270} position="left" style={{ textAnchor: 'middle' }}>
                                        Packets
                                    </Label>
                                </YAxis>
                                <XAxis allowDataOverflow dataKey={TIMESTAMP_KEY} tick={this.renderCustomAxisTick} type="number" domain={timeRange} />
                                <CartesianGrid />
                                <Line
                                    type="linear"
                                    dataKey="packetsLost"
                                    stroke={colorMap.packetsLost}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot
                                    connectNulls={false}
                                    isAnimationActive={false}
                                />
                                <Line
                                    type="linear"
                                    dataKey="packetsCount"
                                    stroke={colorMap.packetsCount}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot
                                    connectNulls={false}
                                    isAnimationActive={false}
                                />
                                <Tooltip content={this.renderCustomTooltip(['packetsLost', 'packetsCount'])} />
                                <Legend verticalAlign="bottom" />
                                { (refAreaLeft && refAreaRight) && (
                                    <ReferenceArea
                                        x1={refAreaLeft}
                                        x2={refAreaRight}
                                        strokeOpacity={0.3}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>

                        {/* Jitter Buffer and RTT */}
                        <ResponsiveContainer width="100%" height={200}>
                            <ComposedChart
                                data={data}
                                margin={{
                                    top: 5, right: 20, bottom: 5, left: 20,
                                }}
                                onMouseDown={this.handleMouseDown}
                                onMouseMove={this.handleMouseMove}
                                onMouseUp={this.handleZoom}
                            >
                                <YAxis allowDataOverflow type="number">
                                    { type === 'audio_input' && (
                                        <Label angle={270} position="left" style={{ textAnchor: 'middle' }}>
                                            Jitter Buffer (ms)
                                        </Label>
                                    )}
                                    { type === 'audio_output' && (
                                        <Label angle={270} position="left" style={{ textAnchor: 'middle' }}>
                                            Jitter Buffer &amp; RTT (ms)
                                        </Label>
                                    )}
                                </YAxis>
                                <XAxis allowDataOverflow dataKey={TIMESTAMP_KEY} tick={this.renderCustomAxisTick} type="number" domain={timeRange} />
                                <CartesianGrid />
                                <Line
                                    type="linear"
                                    dataKey="jitterBufferMillis"
                                    stroke={colorMap.jitterBufferMillis}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot
                                    connectNulls={false}
                                    isAnimationActive={false}
                                />
                                { type === 'audio_output' && (
                                    <Line
                                        type="linear"
                                        dataKey="roundTripTimeMillis"
                                        stroke={colorMap.roundTripTimeMillis}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                )}
                                <Tooltip
                                    content={
                                        type === 'audio_output'
                                            ? this.renderCustomTooltip(['jitterBufferMillis', 'roundTripTimeMillis'])
                                            : this.renderCustomTooltip(['jitterBufferMillis'])
                                    }
                                />
                                <Legend verticalAlign="bottom" />
                                { (refAreaLeft && refAreaRight) && (
                                    <ReferenceArea
                                        x1={refAreaLeft}
                                        x2={refAreaRight}
                                        strokeOpacity={0.3}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>

                        {/* Brush */}
                        <ResponsiveContainer width="100%" height={60}>
                            <ComposedChart
                                // update data to force re-rendering
                                data={brushHovering ? originalData : [...originalData]}
                                margin={{
                                    top: 5, right: 20, bottom: 5, left: 20,
                                }}
                                onMouseEnter={() => this.setState({ brushHovering: true })}
                                onMouseLeave={() => this.setState({ brushHovering: false })}
                            >
                                <Brush
                                    className="TimeLineChart-brush"
                                    dataKey={TIMESTAMP_KEY}
                                    stroke="#666666"
                                    startIndex={startIndex || 0}
                                    endIndex={endIndex || originalData.length - 1}
                                    onChange={this.handleChangeBrush}
                                    tickFormatter={this.formatBrushTick}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>

                    </div>
                </Container>
            </div>
        );
    }
}

RtcMetricsView.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    type: PropTypes.oneOf(['audio_input', 'audio_output']).isRequired,
    data: PropTypes.array.isRequired,
    timeRange: PropTypes.array.isRequired,
    indexRange: PropTypes.array.isRequired,
    updateRange: PropTypes.func.isRequired,
    resetRange: PropTypes.func.isRequired,
};
RtcMetricsView.defaultProps = {
    className: '',
};

export default withStyles(styles)(RtcMetricsView);
