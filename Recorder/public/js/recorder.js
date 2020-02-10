var ws;
var recording = false;
var recordingData = [];
var saveOnStop = true;

var baseFilename = "recording";
var separator = "-";
var currentId = 1;
var fileExtention = ".json";

function focusListener(event) {
  ws.send(JSON.stringify({ focused: true })); // Claim focus
};
function blurListener(event) {
  ws.send(JSON.stringify({ focused: false })); // Relinquish focus
};

// Support both the WebSocket and MozWebSocket objects
if ((typeof (WebSocket) == 'undefined') &&
  (typeof (MozWebSocket) != 'undefined')) {
  WebSocket = MozWebSocket;
}

// Create the socket with event handlers
function init() {
  // Listen to spacebar press
  document.body.onkeyup = function (e) {
    if (e.keyCode == 32 || e.key === ' ') {
      toggleRecording();
    }
  }

  // Create and open the socket
  ws = new WebSocket("ws://localhost:6437/v6.json");

  // On successful connection
  ws.onopen = function (event) {
    var enableMessage = JSON.stringify({ enableGestures: true });
    ws.send(enableMessage); // Enable gestures
    ws.send(JSON.stringify({ focused: true })); // Claim focus

    window.addEventListener('focus', focusListener);
    window.addEventListener('blur', blurListener);

    document.getElementById("connectionStatus").classList.remove("badge-danger");
    document.getElementById("connectionStatus").classList.add("badge-success");
    document.getElementById("connectionStatus").innerText = "Connected";
  };

  // On message received
  ws.onmessage = function (event) {
    if (recording) {
      var obj = JSON.parse(event.data);
      if (obj.id) {
        recordingData.push(obj);
      }
    }
  };

  // On socket close
  ws.onclose = function (event) {
    ws = null;
    window.removeEventListener("focus", focusListener);
    window.removeEventListener("blur", blurListener);
    document.getElementById("connectionStatus").classList.remove("badge-success");
    document.getElementById("connectionStatus").classList.add("badge-danger");
    document.getElementById("connectionStatus").innerText = "Disconnected";
  }

  // On socket error
  ws.onerror = function (event) {
    console.log("Socket error.");
  };
}

function saveConfig() {
  baseFilename = document.getElementById("filename").value;
  currentId = parseInt(document.getElementById("startId").value, 10);
}

function toggleSaveOnStop() {
  saveOnStop = document.getElementById("saveOnStop").checked;
}

function toggleRecording() {
  recording = !recording;

  if (recording) {
    recordingData = [];
    document.getElementById("record").innerText = "Stop recording";
    ws.send(JSON.stringify({ focused: true })); // Request focus
    document.getElementById("download").disabled = true;
  } else {
    document.getElementById("record").innerText = "Start Recording";
    ws.send(JSON.stringify({ focused: false })); // Relinquish focus
    document.getElementById("download").disabled = false;
    if (saveOnStop) {
      downloadRecording();
    }
  }
}

function resetRecording() {
  recording = false;
  recordingData = [];
  document.getElementById("record").innerText = "Start Recording";
  document.getElementById("download").disabled = true;
  ws.send(JSON.stringify({ focused: false })); // Relinquish focus
}

function getFilename() {
  var filename = baseFilename + separator + currentId + fileExtention;
  currentId += 1;
  return filename;
}

function downloadRecording() {
  if (!recording) {
    data_json = {
      "frames": recordingData.length,
      "data": recordingData
    }
    var link = document.createElement('a');
    var filename = getFilename();
    link.setAttribute('download', filename);
    link.href = makeTextFile(JSON.stringify(data_json));
    document.body.appendChild(link);

    // Wait for the link to be added to the document
    window.requestAnimationFrame(function () {
      var event = new MouseEvent('click');
      link.dispatchEvent(event);
      document.body.removeChild(link);
    });
  }
}

var textFile = null;
function makeTextFile(text) {
  var data = new Blob([text], { type: 'text/plain' });

  // If we are replacing a previously generated file we need to manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }

  textFile = window.URL.createObjectURL(data);

  // Returns a URL
  return textFile;
};