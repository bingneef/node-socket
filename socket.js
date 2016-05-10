var Mysql = require('node-mysql-helper-fork');

module.exports = {
  socket: null,
  io: null,
  setupSockets: function(io) {
    this.io = io;
    io.on('connection',function(socket){

      socket.on('subscribe', function(data) {
        if (data.credentials.apiKey == null || data.credentials.prefix == null) {
          console.log('No credentials');
          socket.emit('unauthorized', {message: 'No credentials provided'}, function() {
            socket.disconnect();
          });
          return
        }

        // verify the apiKey with the room
        Mysql.record('authentication', {apiKey: data.credentials.apiKey, prefix: data.credentials.prefix})
          .then(function(record){
            if (record.length == 0) {
              console.log('Wrong credentials');
              socket.emit('unauthorized', {message: 'Invalid credentials'}, function() {
                socket.disconnect();
              });
            } else {
              var authRoom = record[0].prefix + '::' + data.room;
              socket.join(authRoom);
              io.sockets.in(authRoom).emit('joined');
              socket.emit('authorized');
            }
          })
          .catch(function(err){
            console.log(err);
            socket.emit('unauthorized', {message: "Some error occured. I'm sorry."}, function() {
              socket.disconnect();
            });
          });
      })

      socket.on('unsubscribe', function(room) {
        socket.leave(room);
        io.sockets.in(room).emit('opponentDisconnected')
      })

      socket.on('socketTransmit', function(data) {
        console.log('transmit', data);
        socket.broadcast.to(data.room).emit('socketTransmit', data);
      });

      console.log("A user is connected");

      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });
  },
  transmit: function(data) {
    this.io.sockets.emit('socketTransmit', data);
  }
}
