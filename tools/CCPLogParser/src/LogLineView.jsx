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
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import ReactJson from 'react-json-view';

import Messages from './utils/Messages';
import CauseView from './CauseView';

const styles = (theme) => ({
    root: {},
    line: {
        display: 'flex',
        flexDirection: 'row',
        padding: theme.spacing(0, 2, 0, 0),
        '&:hover': {
            background: 'rgba(0,0,0,0.1)',
        },
        '&$error': {
            color: 'red',
            fontWeight: 'bold',
        },
        '&$warn': {
            color: '#ca9106',
            fontWeight: 'bold',
        },
        '&$info': {
            color: '#005eda',
        },
        '&$trace': {
            color: '#616161',
        },
        '&$debug': {
            color: 'inherit',
        },
        '&$log': {
            color: '#616161',
        },
        '&$selected': {
            background: 'rgba(255,255,0,0.3)',
        },
    },
    moreInfoToggle: {
        width: theme.spacing(2),
        textAlign: 'center',
        '&:hover': {
            '&$closed': {
                '&::after': {
                    content: '"+"',
                },
            },
        },
        '&$notExists': {},
        '&$exists': {
            '&$closed': {
                '&::after': {
                    content: '"+"',
                },
            },
        },
        '&$open': {
            '&::after': {
                content: '"-"',
            },
        },
    },
    component: {},
    timestamp: {},
    level: {},
    text: {},
    moreInfo: {
        background: '#f5f5f588',
        boxShadow: 'inset 0px 10px 16px -10px #0000001a, inset 0px -10px 16px -10px #0000001a',
        padding: theme.spacing(2, 1),
        fontSize: 14,
        zoom: 0.9,
    },
    error: {},
    warn: {},
    info: {},
    trace: {},
    debug: {},
    log: {},
    selected: {},
    exists: {},
    notExists: {},
    open: {},
    closed: {},
});

class LogLineView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            isMoreInfoOpen: false,
            isMessageContained: false,
            cause: '',
            isStreamOpen: false,
        };
    }

    componentDidMount() {
        const { event } = this.props;
        let i = Messages.length;
        while (i > 0) {
            i -= 1;
            if (event.text.indexOf(Messages[i].message) !== -1) {
                this.setState({ isMessageContained: true, cause: Messages[i].cause });
                break;
            }
        }
    }

    toggleMoreInfo() {
        this.setState((prevState) => ({ isMoreInfoOpen: !prevState.isMoreInfoOpen }));
    }

    render() {
        const {
            classes, className: classNameProp, event, isSelected = false, ...props
        } = this.props;
        const { isMoreInfoOpen, isMessageContained, cause } = this.state;

        const hasMoreInfo = event.exception || event.objects.length > 0;

        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div className={clsx(classes.root, classNameProp)} {...props}>

                <div className={clsx(classes.line, {
                    [classes.selected]: isSelected,
                    [classes.error]: event.level === 'ERROR',
                    [classes.warn]: event.level === 'WARN',
                    [classes.info]: event.level === 'INFO',
                    [classes.trace]: event.level === 'TRACE',
                    [classes.debug]: event.level === 'DEBUG',
                    [classes.log]: event.level === 'LOG',
                })}
                >
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <div
                        className={clsx(classes.moreInfoToggle, {
                            [classes.exists]: hasMoreInfo,
                            [classes.notExists]: !hasMoreInfo,
                            [classes.open]: isMoreInfoOpen,
                            [classes.closed]: !isMoreInfoOpen,
                        })}
                        onClick={() => this.toggleMoreInfo()}
                        onKeyPress={() => this.toggleMoreInfo()}
                        role="button"
                        tabIndex="0"
                    />
                    <div style={{ display: 'inline' }}>
                        <span className={classes.timestamp}>{event.time}</span>
            &nbsp;
                        <span className={classes.component}>{event.component}</span>
            &nbsp;
                        <span className={classes.level}>{event.level}</span>
            &nbsp;
                        <span className={classes.text}>
                            { isMessageContained
                                ? <CauseView message={event.text} cause={cause} /> : event.text}
                        </span>
                    </div>
                </div>

                { isMoreInfoOpen
                && (
                    <div className={clsx(classes.moreInfo)}>
                        <ReactJson
                            src={event}
                            name={false}
                            displayObjectSize={false}
                            displayDataTypes={false}
                        />
                    </div>
                )}

            </div>
        );
    }
}

LogLineView.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    event: PropTypes.object.isRequired,
    isSelected: PropTypes.bool,
};
LogLineView.defaultProps = {
    className: '',
    isSelected: false,
};

export default withStyles(styles)(LogLineView);
