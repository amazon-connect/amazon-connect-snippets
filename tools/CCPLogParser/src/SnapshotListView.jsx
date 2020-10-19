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
import { scroller } from 'react-scroll';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

const styles = (theme) => ({
    root: {
        position: 'sticky',
        top: theme.spacing(2),
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
    title: {
        flexGrow: 1,
        display: 'block',
    },
    content: {
        padding: theme.spacing(0, 0),
    },
    list: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',
        padding: 0,
        maxHeight: `calc(100vh - ${theme.spacing(10)}px)`,
    },
    listSection: {
        backgroundColor: 'inherit',
    },
    ul: {
        backgroundColor: 'inherit',
        padding: 0,
    },
    item: {
        padding: theme.spacing(0.5, 2),
        display: 'block',
    },
    selected: {
        background: 'rgba(255,255,0,0.3)',
    },
});

class SnapshotListView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            selected: [],
        };
    }

    handleClickSnapshot(e, snapshot) {
        e.preventDefault();

        const { selectLog, selectSnapshots } = this.props;
        selectLog(snapshot._targetEventKeys);
        selectSnapshots([snapshot._key]);

        const anchor = `L${snapshot._targetEventKeys[0]}`;
        scroller.scrollTo(anchor, {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart',
        });
    }

    render() {
        const {
            classes, className: classNameProp, log, selected = [],
        } = this.props;

        const snapshots = log
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
                // eslint-disable-next-line max-len
                const eventKeyTo = (idx !== arr.length - 1) ? arr[idx + 1]._event._key : log[log.length - 1]._key;
                return {
                    ...snapshot,
                    // eslint-disable-next-line max-len
                    _targetEventKeys: Array.from(Array(eventKeyTo - eventKeyFrom), (v, k) => (k + eventKeyFrom)),
                };
            });

        const snapshotsByDate = snapshots
            .reduce((acc, snapshot) => {
                const date = snapshot._date;
                if (date in acc) {
                    acc[date].push(snapshot);
                } else {
                    acc[date] = [snapshot];
                }
                return acc;
            }, {});

        return (
            <div className={clsx(classes.root, classNameProp)}>
                <Paper style={{ height: '100%' }}>
                    <div className={classes.header}>
                        <div className={classes.headerInside}>
                            <Typography className={classes.title} variant="h6" component="h3">
                                Snapshots
                            </Typography>
                        </div>
                    </div>
                    <div className={classes.content}>
                        <List className={classes.list} subheader={<li />}>
                            {Object.keys(snapshotsByDate).map((date) => (
                                <li key={`section-${date}`} className={classes.listSection}>
                                    <ul className={classes.ul}>
                                        <ListSubheader>{date}</ListSubheader>
                                        {snapshotsByDate[date].map((snapshot) => (
                                            <ListItem
                                                button
                                                key={`item-${snapshot._key}`}
                                                className={clsx(classes.item, {
                                                    // eslint-disable-next-line max-len
                                                    [classes.selected]: selected.includes(snapshot._key),
                                                })}
                                                // eslint-disable-next-line max-len
                                                onClick={(e) => this.handleClickSnapshot(e, snapshot)}
                                            >
                                                <ListItemText primary={`${snapshot._time}${snapshot._timezone} ${snapshot.state.name}`} />
                                            </ListItem>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </List>
                    </div>
                </Paper>
            </div>
        );
    }
}

SnapshotListView.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    log: PropTypes.array.isRequired,
    selected: PropTypes.array,
    selectLog: PropTypes.func.isRequired,
    selectSnapshots: PropTypes.func.isRequired,
};
SnapshotListView.defaultProps = {
    className: '',
    selected: [],
};

export default withStyles(styles)(SnapshotListView);
