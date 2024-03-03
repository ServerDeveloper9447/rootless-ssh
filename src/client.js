const ws = require('ws')
class Client {
    constructor(url, auth = 'changeme') {
        this.url = url;
        this.auth = auth
        this.wscl = new ws(url, {
            headers: {
                authorization: `Bearer ${auth}`
            }
        })
    }

    connect() {
        const wss = this.wscl
        const url = this.url
        console.log(`Attempting a connection to ${url}`)
        wss.on('open', () => {
            console.log(`\x1b[32mConnected to ${url}\x1b[0m`)
            const readline = require('node:readline').createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            wss.on('message', (data) => {
                const dt = JSON.parse(data.toString())
                console.log(!dt?.output ? '\n' : dt?.output)
                readline.question(`${dt.user}@${dt.path}$ `, (cmd) => {
                    if (cmd.startsWith("disconnect>")) {
                        wss.close(1000)
                        console.log("\x1b[31mDisconnected from server.\x1b[0m")
                        process.exit(0);
                    }
                    wss.send(cmd)
                })
            })
        })
        wss.on('error', (err) => { throw new Error(err) })
        wss.on('close', (code, reason) => {
            console.log(`\n\x1b[31mConnection closed with code: ${code} and reason: ${reason}\x1b[0m`)
            process.exit(0)
        })
    }

    send(cmd) {
        this.wscl.send(cmd);
    }

    disconnect() {
        this.wscl.close();
        console.log(`Connection closed.`);
    }

    ws() {
        return this.wscl;
    }
}

module.exports = Client