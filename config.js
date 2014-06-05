var config = {}

config.mailgun = {};
config.mandrill = {};

config.defaultProvider = 'MAILGUN'; //MAILGUN || MANDRILL
config.port = 3000;
config.mongoose = 'mongodb://localhost/logmail'; // URI for local mongodb
config.mailgun.uri = 'https://api.mailgun.net/v2/sandboxfcdaf135ac374efd8ee43e9039b7ceb9.mailgun.org/messages';
config.mailgun.username = 'api';
config.mailgun.password = 'YOUR MAILGUN API KEY'
config.mandrill.uri = 'https://mandrillapp.com/api/1.0/messages/send.json';
config.mandrill.password = 'YOUR MANDRILL API KEY'; // YOUR MANDRILL API KEY

module.exports = config;
