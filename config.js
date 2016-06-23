var config = {
    //host: 'http://localhost:7000',
    //mongodb_host: 'mongodb://127.0.0.1/testx',
    
    // when deploying to a new host you must change the host field
    // as well as the mongo uri
    
    host: 'https://ops2x-62687.onmodulus.net',
    mongodb_host: 'mongodb://127.0.0.1:27017/dev',    
    
    companyName: 'EnterpriseApps',
    // when changing mail service, follow the EAUTH instructions from the service provider
    mail_transport: {
        service: 'Gmail',
        auth: {
            // this should be changed, create your own gmail account then enable less secure apps on that account
            user: 'info.enterpriseapps@gmail.com',
            pass: ''
        }
    }
};

module.exports = config;
