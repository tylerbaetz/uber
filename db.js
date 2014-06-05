var config = require('./config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* A logmail includes a destination address and name, a source address and name, a subject, a body, a provider, a date, and an IP address. */
var logmailSchema = new Schema({
    to: String,
    to_name: String,
    from: String,
    from_name: String,
    subject: String,
    body: String,
    provider: String,
    creationDate: {
        type: Date,
        'default': Date.now
    },
    ip_addr: String,
});

mongoose.model('Logmail', logmailSchema);
mongoose.connect(config.mongoose);
