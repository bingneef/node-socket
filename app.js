var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes.js');

var app = express();
var server = app.listen(8000);
console.log('Socket available at port 8000');

var io = require( "socket.io" )( server );
var sockets = require('./socket');
sockets.setupSockets(io);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', routes);

module.exports = app;

