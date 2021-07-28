import React, { Component } from 'react';
import Logger from '../../util/logger/logger';
import { API } from "aws-amplify";
import { IMyCognitoUser } from '../../App';
import config from '../../config';

import Text from 'aws-northstar/components/Text';

interface Props {
    user: IMyCognitoUser
};

interface State { data: string };

class MockApi extends Component<Props, State> {
    private readonly _name = 'MockApi';
    private readonly _logger = Logger.getInstance().getLogger();
    

    constructor(props: Props) {
        super(props);
        this._logger.debug(this._name + ': constructor');
        
        this.state = {data: 'NotSet'};
    }

    render() {
        this._logger.debug(this._name + ': render');
        
        return (
            <div> 
                <Text variant='p'>agentDesktopMockApi response: {this.state.data}</Text>
            </div> 
        );
    }
    
    async componentDidMount() {
        this._logger.debug(this._name + ': componentDidMount');
        
        try{
            const apiName = 'agentDesktopMockApi';
            const path = config.apiGateway.mockPath; 
            const data =  {
                headers: { 
                    Authorization: `Bearer ${this.props.user.jwtToken}`,
                },
            };
            
            const response = await API.get(apiName, path, data);
            
            this.setState({
                data: JSON.stringify(response)
            });
        } catch (error) {
            this.setState({
                data: JSON.stringify(error)
            });
        }
    }
}

export default MockApi;
