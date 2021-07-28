import React from 'react';
import { withOAuth } from 'aws-amplify-react';
import config from '../../config';
import Button from 'aws-northstar/components/Button';

const OAuthButton = () => {
    return (
        <div>
            <Button variant="primary" onClick={handleClick}>Log in using your O365 credentials</Button>
        </div>
    );
};

const handleClick = () => {
    window.location.assign(config.azureAD.customAgentDesktopUserAccessURL);
}

export default withOAuth(OAuthButton);
