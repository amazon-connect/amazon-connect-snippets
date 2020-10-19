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
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {
    ResponsiveContainer, Line, Area, ReferenceArea, CartesianGrid,
    XAxis, YAxis, Tooltip, Legend, ComposedChart, Dot,
} from 'recharts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

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
        '&$normal': {

        },
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

const colorMap = {
    Available: '#88ff88',
    PendingBusy: '#fff8a2',
    Busy: '#ffcc88',
    AfterCallWork: '#888888',
    FailedConnectAgent: '#ff8488',
    FailedConnectCustomer: '#ff8488',
    CallingCustomer: '#fff8a2',
    MissedCallAgent: '#bbbbff',
    __other: '#ffffff',
};

class MetricsView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.handleToggleReferenceArea = this.handleToggleReferenceArea.bind(this);
        this.handleLegendMouseEnter = this.handleLegendMouseEnter.bind(this);
        this.handleLegendMouseLeave = this.handleLegendMouseLeave.bind(this);
        this.renderCustomAxisTick = this.renderCustomAxisTick.bind(this);
        this.renderCustomTooltip = this.renderCustomTooltip.bind(this);
        this.renderCustomLegend = this.renderCustomLegend.bind(this);
    }

    getInitialState() {
        return {
            skewThreshold: 10000,
            hideReferenceArea: false,
            hideLatencyGraph: false,
            hideSkewGraph: false,
            referenceAreaOpacities:
                Object.fromEntries(Object.keys(colorMap).map((name) => [name, 1])),
        };
    }

    handleToggleReferenceArea() {
        const { hideReferenceArea } = this.state;
        this.setState({ hideReferenceArea: !hideReferenceArea });
    }

    handleToggleLatencyGraph() {
        const { hideLatencyGraph } = this.state;
        this.setState({ hideLatencyGraph: !hideLatencyGraph });
    }

    handleToggleSkewGraph() {
        const { hideSkewGraph } = this.state;
        this.setState({ hideSkewGraph: !hideSkewGraph });
    }

    handleLegendMouseEnter(name) {
        const { referenceAreaOpacities: opacities } = this.state;
        const newOpacities = Object.fromEntries(Object.keys(opacities).map((n) => [n, 0.25]));
        this.setState({
            referenceAreaOpacities: { ...newOpacities, [name]: 1 },
        });
    }

    handleLegendMouseLeave() {
        const { referenceAreaOpacities: opacities } = this.state;
        const newOpacities = Object.fromEntries(Object.keys(opacities).map((n) => [n, 1.0]));
        this.setState({
            referenceAreaOpacities: { ...newOpacities },
        });
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
        const { skewThreshold } = this.state;

        if (active && payload) {
            if (payload.length > 0 && payload[0].name === 'skew') {
                const skewTooLarge = Math.abs(payload[0].payload.skew) >= skewThreshold;
                return (
                    <div className={clsx(classes.tooltip, {
                        [classes.normal]: !skewTooLarge,
                        [classes.abnormal]: skewTooLarge,
                    })}
                    >
                        <p className="date">
                            Server Time:
                            {dayjs(payload[0].payload._snapshotTimestamp).toISOString()}
                        </p>
                        <p className="date">
                            Local Time:
                            {payload[0].payload.localTimestamp}
                        </p>

                        <p className="state">{payload[0].payload.state.name}</p>
                        <p className="label">
                            Local clock
                            {' '}
                            {Math.abs(payload[0].payload.skew)}
                            {' '}
                            ms
                            {' '}
                            {payload[0].payload.skew > 0 ? 'ahead' : 'behind'}
                            {skewTooLarge && <span className="alert" role="img" aria-label="alert">&nbsp;⚠️</span>}
                        </p>
                    </div>
                );
            }
            if (payload.length > 0 && payload[0].name === 'latency') {
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
        }
        return null;
    }

    renderCustomLegend() {
        const { classes } = this.props;
        const { referenceAreaOpacities } = this.state;
        return (
            <ul className={classes.legend}>
                { Object.keys(colorMap).map((name) => (
                    <li
                        key={name}
                        onMouseEnter={() => this.handleLegendMouseEnter(name)}
                        onMouseLeave={() => this.handleLegendMouseLeave()}
                        style={{ opacity: referenceAreaOpacities[name] }}
                    >
                        <div className="colorBox" style={{ backgroundColor: colorMap[name] }} />
                        { (name === '__other') ? 'Other' : name}
                    </li>
                ))}
            </ul>
        );
    }

    render() {
        const {
            classes, className: classNameProp, log, indexedLogs,
        } = this.props;
        const {
            skewThreshold,
            hideReferenceArea,
            referenceAreaOpacities,
            hideLatencyGraph,
            hideSkewGraph,
        } = this.state;

        const snapshots = log
            .filter((event) => (event.text === 'GET_AGENT_SNAPSHOT succeeded.'))
            .flatMap((event) => event.objects.map((object, idx) => ({
                ...object.snapshot,
                _event: event,
                _key: `${event._key}-${idx}`,
                _date: object.snapshot.snapshotTimestamp.substring(0, 10),
                _time: object.snapshot.snapshotTimestamp.substring(11, 23),
                _timezone: object.snapshot.snapshotTimestamp.substring(23),
                _snapshotTimestamp: dayjs(object.snapshot.snapshotTimestamp).valueOf(),
                _localTimestamp: event._ts,
                localTimestamp: dayjs(event._ts).toISOString(),
                _type: 'SNAPSHOT',
            })))
            .map((snapshot, idx, arr) => {
                const eventKeyFrom = snapshot._event._key;
                // eslint-disable-next-line max-len
                const eventKeyTo = (idx !== arr.length - 1) ? arr[idx + 1]._event._key : log[log.length - 1]._key;
                return {
                    ...snapshot,
                    // eslint-disable-next-line max-len
                    _targetEventKeys: Array.from(Array(eventKeyTo - eventKeyFrom), (v, k) => (k + eventKeyFrom)),
                };
            });

        const seqSnapshots = snapshots // removing the duplications in states.
            .reduce((acc, x) => {
                if (acc.length > 0 && acc[acc.length - 1][0].state.name === x.state.name) {
                    acc[acc.length - 1].push(x);
                } else {
                    acc.push([x]);
                }
                return acc;
            }, []);

        const gradientOffset = () => {
            const dataMax = Math.max(...snapshots.map((s) => s.skew));
            const dataMin = Math.min(...snapshots.map((s) => s.skew));

            const y0 = Math.min(1, Math.max(0, (skewThreshold - dataMin) / (dataMax - dataMin)));
            const y1 = Math.min(1, Math.max(0, (-skewThreshold - dataMin) / (dataMax - dataMin)));

            return [
                1 - y0,
                1 - y1,
            ];
        };
        const off = gradientOffset();
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

        const data = () => {
            if (hideLatencyGraph && !hideSkewGraph) {
                return snapshots;
            } if (!hideLatencyGraph && hideSkewGraph) {
                return latencies;
            }
            return snapshots.concat(latencies)
                .sort((a, b) => a._localTimestamp - b._localTimestamp);
        };

        return (
            <div className={clsx(classes.root, classNameProp)}>
                <Paper>
                    <div className={classes.header}>
                        <div className={classes.headerInside}>
                            <Typography className={classes.title} variant="h6" component="h3">
                                Metrics
                            </Typography>
                            {hideSkewGraph
                                ? (
                                    <Button
                                        className={classes.toggleReferenceArea}
                                        onClick={() => this.handleToggleSkewGraph()}
                                    >
                                        Show Skew Graph
                                    </Button>
                                )
                                : (
                                    <Button
                                        className={classes.toggleReferenceArea}
                                        onClick={() => this.handleToggleSkewGraph()}
                                    >
                                        Hide Skew Graph
                                    </Button>
                                )}
                            {hideLatencyGraph
                                ? (
                                    <Button
                                        className={classes.toggleReferenceArea}
                                        onClick={() => this.handleToggleLatencyGraph()}
                                    >
                                        Show Latency Graph
                                    </Button>
                                )
                                : (
                                    <Button
                                        className={classes.toggleReferenceArea}
                                        onClick={() => this.handleToggleLatencyGraph()}
                                    >
                                        Hide Latency Graph
                                    </Button>
                                )}
                            {hideReferenceArea
                                ? (
                                    <Button
                                        className={classes.toggleReferenceArea}
                                        onClick={() => this.handleToggleReferenceArea()}
                                    >
                                        Show Reference Area
                                    </Button>
                                )
                                : (
                                    <Button
                                        className={classes.toggleReferenceArea}
                                        onClick={() => this.handleToggleReferenceArea()}
                                    >
                                        Hide Reference Area
                                    </Button>
                                )}

                        </div>
                    </div>
                    <div className={classes.content}>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart
                                data={data()}
                                margin={{
                                    top: 5, right: 20, bottom: 5, left: 20,
                                }}
                            >
                                <YAxis
                                    yAxisId={1}
                                    label={{
                                        value: 'Skew (ms)', angle: -90, offset: 0, position: 'left',
                                    }}
                                />
                                <YAxis
                                    yAxisId={2}
                                    label={{
                                        value: 'Latency (ms)', angle: 90, offset: 0, position: 'right',
                                    }}
                                    orientation="right"
                                />
                                <XAxis dataKey="_localTimestamp" type="number" scale="time" domain={['auto', 'auto']} tick={this.renderCustomAxisTick} />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                {/* eslint-disable-next-line max-len */}
                                {/* <Line yAxisId={1} type="monotone" dataKey="skew" stroke="#000000" connectNulls={true}/> */}
                                {!hideSkewGraph
                                                                                    && <Area yAxisId={1} type="monotone" dataKey="skew" stroke="#000" fill="url(#splitColor)" connectNulls isAnimationActive={false} />}
                                {!hideLatencyGraph
                                                                                        && <Line yAxisId={2} type="linear" dataKey="latency" stroke="#0000ff" strokeWidth={2} dot={this.renderDots} activeDot={this.renderActiveDots} connectNulls isAnimationActive={false} />}

                                <Tooltip content={this.renderCustomTooltip} />
                                <defs>
                                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset={off[0]} stopColor="red" stopOpacity={1} />
                                        <stop offset={off[0]} stopColor="green" stopOpacity={1} />
                                        <stop offset={off[1]} stopColor="green" stopOpacity={1} />
                                        <stop offset={off[1]} stopColor="red" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                {!hideReferenceArea && seqSnapshots.map((s, i, arr) => {
                                    const s0 = s[0];
                                    const s1 = (i < arr.length - 1)
                                        ? arr[i + 1][0] : s[s.length - 1];
                                    const stateHits = Object.keys(colorMap)
                                        .filter((name) => s0.state.name.includes(name));
                                    const color = (stateHits.length > 0)
                                        ? colorMap[stateHits[0]] : colorMap.__other;
                                    // eslint-disable-next-line max-len
                                    const opacity = (stateHits.length > 0) ? referenceAreaOpacities[stateHits[0]] : referenceAreaOpacities.__other;
                                    return (
                                        <ReferenceArea
                                            yAxisId={1}
                                            key={s0._key}
                                            className={classes.referenceArea}
                                            x1={s0._localTimestamp}
                                            x2={s1._localTimestamp}
                                            ifOverflow="extendDomain"
                                            opacity={opacity}
                                            fill={color}
                                        />
                                    );
                                })}
                                {!hideReferenceArea && <Legend content={this.renderCustomLegend} />}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>
            </div>
        );
    }
}

MetricsView.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    log: PropTypes.array.isRequired,
    indexedLogs: PropTypes.object.isRequired,
};
MetricsView.defaultProps = {
    className: '',
};

export default withStyles(styles)(MetricsView);
