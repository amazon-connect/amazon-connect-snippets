import React from 'react';
import ReactDOM from 'react-dom';
import Amplify from 'aws-amplify';
import config from './config';
import App from './App';
import reportWebVitals from './reportWebVitals';

Amplify.configure({
    Auth: {
        region: config.cognito.region,
        userPoolId: config.cognito.userPoolId,
        userPoolWebClientId: config.cognito.clientId,
        authenticationFlowType: 'USER_PASSWORD_AUTH',
        oauth: {
            domain: config.cognito.domain,
            scope: ['email', 'openid', 'aws.cognito.signin.user.admin'],
            redirectSignIn: config.cognito.redirectUrl,
            redirectSignOut: config.cognito.redirectUrl,
            responseType: 'code'
        }
    },
    API: {
        endpoints: [
            {
                name: 'agentDesktopMockApi',
                endpoint: config.apiGateway.mockEndpoint,
            },
        ],
    },
});

const app = (
  <React.StrictMode>
      <App />
  </React.StrictMode>
);

ReactDOM.render(app, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);