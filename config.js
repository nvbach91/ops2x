var config = {
    //host: 'http://localhost:7000',
    //mongodb_host: 'mongodb://127.0.0.1/testx',
    
    // when deploying to a new host you must change the host field
    // as well as the mongo uri
    
    host: 'https://ops2x-62687.onmodulus.net',
    mongodb_host: 'mongodb://suchuser:suchpass@waffle.modulusmongo.net:27017/rywopO4x',

    companyName: 'EnterpriseApps',
    // when changing mail service, follow the EAUTH instructions from the service provider
    mail_transport: {
        service: 'Gmail',
        auth: {
            // this should be changed, create your own gmail account then enable less secure apps on that account
            user: 'info.enterpriseapps@gmail.com',
            pass: 'trello2015'
        }
    },
    generateSignupMail: function (recipient, key) {
        return {
            from: '"' + config.companyName + '" <' + config.mail_transport.auth.user + '>',
            to: recipient,
            subject: 'Sign Up - Online Point of Sale System',
            text: 'Hello,\n\nyou have recently registered an account on Online Point of Sale System.\n'
                    + 'Please visit the following link to complete your registration.\n\n'
                    + config.host + '/activate?key=' + key
                    + '\n\nBest regards,\nOnline Point of Sale System Team',
            html: '<p>Hello,<br><br>you have recently registered an account on Online Point of Sale System.<br>'
                    + 'Please visit the following link to complete your registration.<br><br>'
                    + '<a href="' + config.host + "/activate?key=" + key + '">' + config.host + '/activate?key=' + key + '</a>'
                    + '<br><br>Best regards,<br>Online Point of Sale System Team</p>'
        };
    },
    generateForgotMail: function (recipient, key, token) {
        return {
            from: '"' + config.companyName + '" <' + config.mail_transport.auth.user + '>',
            to: recipient,
            subject: 'Password Reset - Online Point of Sale System',
            text: 'Hello,\n\nyou have recently requested for a password reset.\n'
                    + 'Please visit the following link to complete the process.\n\n'
                    + config.host + '/resetpassword?key=' + key
                    + '\n\nIf you don\'t recall doing this, you can safely ignore this message.'
                    + '\n\nBest regards,\nOnline Point of Sale System Team',
            html: '<p>Hello,<br><br>you have recently requested for a password reset.<br>'
                    + 'Please visit the following link to complete the process.<br><br>'
                    + '<a href="' + config.host + "/passwordreset?key=" + key + '&token=' + token + '">' + config.host + '/passwordreset?key=' + key + '&token=' + token + '</a>'
                    + '<br><br>If you don\'t recall doing this, you can safely ignore this message.</p>'
                    + '<br><br>Best regards,<br>Online Point of Sale System Team</p>'
        };
    },
    generateReceiptMail: function (recipient, receipt) {
        var content = 'Hello, \nthis is the receipt you have recently purchased from\n\n' + receipt.shop + '\n\n'
                + 'Receipt number: ' + receipt.number + '\n'
                + 'Date and time of purchase: ' + getDate(receipt.date) + '\n'
                + 'Employee: ' + receipt.clerk + '\n\n'
                + 'Items: \n';
        var items = receipt.items;
        var total = 0;
        var taxes = {0: 0, 10: 0, 15: 0, 21: 0};
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var name = item.name;
            var quantity = item.quantity;
            var price = item.price;
            var thisTotal = parseFloat(price) * quantity;
            total += thisTotal;
            taxes[item.tax_rate] += thisTotal * item.tax_rate / 100;
            content += '• ' + name + ': ' + quantity + ' x ' + price + ' = ' + thisTotal.formatMoney() + '\n';
        }
        content += '\nSubtotal = ' + total.formatMoney() + '\n'
                + 'Round = ' + (Math.round(total) - total).formatMoney() + '\n'
                + 'Total amount = ' + Math.round(total).formatMoney() + '\n'
                + 'Tendered = ' + parseFloat(receipt.tendered).formatMoney() + '\n'
                + 'Change = ' + (parseFloat(receipt.tendered) - total).formatMoney() + '\n';

        var taxKeys = Object.keys(taxes);
        for (var i = 0; i < taxKeys.length; i++) {
            var taxKey = taxKeys[i];
            var tax = taxes[taxKey];
            if (tax !== 0) {
                content += 'Tax ' + taxKey + '% = ' + tax.formatMoney() + '\n';
            }
        }
        content += '\nHave a nice day\n' + config.companyName;
        return {
            from: '"' + config.companyName + '" <' + config.mail_transport.auth.user + '>',
            to: recipient,
            subject: 'Your receipt ' + receipt.number,
            text: content,
            html: ''
        };
    }
};

function createDateObject(s) {
    var now = null;
    if (s) {
        now = new Date(s);
    } else {
        now = new Date();
    }
    return {
        date: correctTime(now.getDate()),
        month: correctTime(now.getMonth() + 1),
        year: correctTime(now.getFullYear()),
        hh: correctTime(now.getHours()),
        mm: correctTime(now.getMinutes()),
        ss: correctTime(now.getSeconds())
    };
}
;

function correctTime(s) {
    return s < 10 ? '0' + s : s;
}
;

function getDate(s) {
    var d = createDateObject(s);
    return d.date + '/' + d.month + '/' + d.year + ' ' + d.hh + ':' + d.mm + ':' + d.ss;
}
;
Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d === undefined ? '.' : d,
            t = t === undefined ? '' : t,
            s = n < 0 ? '-' : '',
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '',
            j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
};

module.exports = config;
