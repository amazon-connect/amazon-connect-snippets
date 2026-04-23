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
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { useTheme } from './ThemeContext';

const styles = (theme) => ({
    root: {
        position: 'fixed',
        top: theme.spacing(6),
        left: 0,
        right: 0,
        bottom: 0,
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
    },
    text: {},
});

const EmptyView = (props) => {
    const { classes, onClick } = props;

    return (
        <ThemedEmptyView classes={classes} onClick={onClick} />
    );
};

const ThemedEmptyView = ({ classes, onClick }) => {
    const { theme } = useTheme();

    return (
        <div className={classes.root} style={{ backgroundColor: theme.colors.background }}>
            <div className={classes.container}>
                <SaveAltIcon className={classes.icon} style={{ color: theme.colors.iconSecondary }} />
                <Typography className={classes.text} variant="h5" component="h3" style={{ color: theme.colors.textMuted }}>
                    Drag &amp; Drop your CCP log file to load
                </Typography>
                <Button variant="contained" color="primary" onClick={onClick} style={{ marginTop: 16 }}>
                    Select File
                </Button>
            </div>
        </div>
    );
};

ThemedEmptyView.propTypes = {
    classes: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

EmptyView.propTypes = {
    classes: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(EmptyView);
