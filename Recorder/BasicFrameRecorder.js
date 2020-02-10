const path = require('path');
const express = require('express');

const app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// http://localhost:3002
app.listen(3002, function () {
  console.log('Server available at http://localhost:3002');
});
// ================================================================
