const path = require('path');
const { spawn } = require('child_process');

const pythonExecutable = 'python';

const scriptPath = path.join(__dirname, '..', '..', 'evelina_version', 'client_for_debugging', 'cmd_client.py');

function callBackend(commandId, extra = {}) {
    return new Promise((resolve, reject) => {
        const payload = {
            command_id: commandId,
            extra: extra
        }

        const args = [scriptPath, JSON.stringify(payload)];

        console.log(pythonExecutable, args);

        const subprocess = spawn(pythonExecutable, args, {
            cwd: path.join(__dirname, '../../evelina_version')
        });

        let output = '', error = '';

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
                    const actual = 'Responce: ';
                    const index = output.indexOf(actual) + actual.length;
                    output = output.substring(index);
                    console.log(output);
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