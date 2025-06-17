const path = require('path');
const { spawn } = require('child_process');

// Determining corrent full-path for cross-platform
const pythonExecutable = 'python';
const scriptPath = path.join(__dirname, '..', 'client_for_debugging', 'cmd_client.py');

function callBackend(commandId, extra = {}) {
    return new Promise((resolve, reject) => {
        const payload = {
            command_id: commandId,
            extra: extra
        }

        const args = [scriptPath, JSON.stringify(payload)];

        const subprocess = spawn(pythonExecutable, args);

        let output, error = '';

        subprocess.stdout.on('data', (data) => {
            output += data.toString();
        });

        subprocess.stderr.on('data', (data) => {
            error += data.toString();
        });

        subprocess.on('close', (code) => {
            if (code !== 0 || error) {
                reject(error || `Exited with code ${code}`);
            } else {
                try {
                    const result = JSON.parse(output);
                    resolve(result);
                } catch (err) {
                    reject(`Failed to parse JSON: ${err}`);
                }
            }
        });
    });
}

module.exports = { callBackend };