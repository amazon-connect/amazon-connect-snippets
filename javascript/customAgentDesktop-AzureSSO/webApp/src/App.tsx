import React, { Component } from 'react';
import { Auth, Hub } from 'aws-amplify';
import Logger from './util/logger/logger'; 
import OAuthButton from './components/OAuthButton/OAuthButton';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Ccp from './components/Ccp/Ccp';
import UserAttributes from './components/UserAttributes/UserAttributes';
import MockApi from './components/MockApi/MockApi';

// https://northstar.aws-prototyping.cloud/#/About%20NorthStar
import NorthStarThemeProvider from 'aws-northstar/components/NorthStarThemeProvider';   //npm install aws-northstar
import Container from 'aws-northstar/layouts/Container';
import Stack from 'aws-northstar/layouts/Stack';
import Button from 'aws-northstar/components/Button';
import Text from 'aws-northstar/components/Text';

//CognitoUser type is broken: https://github.com/aws-amplify/amplify-js/issues/4927
export interface IMyCognitoUser {
    isAuthenticated: boolean
    username: string
    jwtToken: string
};

interface Props { };

interface State {
    isLoaded: boolean
    user: IMyCognitoUser
};

class App extends Component<Props, State> {
    private readonly _name = 'App';
    private readonly _logger = Logger.getInstance().getLogger();
    private readonly _unauthenticatedUser: IMyCognitoUser = {
        isAuthenticated: false,
        username: '',
        jwtToken: ''
    };
    
    private readonly _ccpRef = React.createRef<Ccp>();
  
    constructor(props: Props) {
        super(props);
        this._logger.debug(this._name + ': constructor');
        
        this.state = { 
            isLoaded: false,
            user: this._unauthenticatedUser
        };
    }
    
    render() {
        this._logger.debug(this._name + ': render');
        
        let control =  <Text variant='p'>Loading...</Text>;
        if (this.state.isLoaded){
            if (this.state.user.isAuthenticated){
                control = ( 
                    <Container> 
                        <Stack>
                            <Ccp ref={this._ccpRef} /> 
                            <UserAttributes user={this.state.user} /> 
                            <MockApi user={this.state.user} />
                            <Button variant="primary" onClick={ async () => await this.signOut() }>Logout</Button>
                        </Stack>
                    </Container>
                );
            } else {
                control = <OAuthButton />;
            }
        }
        
        return (
            <div className="App"> 
                <ErrorBoundary> 
                    <NorthStarThemeProvider>
                        {control} 
                    </NorthStarThemeProvider>
                </ErrorBoundary>
            </div>
        );
    }
    
    async componentDidMount() {
        this._logger.debug(this._name + ': componentDidMount');
        
        let myCognitoUser = this._unauthenticatedUser;
        try {
            const user = await Auth.currentAuthenticatedUser();
            myCognitoUser = {
                isAuthenticated: true,
                username: user.username,
                jwtToken: user.signInUserSession.idToken.jwtToken
            };
        } catch {
            // currentAuthenticatedUser throws an Error if not signed in so do nothing since myCognitoUser is already set
        } finally {
            this.setState({ 
                isLoaded: true,
                user: myCognitoUser
            });
        }
        
        Hub.listen("auth", async (data) => {
            this._logger.debug(this._name + `: Auth listen ${data.payload.event}`);
            
            switch (data.payload.event) {
                case "oAuthSignOut":
                    if (this._ccpRef.current){
                        // Finished Signing out of main app so let's logout of the Ccp 
                        await this._ccpRef.current.logout();
                    } else {
                        throw new Error ('_ccpRef is null.  This should never happen');
                    }
                    break;
                default:
                    //Do nothing
                }
            }
        );
    }
    
    signOut = async () => {
        this._logger.debug(this._name + ': signOut');
        
        try {
            await Auth.signOut({ global: true });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`signOut error: ${error.message}`);
            } else {
                throw(error);
            }
        } 
    }
}

export default App;