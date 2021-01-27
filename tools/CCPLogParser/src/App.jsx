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
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import DescriptionIcon from '@material-ui/icons/Description';
import FeedbackIcon from '@material-ui/icons/Feedback';
import './App.css';
import pkg from '../package.json';
import EmptyView from './EmptyView';
import DraggingView from './DraggingView';
import LoadingView from './LoadingView';
import SnapshotListView from './SnapshotListView';
import LogView from './LogView';
import MetricsView from './MetricsView';

import {
    buildIndex, findExtras, resetIndex, resetSoftphoneMetrics,
} from './utils/findExtras';

const styles = (theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
    },
    appbar: {
        backgroundColor: '#26303b',
    },
    title: {
        flexGrow: 1,
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
    content: {
        zIndex: 2,
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    rightIcon: {
        marginLeft: theme.spacing(1),
    },
});

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.selectLog = this.selectLog.bind(this);
        this.selectSnapshots = this.selectSnapshots.bind(this);
        this.handleOnDrop = this.handleOnDrop.bind(this);
        this.handleExpandLogView = this.handleExpandLogView.bind(this);
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
        if (!allowedTypes.includes(files[0].type)) {
            // eslint-disable-next-line no-alert
            alert(`Error in processing ${files[0].name}: ${files[0].type} is not a supported file type.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                resetIndex(); // rebuild the index for this file
                resetSoftphoneMetrics();// rebuild the SoftPhone metric for this file
                this.onLoadLog(JSON.parse(e.target.result));
                // check if the webRTC log is present:>
                // this.setState({ hasRtcLog: hasSoftphoneMetrics() });
                // console.log(buildIndex());
            } catch (error) {
                // eslint-disable-next-line no-alert
                alert(`I failed to load the file ${files[0].name}: ${error}`);
            }
        };
        reader.onloadend = () => { this.setState({ isLoading: false }); };

        this.setState({ isLoading: true, filename: files[0].name });
        reader.readAsText(files[0]);
    }

    handleExpandLogView() {
        this.setState((prevState) => ({ isExpanded: !prevState.isExpanded }));
    }

    onLoadLog(log) {
        this.setState({
            isInitial: false,
            // eslint-disable-next-line react/no-unused-state
            originalLog: log.map((event, idx) => ({ ...event, _oriKey: idx })),
            log: log
                .map((event, idx) => (
                    { ...event, _oriKey: idx, _ts: new Date(event.time).getTime() }
                ))
                .sort((a, b) => (a._ts === b._ts ? a._oriKey - b._oriKey : a._ts - b._ts))
                .map((event, idx) => findExtras(event, idx)),
            selectedLog: [],
            selectedSnapshots: [],
            indexedLogs: buildIndex(),
        });
    }

    selectLog(selectedLog) {
        this.setState({ selectedLog });
    }

    selectSnapshots(selectedSnapshots) {
        this.setState({ selectedSnapshots });
    }

    render() {
        const {
            isInitial,
            isLoading,
            isExpanded,
            filename,
            log,
            selectedLog,
            selectedSnapshots,
            indexedLogs,
        } = this.state;
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Dropzone
                    ref={this.dropzoneRef}
                    disableClick
                    noClick
                    onDrop={this.handleOnDrop}
                >
                    {({ getRootProps, isDragActive }) => (
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        <div {...getRootProps()}>
                            <AppBar position="static" className={classes.appbar}>
                                <Toolbar variant="dense">
                                    <Typography variant="h6" color="inherit" className={classes.title}>
                                        CCP Log Parser
                                        { filename && (
                                            <span>
                    &nbsp;:&nbsp;
                                                {filename}
                                            </span>
                                        ) }
                                    </Typography>
                                    <Typography color="inherit" className={classes.feedbackLink}>
                                        <Link
                                            href="https://github.com/amazon-connect/amazon-connect-snippets/blob/master/tools/CCPLogParser/CHANGELOG.md"
                                            target="_blank"
                                            rel="noopener"
                                            onClick={(e) => e.preventDefault}
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
                                            onClick={(e) => e.preventDefault}
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
                                            onClick={(e) => e.preventDefault}
                                        >
                                            <FeedbackIcon className={classes.leftIcon} />
                                            Send Feedback
                                        </Link>
                                    </Typography>
                                </Toolbar>
                            </AppBar>

                            { isDragActive && <DraggingView /> }

                            { (isInitial && !isLoading) && <EmptyView /> }
                            { isLoading && <LoadingView /> }
                            { (!isInitial && !isLoading) && (
                                <Container className={classes.content}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <MetricsView
                                                log={log}
                                                indexedLogs={indexedLogs}
                                            />
                                        </Grid>
                                        {/* { hasRtcLog && (
                            <Grid item xs={12}>
                            <RtcMetricsView log={log} />
                            </Grid>
                        )} */}
                                    </Grid>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={3} style={isExpanded ? { display: 'none' } : {}}>
                                            <SnapshotListView
                                                log={log}
                                                selected={selectedSnapshots}
                                                selectLog={this.selectLog}
                                                selectSnapshots={this.selectSnapshots}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={9} style={isExpanded ? { minWidth: '100%', maxWidth: '100%' } : {}}>
                                            <LogView
                                                log={log}
                                                selected={selectedLog}
                                                isExpanded={isExpanded}
                                                expand={this.handleExpandLogView}
                                            />
                                        </Grid>
                                    </Grid>
                                </Container>
                            ) }
                        </div>
                    )}
                </Dropzone>
            </div>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
