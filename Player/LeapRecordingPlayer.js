const path = require('path');
const fs = require('fs');
const express = require('express');
const WebSocketServer = require('websocket').server;
const http = require('http');
const Clients = require('./utils/clients').Clients;
const RecordingPlayer = require('./utils/player').RecordingPlayer;

// Path of the directory of the recordings
var defaultPath = path.join(__dirname, 'recordings');
var recordingsDirectoryPath = defaultPath;

// Recording player
var player = null;

// Maintain a list of all clients
var clients = new Clients();

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

wsServer.on('request', function (request) {
  // Accept request
  var wsConnection = request.accept(null, request.origin);

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
});

// ================================================================
const app = express();

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// e.g.: /files?path="pathToFile"
app.get('/files', function (req, res) {
  if (req.query.path !== "") {
    recordingsDirectoryPath = req.query.path;
  } else {
    recordingsDirectoryPath = defaultPath;
  }
  fs.readdir(recordingsDirectoryPath, function (err, files) {
    if (err) {
      res.sendStatus(500)
      return console.error('Unable to scan directory: ' + err);
    }
    // Send all the filenames to the client
    var data = { "files": files };
    res.send(JSON.stringify(data));
  });
})

// e.g.: /controls/focus?override=true
app.post('/controls/focus', function (req, res) {
  var focusOverride = JSON.parse(req.query.override);
  console.log(focusOverride)
  clients.setFocusOverride(focusOverride);
  res.sendStatus(200);

})
app.post('/controls/play/:filename', function (req, res) {
  var filename = req.params.filename;
  var filePath = path.join(recordingsDirectoryPath, filename);
  fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
      res.sendStatus(200);
      if (player !== null) {
        player.stop();
      }
      jsonData = JSON.parse(data);
      player = new RecordingPlayer(jsonData["data"], clients, true);
    } else {
      res.sendStatus(500)
      console.log(err);
    }
  });
})

app.post('/controls/start', function (req, res) {
  if (player !== null) {
    player.play();
  }
  res.sendStatus(200);

})

app.post('/controls/pause', function (req, res) {
  if (player !== null) {
    player.stop();
  }
  res.sendStatus(200);
})

// http://localhost:3001
app.listen(3001, function () {
  console.log('Listening on port 3001!');
});
// ================================================================
