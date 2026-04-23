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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { useTheme } from './ThemeContext';

const styles = (theme) => ({
    root: {
        position: 'sticky',
        top: 0,
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
        position: 'relative',
        overflow: 'auto',
        padding: 0,
        maxHeight: 'calc(100vh - 200px)',
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

        // Find the first visible log entry in the target range
        const firstVisibleKey = snapshot._targetEventKeys.find((key) => {
            const element = document.getElementById(`L${key}`);
            return element !== null;
        });

        if (firstVisibleKey) {
            const element = document.getElementById(`L${firstVisibleKey}`);
            if (element) {
                element.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }
    }

    render() {
        const {
            classes, className: classNameProp, snapshots = [], selected = [],
        } = this.props;

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
            <ThemedSnapshotListView
                classes={classes}
                className={classNameProp}
                snapshotsByDate={snapshotsByDate}
                selected={selected}
                handleClickSnapshot={(e, snapshot) => this.handleClickSnapshot(e, snapshot)}
            />
        );
    }
}

const ThemedSnapshotListView = ({
    classes,
    className: classNameProp,
    snapshotsByDate,
    selected,
    handleClickSnapshot,
}) => {
    const { theme } = useTheme();

    const themedStyles = {
        list: {
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
        },
        subheader: {
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
        },
    };

    return (
        <div className={clsx(classes.root, classNameProp)}>
            <Container
                title="Snapshots"
                gutters={false}
            >
                <div className={classes.content}>
                    <List className={classes.list} style={themedStyles.list} subheader={<li />}>
                        {Object.keys(snapshotsByDate).map((date) => (
                            <li key={`section-${date}`} className={classes.listSection}>
                                <ul className={classes.ul}>
                                    <ListSubheader style={themedStyles.subheader}>{date}</ListSubheader>
                                    {snapshotsByDate[date].map((snapshot) => (
                                        <ListItem
                                            button
                                            key={`item-${snapshot._key}`}
                                            id={`snapshot-${snapshot._key}`}
                                            className={clsx(classes.item)}
                                            style={{
                                                background: selected.includes(snapshot._key) ? theme.colors.selected : 'transparent',
                                                color: theme.colors.textPrimary,
                                            }}
                                            // eslint-disable-next-line max-len
                                            onClick={(e) => handleClickSnapshot(e, snapshot)}
                                        >
                                            <ListItemText primary={`${snapshot._time}${snapshot._timezone} ${snapshot.state.name}`} />
                                        </ListItem>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </List>
                </div>
            </Container>
        </div>
    );
};

ThemedSnapshotListView.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    snapshotsByDate: PropTypes.object.isRequired,
    selected: PropTypes.array.isRequired,
    handleClickSnapshot: PropTypes.func.isRequired,
};

ThemedSnapshotListView.defaultProps = {
    className: '',
};

SnapshotListView.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    log: PropTypes.array.isRequired,
    snapshots: PropTypes.array,
    selected: PropTypes.array,
    selectLog: PropTypes.func.isRequired,
    selectSnapshots: PropTypes.func.isRequired,
};
SnapshotListView.defaultProps = {
    className: '',
    snapshots: [],
    selected: [],
};

export default withStyles(styles)(SnapshotListView);
