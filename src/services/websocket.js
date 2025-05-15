const WebSocket = require('ws');

class WebSocketService {
    constructor(port = 3001) {
        this.clients = new Set();
        this.wss = new WebSocket.Server({ port });
        this.initializeWebSocket();
    }

    initializeWebSocket() {
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            console.log('New client connected');

            ws.on('message', (message) => this.handleMessage(message));
            ws.on('close', () => this.handleDisconnection(ws));
            ws.on('error', (error) => this.handleError(ws, error));
        });
    }

    handleMessage(message) {
        try {
            const data = JSON.parse(message);
            if (data.type === 'db-change') {
                this.broadcastRefresh();
            }
        } catch (err) {
            console.error('Error handling WebSocket message:', err);
        }
    }

    handleDisconnection(ws) {
        this.clients.delete(ws);
        console.log('Client disconnected');
    }

    handleError(ws, error) {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
    }

    broadcastRefresh() {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ 
                    type: 'refresh-blocked'
                }));
            }
        });
    }
}

module.exports = WebSocketService;