// https://github.com/amazon-connect/amazon-connect-streams/blob/master/Documentation.md
// https://github.com/amazon-connect/amazon-connect-streams/blob/491dfacb2f901c64ae06bc27fe2dcc8fd39ae4e5/cheat-sheet.md

import React, { Component } from 'react';
import Logger from '../../util/logger/logger';
import config from '../../config';
import "amazon-connect-streams"; //npm install amazon-connect-streams, npm install @types/amazon-connect-streams
// import sleep from 'sleep-promise'; //npm install sleep-promise

import Heading from 'aws-northstar/components/Heading';

interface Props { };

interface State { };

class Ccp extends Component<Props, State> {
    private readonly _name = 'Cpp';
    private readonly _logger = Logger.getInstance().getLogger();
    private readonly _ccpContainer: React.RefObject<HTMLIFrameElement> = React.createRef();
    
    private _contact: connect.Contact | null = null;
    private _agent: connect.Agent | null = null;

    constructor(props: Props) {
        super(props);
        this._logger.debug(this._name + ': constructor');
    }

    render() {
        this._logger.debug(this._name + ': render');
        
        return (
            <div> 
                <Heading variant='h1'>Custom Contact Control Panel</Heading>
                <div ref={this._ccpContainer} style={{ width: '400px', height: '600px', display: 'block' }} /> 
            </div> 
        );
    }
    
    async componentDidMount() {
        this._logger.debug(this._name + ': componentDidMount');

        const container = this._ccpContainer.current;
        if (container) {
            connect.core.initCCP(container, {
                ccpUrl: `${config.connectLoginURL}/connect/ccp-v2/`,
                loginUrl: config.azureAD.ccpUserAccessURL,
                loginPopup: true,
                loginPopupAutoClose: true,
                loginOptions: {
                    autoClose: true
                },
                softphone: {
                    allowFramedSoftphone: true
                }
            });
        } else {
            throw new Error('ccpContainer is null.  This should never happen');
        }
        
        connect.core.onAuthFail( () => {
            throw new Error('Connect onAuthFail occurred.  This should never happen');
        });
        connect.core.onAccessDenied( () => {
            throw new Error('Connect onAccessDenied occurred.  This should never happen');
        });
        
        connect.agent(this.agentHandler);
        connect.contact(this.contactHandler);
    }
    
    agentHandler = (agent: connect.Agent) => {
        this._logger.debug(this._name + ': agentHandler');
        this._agent = agent;
        // Set up any handlers
        
        // Set Agent to Available
        const avail = agent.getAgentStates().filter(function (state) {
                return state.type === connect.AgentStateType.ROUTABLE;
            }
        )[0];

        agent.setState(avail, {
            success: () => {
                this._logger.debug(this._name + ': agentHandler -> Changed agent to Available state');
            },
            failure: () => {
                throw new Error('Failed to change agent to Available state.  This should never happen');
            }
        });
    };
    
    contactHandler = (contact: connect.Contact) => {
        this._logger.debug(this._name + ': contactHandler');
        this._contact = contact;
        // Set up any handlers
    };
    
    // This is called from the parent because it does a url redirect so the Parent needs to complete the logout first
    logout = async () => {
        this._logger.debug(this._name + ': logout');
        
        if (this._contact) {
            const initialConnection = this._contact.getInitialConnection();
            if (initialConnection) {
                this._logger.debug(this._name + ': logout -> initialConnection.destroy');
                initialConnection.destroy();
                // await sleep(1000);
            }
            
            const thirdParty = this._contact.getSingleActiveThirdPartyConnection();
            if (thirdParty) {
                this._logger.debug(this._name + ': logout -> thirdParty.destroy');
                thirdParty.destroy();
                // await sleep(1000);
            }
        }else{
            this._logger.debug(this._name + ': logout -> Contact is null');
        }
        
        if (this._agent){
            const offlineState = this._agent.getAgentStates().filter( (state) => { 
                return state.type === connect.AgentStateType.OFFLINE; 
            })[0];
            
            this._agent.setState(offlineState, {
                success: () => {
                    this._logger.debug(this._name + ': logout -> Changed agent to Offline state');
                    
                    window.location.replace(`${config.connectLoginURL}/connect/logout`);
                },
                failure: () => {
                    throw new Error('Failed to change agent to Offline state.  This should never happen');
                }
            });
        } else {
            throw new Error('Agent is null.  This should never happen');
        }
    };
}

export default Ccp;
