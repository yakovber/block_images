
const WebSocket = require('ws');

let wss = null;
let clients = [];

function initWebSocket(server) {
  wss = new WebSocket.Server({ server , path: '/ws'});

  wss.on('connection', (ws) => {
    console.log('לקוח WebSocket התחבר');
    clients.push(ws);

    ws.on('close', () => {
      clients = clients.filter((client) => client !== ws);
    });
  });
}

function broadcastUpdate(data) {
  const message = JSON.stringify({ type: 'update', payload: data });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      console.log('נשלחה הודעה ללקוח WebSocket');
    }else {
      console.log('לקוח WebSocket לא זמין');
    }
  });
}

module.exports = {
  initWebSocket,
  broadcastUpdate
};
