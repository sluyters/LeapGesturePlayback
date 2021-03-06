var url = "http://localhost:3001";
var repeat = false;
var pause = true;
var selectedFileId = "";


function getFiles() {
    var path = document.getElementById("path").value;
    fetch(url + "/files?path=" + path, {
        method: 'GET'
    }).then((res) => {
        return res.json();
    }).then((jsonData) => {
        var files = jsonData["files"];
        // Correctly sort files by filename (http://fuzzytolerance.info/blog/2019/07/19/The-better-way-to-do-natural-sort-in-JavaScript/)
        files.sort(function (a, b) {
            return a.localeCompare(b, navigator.languages[0] || navigator.language, {numeric: true, ignorePunctuation: true});
        })
        displayFiles(files);
        console.log(JSON.stringify(jsonData));
    }).catch((err) => {
        console.log(JSON.stringify(err));
    })
}

function displayFiles(files) {
    // Remove all child elements
    const containerNode = document.getElementById("fileList");
    while (containerNode.firstChild) {
        containerNode.removeChild(containerNode.firstChild);
    }

    selectedFileId = "";

    // Add new child elements
    if (files.length == 0) {
        containerNode.innerHTML += getNoResultHtml();
    } else {
        for (var i = 0; i < files.length; i++) {
            containerNode.innerHTML += getFileHtml(files[i], i + 1);
        }
    }
}

function getNoResultHtml() {
    var text = "No file"
    return `<button type="button" id="noFile" class="list-group-item list-group-item-action" onclick="selectFile(this.id)" disabled>${text}</button>`
}

function getFileHtml(filename, idNumber) {
    var id = `file-${idNumber}`
    return `<button type="button" id="${id}" class="list-group-item list-group-item-action" onclick="selectFile(this.id)">${filename}</button>`
}

function selectFile(nodeId) {
    var selectedNode = document.getElementById(nodeId);
    var newSelectedFile = selectedNode.innerText;
    if (nodeId !== selectedFileId) {
        if (selectedFileId !== "") {
            var previousSelectedNode = document.getElementById(selectedFileId);
            previousSelectedNode.classList.remove("active");

        }
        selectedNode.classList.add("active");
        selectedFileId = nodeId;

        fetch(url + "/controls/play/" + encodeURIComponent(newSelectedFile), {
            method: 'POST'
        }).then((res) => {
            if (!pause) {
                document.getElementById("play").innerText = "Play";
                pause = true;
            }
        }).catch((err) => {
            console.log(JSON.stringify(err));
        })
    }
}

function toggleFocusOverride() {
    var focusOverride = document.getElementById("focusOverride").checked;
    fetch(url + "/controls/focus?override=" + focusOverride, {
        method: 'POST'
    }).catch((err) => {
        console.log(JSON.stringify(err));
    })
}

function togglePlay() {
    pause = !pause;
    if (pause) {
        fetch(url + "/controls/pause", {
            method: 'POST'
        }).then((res) => {
            document.getElementById("play").innerText = "Play";
        }).catch((err) => {
            console.log(JSON.stringify(err));
            pause = false;
        })
    } else {
        fetch(url + "/controls/start", {
            method: 'POST'
        }).then((res) => {
            document.getElementById("play").innerText = "Pause";
        }).catch((err) => {
            console.log(JSON.stringify(err));
            pause = true;
        })
    }
}