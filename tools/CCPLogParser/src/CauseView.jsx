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

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import HelpIcon from '@material-ui/icons/Help';
import { green } from '@material-ui/core/colors';
import parse from 'html-react-parser';

class CauseView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            isOpen: false,
        };
    }

    handleClickOpen() {
        this.setState({ isOpen: true });
    }

    handleClickClose() {
        this.setState({ isOpen: false });
    }

    render() {
        const { message, cause } = this.props;
        const { isOpen } = this.state;

        return (
            <span>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid  */}
                <Link color="inherit" onClick={() => this.handleClickOpen()}>
                    <HelpIcon style={{ fontSize: 18, color: green[500], verticalAlign: 'middle' }} />
                    {message}
                </Link>
                <Dialog
                    open={isOpen}
                    onClose={() => this.handleClickClose()}
                    fullWidth
                    maxWidth="lg"
                >
                    <DialogTitle>{ message }</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            { parse(cause) }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.handleClickClose()} color="primary" autoFocus>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </span>
        );
    }
}

CauseView.propTypes = {
    message: PropTypes.string,
    cause: PropTypes.string,
};

CauseView.defaultProps = {
    message: '',
    cause: '',
};

export default CauseView;
