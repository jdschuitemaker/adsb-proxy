const serverAddress = '192.168.1.8';
const serverPort = 30003;

const net = require('net');
const WebSocket = require('ws');
const os = require('os');
const https = require('https');
const fs = require('fs');

console.log('Local IP Address:', getLocalIP());

// SSL Certificate Configuration (non-production)
const serverOptions = {
  key: fs.readFileSync('key.pem', 'utf8'),
  cert: fs.readFileSync('cert.pem', 'utf8')
};

// TCP Client Setup (unchanged from original)
const tcpClient = new net.Socket();

tcpClient.connect(serverPort, serverAddress, () => {
    setPosition(1, 1);
    console.log('Connected to TCP socket server:', serverAddress + ':' + serverPort);
    setPosition(2, 1);
    console.log('Secure WebSocket listening on:', 'wss://' + getLocalIP() + ':30005');
});

// WebSocket Server Setup with HTTPS
const server = https.createServer(serverOptions);
const wss = new WebSocket.Server({ server });
const connectedClients = [];

// Start secure server
server.listen(30005, () => {
    console.log('Server started'); // This will be overwritten by the position-set log
});

// WebSocket connection handling (unchanged from original)
wss.on('connection', (ws) => {
    connectedClients.push(ws);
    setPosition(3, 1);
    console.log('Clients connected: ' + connectedClients.length + "  ");

    ws.on('close', () => {
        connectedClients.splice(connectedClients.indexOf(ws), 1);
        setPosition(3, 1);
        console.log('Clients connected: ' + connectedClients.length + "  ");
    });
});

// TCP data handling (unchanged from original)
tcpClient.on('data', (data) => {
    const dataString = data.toString('utf8');
    if (connectedClients.length > 0) {
        connectedClients.forEach((ws) => {
            ws.send(dataString);
        });
    }
});

// Error handling (unchanged from original)
tcpClient.on('error', (error) => {
    console.error('Error with TCP socket client:', error);
});

// Utility functions (unchanged from original)
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

function setPosition(row, column) {
    process.stdout.write(`\x1b[${row};${column}H`);
}

// Console initialization (unchanged from original)
process.stdout.write('\x1b[2J');
setPosition(3, 1);
console.log('Connected clients: 0');
