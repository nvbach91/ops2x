var config = {
    //host: 'http://localhost:7000',
    //mongodb_host: 'mongodb://127.0.0.1/testx',
    
    // when deploying to a new host you must change the host field
    // as well as the mongo uri
    
    host: 'http://kouzelnakasa.cz',
    mongodb_host: 'mongodb://127.0.0.1:27017/dev',    
    
    companyName: 'Ethereal',
    // when changing mail service, follow the EAUTH instructions from the service provider
    mail_transport: {
        service: 'Gmail',
        auth: {
            // this should be changed, create your own gmail account then enable less secure apps on that account
            user: 'etherealcz@gmail.com',
            pass: 'ttrello2015'
        }
    }
};

module.exports = config;
