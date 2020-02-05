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
        for (var i = 0; i < this.clients.length; i++) {
            console.log('Client ' + i + ": " + this.clients[i]["background"] + ' ' + this.clients[i]["focused"]);
            if (this.clients[i]["background"] || this.clients[i]["focused"]) {
                console.log('Sending to client ' + i);
                this.clients[i]["connection"].sendUTF(message);
            }
        }
    }
}

module.exports = {
    Clients
};