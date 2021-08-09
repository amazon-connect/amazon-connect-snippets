import React from 'react';
import { IMyCognitoUser } from '../../App';

import Text from 'aws-northstar/components/Text';

interface Props {
    user: IMyCognitoUser
};

const UserAttributes = (props: Props) => {
    
    return (
        <div> 
            <Text variant='p'>username: {props.user.username}</Text>
            <Text variant='p'>isAuthenticated: {props.user.isAuthenticated.toString()}</Text>
        </div>
    );
};

export default UserAttributes;