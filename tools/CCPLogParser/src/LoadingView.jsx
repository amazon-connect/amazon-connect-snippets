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
import Typography from '@material-ui/core/Typography';
import AutorenewIcon from '@material-ui/icons/Autorenew';

const styles = (theme) => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: theme.spacing(6),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        width: 600,
        height: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 160,
        color: 'rgba(0,0,0,0.25)',
    },
    text: {
        color: 'rgba(0,0,0,0.5)',
    },
});

const LoadingView = (props) => {
    const { classes } = props;

    return (
        <div className={classes.root}>
            <div className={classes.container}>
                <AutorenewIcon className={`${classes.icon} rotating-icon`} />
                <Typography className={classes.text} variant="h5" component="h3">
                    Loading...
                </Typography>
            </div>
        </div>
    );
};

LoadingView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoadingView);
