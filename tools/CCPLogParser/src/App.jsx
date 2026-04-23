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
import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { NorthStarThemeProvider } from 'aws-northstar';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import DescriptionIcon from '@material-ui/icons/Description';
import FeedbackIcon from '@material-ui/icons/Feedback';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import { ThemeProvider, useTheme } from './ThemeContext';
import './App.css';
import pkg from '../package.json';
import EmptyView from './EmptyView';
import DraggingView from './DraggingView';
import LoadingView from './LoadingView';
import SnapshotListView from './SnapshotListView';
import LogView from './LogView';
import RtcMetricsViewGroup from './RtcMetricsViewGroup';
import ThemedMetricsView from './ThemedMetricsView';

import {
    buildIndex, findExtras, resetIndex, hasSoftphoneMetrics, resetSoftphoneMetrics,
} from './utils/findExtras';

function TabPanel(props) {
    const {
        children, value, index, ...other
    } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...other}
        >
            {value === index && (
                <Container maxWidth={false}>
                    <Box>{children}</Box>
                </Container>
            )}
        </div>
    );
}
TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};
TabPanel.defaultProps = {
    children: [],
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const styles = (theme) => ({
    root: {
        flexGrow: 1,
        paddingTop: theme.mixins.toolbar.minHeight + 48, // Account for AppBar + Tabs height
    },
    appbar: {},
    title: {
        flexGrow: 1,
    },
    themeToggle: {
        marginLeft: theme.spacing(1),
        color: 'white',
    },
    feedbackLink: {
        '& a': {
            display: 'inline-flex',
            verticalAlign: 'middle',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            borderColor: 'white',
            fontSize: '13px',
            marginLeft: '13px',
        },
        '& svg': {
            display: 'block',
        },
    },
    tab: {},
    content: {
        zIndex: 2,
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    scrollableContainer: {
        height: `calc(100vh - ${theme.mixins.toolbar.minHeight + 48 + theme.spacing(4)}px)`,
        overflow: 'hidden', // Prevent content from showing through
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    rightIcon: {
        marginLeft: theme.spacing(1),
    },
});

const ThemeToggle = ({ classes }) => {
    const { currentTheme, toggleTheme } = useTheme();
    const isDark = currentTheme === 'dark';

    return (
        <IconButton className={classes.themeToggle} onClick={toggleTheme} size="small" title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
    );
};

ThemeToggle.propTypes = {
    classes: PropTypes.object.isRequired,
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.selectLog = this.selectLog.bind(this);
        this.selectSnapshots = this.selectSnapshots.bind(this);
        this.handleChangeTab = this.handleChangeTab.bind(this);
        this.handleOnDrop = this.handleOnDrop.bind(this);
        this.handleExpandLogView = this.handleExpandLogView.bind(this);
        this.handleClickLogLine = this.handleClickLogLine.bind(this);
        this.dropzoneRef = createRef();

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Great success! All the File APIs are supported.
        } else {
            // eslint-disable-next-line no-alert
            alert('The File APIs are not fully supported in this browser.');
        }
    }

    getInitialState() {
        return {
            tabIndex: 0,
            isInitial: true,
            isLoading: false,
            isExpanded: false,
            filename: null,
            log: [],
            selectedLog: [],
            selectedSnapshots: [],
            indexedLogs: null,
            hasRtcLog: false,
        };
    }

    handleOnDrop(files) {
        const allowedTypes = [
            'text/plain',
            'application/json',
        ];
        // Allow files with .json extension even if MIME type is not detected correctly
        const fileName = files[0].name.toLowerCase();
        const isJsonFile = fileName.endsWith('.json') || fileName.endsWith('.txt');

        if (!allowedTypes.includes(files[0].type) && !isJsonFile) {
            // eslint-disable-next-line no-alert
            alert(`Error in processing ${files[0].name}: ${files[0].type} is not a supported file type.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                resetIndex(); // rebuild the index for this file
                resetSoftphoneMetrics();// rebuild the SoftPhone metric for this file

                const content = e.target.result;
                if (!content) {
                    throw new Error('File content is empty or could not be read');
                }

                // Trim any whitespace and check if content starts with valid JSON
                const trimmedContent = content.trim();
                if (!trimmedContent || (!trimmedContent.startsWith('[') && !trimmedContent.startsWith('{'))) {
                    throw new Error('File does not contain valid JSON data');
                }

                this.onLoadLog(JSON.parse(trimmedContent));
            } catch (error) {
                console.error('Error parsing file:', error);
                // eslint-disable-next-line no-alert
                alert(`Failed to load the file ${files[0].name}: ${error.message}`);
            }
        };
        reader.onloadend = () => { this.setState({ isLoading: false }); };
        reader.onerror = () => {
            this.setState({ isLoading: false });
            // eslint-disable-next-line no-alert
            alert(`Failed to read the file ${files[0].name}`);
        };

        this.setState({ isLoading: true, filename: files[0].name });
        reader.readAsText(files[0]);
    }

    handleChangeTab(event, newValue) {
        this.setState({ tabIndex: newValue });
    }

    handleExpandLogView() {
        this.setState((prevState) => ({ isExpanded: !prevState.isExpanded }));
    }

    onLoadLog(log) {
        const rearrangedLog = log
            .map((event, idx) => {
                if (!event || !event.time) {
                    console.warn('Invalid event at index', idx, event);
                    return null;
                }
                return { ...event, _oriKey: idx, _ts: new Date(event.time).getTime() };
            })
            .filter((event) => event !== null)
            .sort((a, b) => (a._ts === b._ts ? a._oriKey - b._oriKey : a._ts - b._ts))
            .map((event, idx) => findExtras(event, idx));

        if (rearrangedLog.length === 0) {
            throw new Error('No valid log entries found');
        }

        const timeRange = [rearrangedLog[0]._ts, rearrangedLog[rearrangedLog.length - 1]._ts];

        // Compute snapshots and reverse lookup map (logKey → snapshot)
        const snapshots = rearrangedLog
            .filter((event) => (event.text === 'GET_AGENT_SNAPSHOT succeeded.'))
            .flatMap((event) => event.objects.map((object, idx) => ({
                ...object.snapshot,
                _event: event,
                _key: `${event._key}-${idx}`,
                _date: object.snapshot.snapshotTimestamp.substring(0, 10),
                _time: object.snapshot.snapshotTimestamp.substring(11, 23),
                _timezone: object.snapshot.snapshotTimestamp.substring(23),
            })))
            .map((snapshot, idx, arr) => {
                const eventKeyFrom = snapshot._event._key;
                const eventKeyTo = (idx !== arr.length - 1)
                    ? arr[idx + 1]._event._key
                    : rearrangedLog[rearrangedLog.length - 1]._key;
                return {
                    ...snapshot,
                    _targetEventKeys: Array.from(
                        Array(eventKeyTo - eventKeyFrom),
                        (v, k) => (k + eventKeyFrom),
                    ),
                };
            });

        const logKeyToSnapshot = {};
        snapshots.forEach((snapshot) => {
            snapshot._targetEventKeys.forEach((key) => {
                logKeyToSnapshot[key] = snapshot;
            });
        });

        this.setState({
            isInitial: false,
            // eslint-disable-next-line react/no-unused-state
            originalLog: log.map((event, idx) => ({ ...event, _oriKey: idx })),
            log: rearrangedLog,
            snapshots,
            logKeyToSnapshot,
            selectedLog: [],
            selectedSnapshots: [],
            indexedLogs: buildIndex(),
            hasRtcMetrics: hasSoftphoneMetrics(),
            timeRange,
        });
    }

    selectLog(selectedLog) {
        this.setState({ selectedLog });
    }

    selectSnapshots(selectedSnapshots) {
        this.setState({ selectedSnapshots });
    }

    handleClickLogLine(eventKey) {
        const { logKeyToSnapshot } = this.state;
        const snapshot = logKeyToSnapshot[eventKey];
        if (snapshot) {
            this.selectLog(snapshot._targetEventKeys);
            this.selectSnapshots([snapshot._key]);
            setTimeout(() => {
                const el = document.getElementById(`snapshot-${snapshot._key}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            }, 0);
        }
    }

    render() {
        const {
            tabIndex,
            isInitial,
            isLoading,
            isExpanded,
            filename,
            log,
            snapshots,
            selectedLog,
            selectedSnapshots,
            indexedLogs,
            hasRtcMetrics,
            timeRange,
        } = this.state;
        const { classes } = this.props;

        return (
            <ThemeProvider>
                <ThemedApp
                    classes={classes}
                    tabIndex={tabIndex}
                    isInitial={isInitial}
                    isLoading={isLoading}
                    isExpanded={isExpanded}
                    filename={filename}
                    log={log}
                    snapshots={snapshots}
                    selectedLog={selectedLog}
                    selectedSnapshots={selectedSnapshots}
                    indexedLogs={indexedLogs}
                    hasRtcMetrics={hasRtcMetrics}
                    timeRange={timeRange}
                    handleChangeTab={this.handleChangeTab}
                    handleOnDrop={this.handleOnDrop}
                    handleExpandLogView={this.handleExpandLogView}
                    selectLog={this.selectLog}
                    selectSnapshots={this.selectSnapshots}
                    handleClickLogLine={this.handleClickLogLine}
                    dropzoneRef={this.dropzoneRef}
                />
            </ThemeProvider>
        );
    }
}

