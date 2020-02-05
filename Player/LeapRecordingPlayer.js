const WebSocketServer = require('websocket').server;
const http = require('http');
let recordingData = require('./recordings/recording.json');

/**
 * Class for storing a list of all clients
 */
class Clients {
  constructor() {
    this.clients = [];
  }

  isEmpty() {
    console.log(this.clients.length);
    return (this.clients.length === 0);
  }

  addClient(connection) {
    console.log('Adding client');
    var clientInfo = {
      "connection": connection,
      "background": true,
      "focused": true,
      "optimizeHMD": false,
      "enableGestures": false
    }

    this.clients.push(clientInfo)
  }

  updateClient(connection, attribute, value) {
    console.log('Updating client - "' + attribute + '": ' + value);
    for (var i = 0; i < this.clients.length; i++) {
      if (this.clients[i]["connection"] === connection) {
        this.clients[i][attribute] = value;
      }
    }
  }

  removeClient(connection) {
    console.log('Removing client');
    for (var i = 0; i < this.clients.length; i++) {
      if (this.clients[i]["connection"] === connection) {
        this.clients.splice(i, 1);
      }
    }
  }

  sendToAllActiveClients(message) {
    console.log(this.clients.length);
    for (var i = 0; i < this.clients.length; i++) {
      console.log('Client ' + i + ": " + this.clients[i]["background"] + ' ' + this.clients[i]["focused"]);
      if (this.clients[i]["background"] || this.clients[i]["focused"]) {
        console.log('Sending to client ' + i);
        this.clients[i]["connection"].sendUTF(message);
      }
    }
  }
}

var loopStarted = false;

// Port and ip of the websocket server
const webSocketsServerPort = 6437;
const ip = '127.0.0.1';

// Create an HTTP server 
const server = http.createServer(function (request, response) {
  // Empty
});

server.listen(webSocketsServerPort, ip, function () {
  console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

// Create WebSocket server
var wsServer = new WebSocketServer({
  httpServer: server
});

// Maintain a list of all clients
var clients = new Clients();

wsServer.on('request', function (request) {
  // Accept request
  var wsConnection = request.accept(null, request.origin);

  if (!loopStarted) {
    infiniteLoop(0, recordingData["data"]);
    loopStarted = true;
  }

  // Add client to list of clients
  clients.addClient(wsConnection)

  // Send info
  var data = {
    "serviceVersion": "2.3.1+33747",
    "version": 6
  };
  wsConnection.sendUTF(JSON.stringify(data));

  // data = {
  //     "event": {
  //         "state": {
  //             "attached": true,
  //             "id": "LP123456789",
  //             "streaming": true,
  //             "type": "Peripheral",
  //         },
  //         "type": "deviceEvent" 
  //     }       
  // }
  // wsConnection.sendUTF(JSON.stringify(data));

  wsConnection.on('close', function (connection) {
    clients.removeClient(wsConnection)
  });

  wsConnection.on('message', function (message) {
    console.log('Received a message from client');
    if (message.type === 'utf8') {
      var data = message.utf8Data;
      var obj = JSON.parse(data);
      if (obj.hasOwnProperty('background')) {
        clients.updateClient(wsConnection, 'background', obj['background']);
      }
      if (obj.hasOwnProperty('focused')) {
        clients.updateClient(wsConnection, 'focused', obj['focused']);
      }
      if (obj.hasOwnProperty('optimizeHMD')) {
        clients.updateClient(wsConnection, 'optimizeHMD', obj['optimizeHMD']);
      }
      if (obj.hasOwnProperty('enableGestures')) {
        clients.updateClient(wsConnection, 'enableGestures', obj['enableGestures']);
      }
    }
  });

  // client.on('connect', function(connection) {
  //     console.log('WebSocket client to LeapServer connected');
  //     connection.on('error', function(error) {
  //         console.log("Connection on LeapServer Error: " + error.toString());
  //     });
  //     connection.on('close', function() {
  //         console.log('echo-protocol Connection Closed');
  //     });
  //     connection.on('message', function(message) {
  //         if(needCloseLeapConnection === true) {
  //             connection.close();
  //         } else {
  //             if (message.type === 'utf8') {
  //                 wsConnection.sendUTF(message.utf8Data);
  //                 //console.log("Received: '" + message.utf8Data + "'");
  //             }
  //         }
  //     });

  //     connection.sendUTF("{\"enableGestures\": true}");
  // });

  //client.connect('ws://localhost:6437/');

});

function infiniteLoop(n, frames) {
  if (n >= frames.length) {
    n = 0;
  }
  data = frames[n];
  clients.sendToAllActiveClients(JSON.stringify(data))
  setTimeout(function () {
    infiniteLoop(n + 1, frames);
  }, 10);
}