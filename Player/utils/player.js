class RecordingPlayer {
    constructor(frames, clients, loop) {
        this.clients = clients;
        this.stopped = false;
        this.frames = frames;
        this.currentFrame = 0;
        this.loop = loop;
    }

    setLoop(loop) {
        this.loop = loop;
    }

    stop() {
        this.stopped = true;
    }

    play() {
        this.stopped = false;
        this.playFile();
    }

    playFile() {
        if (this.currentFrame >= this.frames.length) {
            this.currentFrame = 0;
            if (!this.loop) {
                return;
            }
        }
        var data = this.frames[this.currentFrame++];
        var framerate = data["currentFrameRate"];
        var msInterval = 1000 / framerate;
        this.clients.sendToClients(JSON.stringify(data))
        if (!this.stopped) {
            var _this = this;
            setTimeout(function () {
                _this.playFile();
            }, msInterval);
        }
    }
}

module.exports = {
    RecordingPlayer
};