const config = {
    cognito:{
        region: 'us-east-1',
        userPoolId: 'us-east-1_OwadPXXXX',
        clientId: '54usqnrbc683fc2c9sdklqXXXX',
        domain: 'agentdesktop-8c6179f0-d2c9-11eb-af16-0e1cfc6fXXXX.auth.us-east-1.amazoncognito.com',
        redirectUrl: 'https://XXXXfmbyerk6sh.cloudfront.net',
    },
    connectLoginURL: 'https://XXXXtdesktop01.my.connect.aws',
    azureAD: {
        ccpUserAccessURL: 'https://myapps.microsoft.com/signin/XXXX/843630a8-f207-4423-b3c4-0cd8709aXXXX?tenantId=a75907d1-9c17-435c-9f57-6793426dXXXX',
        customAgentDesktopUserAccessURL: 'https://myapps.microsoft.com/signin/XXXX/ec52ba9f-92ef-473f-85b2-3f73d4d0XXXX?tenantId=a75907d1-9c17-435c-9f57-6793426dXXXX'
    },
    apiGateway: {
        mockEndpoint: 'https://XXXXev2o7.execute-api.us-east-1.amazonaws.com',
        mockPath: '/dev/mock'
    }
};


export default config;