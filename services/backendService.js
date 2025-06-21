const net = require('net');
const {
    BACKEND_URL,
    BACKEND_PORT,
    RESPONSE_DELIMITER
} = require('./constants.js');

let client = null;
let isConnected = false;
let connectPromise = null;
let buffer = '';

let currentResolve = null;
let currentReject = null;

const requestQueue = [];

function processNextRequest() {
    if (currentResolve || requestQueue.length === 0) return;

    const { commandId, extra, resolve, reject } = requestQueue.shift();

    currentResolve = resolve;
    currentReject = reject;

    const payload = JSON.stringify({ request_id: commandId, extra });
    client.write(payload);
}

function connectToBackend() {
    if (isConnected && client) return Promise.resolve();

    if (!connectPromise) {
        client = new net.Socket();

        connectPromise = new Promise((resolve, reject) => {
            client.connect(BACKEND_PORT, BACKEND_URL, () => {
                isConnected = true;
                resolve();
            });

            if (!client.listenerCount('data')) {
                client.on('data', (data) => {
                    buffer += data.toString();

                    if (buffer.includes(RESPONSE_DELIMITER)) {
                        try {
                            const parsed = JSON.parse(buffer);
                            currentResolve?.(parsed);
                        } catch (err) {
                            currentReject?.(`Failed to parse JSON: ${err}`);
                        } finally {
                            buffer = '';
                            currentResolve = null;
                            currentReject = null;
                            processNextRequest();
                        }
                    }
                });
            }

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

            requestQueue.push({ commandId, extra, resolve, reject });
            processNextRequest();

        } catch (err) {
            reject('Failed to connect/send: ${err}');
        }
    });
}

module.exports = { callBackend };