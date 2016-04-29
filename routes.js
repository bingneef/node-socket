var express = require('express');
var router = express.Router();
var socket = require('./socket.js');

/* GET home page. */
router.post('/socketTransmit', function(req, res, next) {
  console.log('transmit');
  socket.transmit(req.body);
  res.statusCode = 200;
  res.send('ok');
});


module.exports = router;