const ThemedApp = ({
    classes,
    tabIndex,
    isInitial,
    isLoading,
    isExpanded,
    filename,
    log,
    snapshots,
    selectedLog,
    selectedSnapshots,
    indexedLogs,
    hasRtcMetrics,
    timeRange,
    handleChangeTab,
    handleOnDrop,
    handleExpandLogView,
    selectLog,
    selectSnapshots,
    handleClickLogLine,
    dropzoneRef,
}) => {
    const { theme } = useTheme();

    const themedStyles = {
        root: {
            backgroundColor: theme.colors.background,
            minHeight: '100vh',
        },
        appbar: {
            backgroundColor: theme.colors.appBar,
        },
        tab: {
            backgroundColor: theme.colors.tabs,
        },
    };

    return (
        <NorthStarThemeProvider>
            <div className={classes.root} style={themedStyles.root}>
                <Dropzone
                    ref={dropzoneRef}
                    disableClick
                    noClick
                    onDrop={handleOnDrop}
                >
                    {
                        (
                            {
                                getRootProps, getInputProps, isDragActive, open,
                            },
                        ) => (
                            <div {...getRootProps({ onClick: (evt) => evt.preventDefault() })} style={{ outline: 'none' }}>
                                <input {...getInputProps()} />
                                <AppBar position="fixed" className={classes.appbar} style={themedStyles.appbar}>
                                    <Toolbar variant="dense">
                                        <Typography variant="h6" color="inherit" className={classes.title}>
                                            CCP Log Parser
                                            {filename && (
                                                <span>
                                                    &nbsp;:&nbsp;
                                                    {filename}
                                                </span>
                                            )}

                                        </Typography>
                                        <Typography color="inherit" className={classes.feedbackLink}>
                                            <Link
                                                href="https://github.com/amazon-connect/amazon-connect-snippets/blob/master/tools/CCPLogParser/CHANGELOG.md"
                                                target="_blank"
                                                rel="noopener"
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                Version:
                                                {' '}
                                                {pkg.version}
                                            </Link>
                                        </Typography>
                                        <Typography color="inherit" className={classes.feedbackLink}>
                                            <Link
                                                href="https://github.com/amazon-connect/amazon-connect-snippets/blob/master/tools/CCPLogParser/README.md"
                                                target="_blank"
                                                rel="noopener"
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                <DescriptionIcon className={classes.leftIcon} />
                                                User Guide
                                            </Link>
                                        </Typography>
                                        <Typography color="inherit" className={classes.feedbackLink}>
                                            <Link
                                                href="https://github.com/amazon-connect/amazon-connect-snippets/issues"
                                                target="_blank"
                                                rel="noopener"
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                <FeedbackIcon className={classes.leftIcon} />
                                                Send Feedback
                                            </Link>
                                        </Typography>
                                        <ThemeToggle classes={classes} />
                                    </Toolbar>
                                    {(!isInitial && !isLoading) && (
                                        <Tabs
                                            className={classes.tab}
                                            style={themedStyles.tab}
                                            value={tabIndex}
                                            onChange={handleChangeTab}
                                            centered
                                            aria-label="tabs"
                                        >
                                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                            <Tab label="Snapshots &amp; Logs" {...a11yProps(0)} />
                                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                            <Tab label="Metrics" {...a11yProps(1)} />
                                        </Tabs>
                                    )}
                                </AppBar>

                                {isDragActive && <DraggingView />}

                                {(isInitial && !isLoading) && <EmptyView onClick={open} />}
                                {isLoading && <LoadingView />}
                                {(!isInitial && !isLoading) && (
                                    <>
                                        <TabPanel value={tabIndex} index={0}>
                                            <Container maxWidth={false} className={classes.content}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={3} style={isExpanded ? { display: 'none' } : {}} className={classes.scrollableContainer}>
                                                        <SnapshotListView
                                                            log={log}
                                                            snapshots={snapshots}
                                                            selected={selectedSnapshots}
                                                            selectLog={selectLog}
                                                            selectSnapshots={selectSnapshots}
                                                        />
                                                    </Grid>
                                                    <Grid
                                                        item
                                                        xs={12}
                                                        md={9}
                                                        style={isExpanded ? { minWidth: '100%', maxWidth: '100%' } : {}}
                                                        className={classes.scrollableContainer}
                                                    >
                                                        <LogView
                                                            log={log}
                                                            selected={selectedLog}
                                                            isExpanded={isExpanded}
                                                            expand={handleExpandLogView}
                                                            onClickLogLine={handleClickLogLine}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Container>
                                        </TabPanel>
                                        <TabPanel value={tabIndex} index={1}>
                                            <Container maxWidth={false} className={classes.content}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <ThemedMetricsView
                                                            log={log}
                                                            indexedLogs={indexedLogs}
                                                        />
                                                        {hasRtcMetrics && (
                                                            <RtcMetricsViewGroup
                                                                timeRange={timeRange}
                                                            />
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </Container>
                                        </TabPanel>
                                    </>
                                )}
                            </div>
                        )
                    }
                </Dropzone>
            </div>
        </NorthStarThemeProvider>
    );
};

ThemedApp.propTypes = {
    classes: PropTypes.object.isRequired,
    tabIndex: PropTypes.number.isRequired,
    isInitial: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    filename: PropTypes.string,
    log: PropTypes.array.isRequired,
    snapshots: PropTypes.array,
    selectedLog: PropTypes.array.isRequired,
    selectedSnapshots: PropTypes.array.isRequired,
    indexedLogs: PropTypes.object,
    hasRtcMetrics: PropTypes.bool,
    timeRange: PropTypes.array,
    handleChangeTab: PropTypes.func.isRequired,
    handleOnDrop: PropTypes.func.isRequired,
    handleExpandLogView: PropTypes.func.isRequired,
    selectLog: PropTypes.func.isRequired,
    selectSnapshots: PropTypes.func.isRequired,
    handleClickLogLine: PropTypes.func.isRequired,
    dropzoneRef: PropTypes.object.isRequired,
};

ThemedApp.defaultProps = {
    filename: null,
    snapshots: [],
    indexedLogs: null,
    hasRtcMetrics: false,
    timeRange: null,
};

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
