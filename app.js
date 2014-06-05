var config = require('./config');
var db = require('./db');
var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var email = require('./routes/email');
var list = require('./routes/list');
var app = express();


app.use(bodyParser.json());
app.use(expressValidator());

//Routes
app.post('/email', email.create);
app.get('/list', list.list);
app.get('/list/clear', list.clear);
app.get('/list/to/:to', list.filterTo);
app.get('/list/from/:from', list.filterFrom);
app.get('/list/provider/:provider', list.filterProvider);

//Error handler
app.use(function (err, req, res, next) {
    console.log(err);
    return res.send(400, err);
});

app.listen(config.port);

console.log('Server started on port ' + config.port + '...');
