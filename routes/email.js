var mongoose = require('mongoose');
var request = require('request');
var html_strip = require('htmlstrip-native');
var config = require('../config');
var Logmail = mongoose.model('Logmail');

/* This is a helper function to create the correct JSON object for the specified provider */
function mailOptions(mail){
	var options = {
		'return_response':true,
		'parse_json':true
	};
	if (mail.provider == "MAILGUN"){
		options.uri = config.mailgun.uri;
		options.auth = {
			'username': config.mailgun.username,
			'password': config.mailgun.password
		};
		options.form = {
			'from': mail.from_name + ' <' + mail.from + '>',
			'to' : mail.to_name + ' <' + mail.to + '>',
			'subject':mail.subject,
			'text':mail.body
		};
	}else if (mail.provider == "MANDRILL"){
		options.uri = config.mandrill.uri;
		options.json = {
			'key': config.mandrill.password,
			'message': {
			'text' : mail.body,
			'subject' : mail.subject,
			'from_email' : mail.from,
			'from_name' : mail.from_name,
			'to':[{
				'email':mail.to,
				'name':mail.to_name,
				'type':'to'
				}]
			}	
		};
	}
	
	return options;
}


/*
 * This function uses express-validator to validate the provided input fields.  If an input is invalid or missing, the application returns an error.
 * Upon successful validation, the function uses the htmlstrip-native library to parse the body text and create a mail object specific to the default provider.
 * The HTTP request is made to the default provider and if successful, returns a confirmation to the user and saves a record in the database.
 * If the request fails, the function creates a new JSON object for the alternate provider and makes a second HTTP request.
 * If the second request is successful, the function returns a confirmation to the user and saves a record in the database.  If it fails then the user is notified.
 * The force_error parameter can be used to trigger a request failure on the initial request, forcing use of the alternate provider.
*/  
exports.create = function (req, res, next) {
    var forceError = false;
	var provider = config.defaultProvider;
	
    req.assert('to', 'Invalid "to" address').isEmail();
    req.assert('from', 'Invalid "from" address').isEmail();
    req.assert('to_name', 'Invalid "to_name"').notEmpty();
    req.assert('from_name', 'Invalid "from_name"').notEmpty();
    req.assert('subject', 'Invalid "subject"').notEmpty();
    req.assert('body', 'Invalid "body"').notEmpty();

    if (req.body.force_error) {
        req.sanitize('force_error').toBoolean();
        forceError = req.param("force_error");
    }

    var errors = req.validationErrors();
    if (errors) {
        return next(errors);
    }

    //Strip html tags from body
    var text = html_strip.html_strip(req.param('body'));

    //Create mail object
    var mail = new Logmail({
        to: req.param('to'),
        to_name: req.param('to_name'),
        from: req.param('from'),
        from_name: req.param('from_name'),
        subject: req.param('subject'),
        body: text,
        provider: provider,
        creationDate: Date.now(),
        ip_addr: req.socket.remoteAddress
    });

    var options = mailOptions(mail);
    if (forceError)
		options.uri = '';
	
	//Default provider request
    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            mail.save(function (e, logmail, count) {
                if (e)
                    console.log('Error saving mail to database.');
                else
                    console.log(mail.from + ' --> ' + mail.to + '  |  ' + mail.provider);
            });

            res.send('Mail sent using ' + mail.provider + '\n');
        } else {
            provider = (provider == 'MAILGUN') ? 'MANDRILL' : 'MAILGUN';
            mail.provider = provider;
            options = mailOptions(mail);
            
            //Alternate provider request
            request.post(options, function (err, resp, bod) {
                if (!err && resp.statusCode == 200) {
                    mail.save(function (e, logmail, count) {
                        if (e)
                            console.log('Error saving mail to database.');
                        else
                            console.log(mail.from + ' --> ' + mail.to + '  |  ' + mail.provider);
                    });
                    res.send('Mail sent using ' + mail.provider + '\n');
                } else
                    res.send('Failed to send mail.\n');
            });
        }
    });

}
