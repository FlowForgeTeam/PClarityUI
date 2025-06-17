const net = require('net');
const { 
    BACKEND_URL,
    BACKEND_PORT,
    RESPONSE_DELIMITER
} = require('./constants.js');

function callBackend(commandId, extra = {}) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        const payload = {
            command_id: commandId,
            extra
        }

        let buffer = '';

        client.connect(BACKEND_PORT, BACKEND_URL, () => {
            client.write(JSON.stringify(payload));
        });

        client.on('data', (data) => {
            const chunk = data.toString();
            buffer += chunk;

            if (buffer.includes(RESPONSE_DELIMITER)) {
                
                try {
                    const endIndex = buffer.indexOf(RESPONSE_DELIMITER) + RESPONSE_DELIMITER.length;
                    const responseStr = buffer.slice(0, endIndex);
                    const parsed = JSON.parse(responseStr);
                    resolve(parsed);

                    client.end();
                    client.destroy();
                } catch (err) {
                    reject(`Failed to parse JSON response: ${err}`);
                    client.end();
                }
            }
        });

        client.on('error', (err) => {
            console.log(`Socket error: ${err.message}`);
        });
    });
}

module.exports = { callBackend };