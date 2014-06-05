var mongoose = require('mongoose');
var Logmail = mongoose.model('Logmail');

/* This function returns a list of all database records */
exports.list = function (req, res) {
    Logmail.find(function (err, logmail, count) {
        if (err)
            res.send('Database error: ' + err);
        else
            res.send(logmail);
    });
};

/* This function clears the database of all records */
exports.clear = function (req, res) {
    Logmail.remove(function (err, logmail) {
        if (err)
            res.send('Database error: ' + err);
        else{
			console.log('Database cleared!\n');
            res.send('Database cleared!\n');
		}
    });
};

/* This function filters the database by destination address */
exports.filterTo = function (req, res) {
    Logmail.find({
        'to': req.params.to
    }, function (err, logmail) {
        if (err)
            res.send('Database error: ' + err);
        else
            res.send(logmail);
    });
};

/* This function filters the database by source address */
exports.filterFrom = function (req, res) {
    Logmail.find({
        'from': req.params.from
    }, function (err, logmail) {
        if (err)
            res.send('Database error: ' + err);
        else
            res.send(logmail);
    });
};

/* This function filters the database by service provider */
exports.filterProvider = function (req, res) {
    Logmail.find({
        'provider': req.params.provider.toUpperCase()
    }, function (err, logmail) {
        if (err)
            res.send('Database error: ' + err);
        else
            res.send(logmail);
    });
};
