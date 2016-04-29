## TO PREPARE
npm install

## TO RUN
nodemon s

At this point your socket is initiated at http://localhost:8000.


## Routes
### From server
POST - http://localhost:8000/socketTransmit

### From frontend
this.socket.emit('socketTransmit', {room: 'testroom', destination: 'all', data: 'somedata'})

## Examples
A simple Angular project will be added soon.


## Project settings
Uses Node

## Database
No datebase
