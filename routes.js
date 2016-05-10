var express = require('express');
var router = express.Router();
var socket = require('./socket.js');
var Mysql = require('node-mysql-helper-fork');
var randomstring = require("randomstring");


/* GET home page. */
router.post('/socketTransmit', function(req, res, next) {
  console.log('transmit');
  socket.transmit(req.body);
  res.statusCode = 200;
  res.send('ok');
});

var userId;

router.route('/api/v1/authentications*')
  .all(function(req,res,next){
    Mysql.record('users', {authToken: req.headers['x-auth']})
      .then(function(data) {
        userId = data[0].id;
        if (data.length == 1) {
          next();
        } else {
          res.statusCode = 401;
          res.send();
        }
      })
  });
router.route('/api/v1/authentications')
  .get(function(req, res, next) {
    Mysql.record('authentications', {user_id: userId})
      .then(function(data){
        // remove user_id
        for (var i = 0; i < data.length; i++) {
          delete data[i].user_id;
        }
        res.statusCode = 200;
        res.send(data);
      });
  })
  .post(function(req, res, next) {
    if (req.body.prefix == undefined) {
      res.statusCode = 400;
      res.send({message: 'NO_PREFIX: No prefix provided'});
    } else {
      var insert = {
        prefix: req.body.prefix,
        apiKey: randomstring.generate(20),
        user_id: userId
      }
      Mysql.insert('authentications', insert)
        .then(function(info){
          res.statusCode = 200;
          delete insert.user_id;
          res.send({authentication: insert});
        })
        .catch(function(err){
          res.statusCode = 422;
          res.send({message: err.message});
        });
    }
  });

router.route('/api/v1/authentications/*')
  .get(function(req, res, next) {
    apiKey = req.params[0];
    Mysql.record('authentications', {user_id: userId, apiKey: apiKey})
      .then(function(data){
        if (data.length == 0) {
          res.statusCode = 404;
          res.send({message: 'AUTH_NOT_FOUND: Authentication not found'});
        } else {
          // remove user_id
          delete data[0].user_id;

          res.statusCode = 200;
          res.send(data);
        }
      });
  })
  .delete(function(req, res, next) {
    apiKey = req.params[0];
    Mysql.delete('authentications', {user_id: userId, apiKey: apiKey})
      .then(function(data) {
        if (data.affectedRows == 0) {
            res.statusCode = 404;
            res.send({message: 'AUTH_NOT_FOUND: Authentication not found'});
          } else {
            res.statusCode = 200;
            res.send('ok');
          }
      })
      .catch(function(data) {
        console.log(Mysql.getLastQuery());
        console.log(data);
        res.statusCode = 500;
        res.send(data);
      });
  })
  .put(function(req, res, next) {
    apiKey = req.params[0];
    if (req.body.prefix == undefined) {
      res.statusCode = 400;
      res.send({message: 'NO_PREFIX: No prefix provided'});
    } else {
      var update = {
        prefix: req.body.prefix
      }
      Mysql.update('authentications', {user_id: userId, apiKey: apiKey}, update)
        .then(function(data){
          if (data.affectedRows == 0) {
            res.statusCode = 404;
            res.send({message: 'AUTH_NOT_FOUND: Authentication not found'});
          } else {
            res.statusCode = 200;
            res.send('ok');
          }
        })
        .catch(function(err){
          res.statusCode = 422;
          res.send({message: err.message});
        });
    }
  });


module.exports = router;
