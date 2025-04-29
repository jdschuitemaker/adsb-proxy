const net = require('net');
const WebSocket = require('ws');
const os = require('os');



console.log('Local IP Address:', getLocalIP());


// Define the address and port of the TCP socket server
const serverAddress = '192.168.1.8'; // Change this to your server's IP address
// const serverAddress = '192.168.1.123'; // Change this to your server's IP address
// const serverAddress = '84.30.208.169'; // Change this to your server's IP address
const serverPort = 30003; // Change this to your server's port

// Create a new TCP socket client
const tcpClient = new net.Socket();

// Connect to the TCP socket server
tcpClient.connect(serverPort, serverAddress, () => {
    setPosition(1, 1);
    console.log('Connected to TCP socket server. Listening on (IP:Port): ' + getLocalIP() + ':30005');
});

// Array to store connected WebSocket clients
const connectedClients = [];

// Create a new WebSocket server
const wss = new WebSocket.Server({ port: 30005 }); // WebSocket server will run on port 30005

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip over internal (i.e., 127.0.0.1) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0'; // Fallback if no IP found
}

// Listen for WebSocket connections
wss.on('connection', (ws) => {
    //console.log('WebSocket client connected.');

    // Add the WebSocket client to the array of connected clients
    connectedClients.push(ws);
    setPosition(2, 1);
    console.log('Clients connected: ' + connectedClients.length + "  ");

    // Handle WebSocket disconnection
    ws.on('close', () => {
        // console.log('WebSocket client disconnected.');
        // Remove the WebSocket client from the array of connected clients
        connectedClients.splice(connectedClients.indexOf(ws), 1);
        setPosition(2, 1);
        console.log('Clients connected: ' + connectedClients.length + "  ");
    });
});

// Listen for data from the TCP socket server
tcpClient.on('data', (data) => {
    // Convert the data to a string
    const dataString = data.toString('utf8');

    // If there are connected WebSocket clients
    if (connectedClients.length > 0) {
        // Send the data string to each connected WebSocket client
        connectedClients.forEach((ws) => {
            // Send the data to the WebSocket client
            ws.send(dataString);
        });
    }
});

// Handle errors for TCP socket client
tcpClient.on('error', (error) => {
    console.error('Error with TCP socket client:', error);
});

function setPosition(row, column) {
    process.stdout.write(`\x1b[${row};${column}H`);
}

// Clear the console
process.stdout.write('\x1b[2J');

// Position text at row 5, column 10
setPosition(2, 1);
console.log('Connected clients: 0');