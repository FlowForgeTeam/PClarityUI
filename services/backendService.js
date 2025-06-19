const net = require('net');
const {
    BACKEND_URL,
    BACKEND_PORT,
    RESPONSE_DELIMITER
} = require('./constants.js');

let client = null;
let isConnected = false;
let connectPromise = null;

function connectToBackend(params) {
    if (isConnected && client) return Promise.resolve();

    if (!connectPromise) {
        client = new net.Socket();
        connectPromise = new Promise((resolve, reject) => {
            client.connect(BACKEND_PORT, BACKEND_URL, () => {
                isConnected = true;
                resolve();
            });

            client.on('error', (err) => {
                isConnected = false;
                client = null;
                connectPromise = null;
                reject(err);
            });

            client.on('close', () => {
                isConnected = false;
                client = null;
                connectPromise = null;
            });
        });
    }

    return connectPromise;
}

function callBackend(commandId, extra) {
    return new Promise(async (resolve, reject) => {
        try {
            await connectToBackend();

            const payload = JSON.stringify({
                command_id: commandId,
                extra
            });

            let buffer = '';

            client.on('data', (data) => {
                const chunk = data.toString();
                buffer += chunk;

                if (buffer.includes(RESPONSE_DELIMITER)) {
                    try {
                        const parsed = JSON.parse(buffer);
                        resolve(parsed);
                    } catch (err) {
                        reject(`Failed to parse JSON: ${err}`);
                    }
                }
            });

            client.write(payload);

        } catch (error) {
            reject(`Failed to connect/send: ${err}`);
        }
    });
}

module.exports = { callBackend };