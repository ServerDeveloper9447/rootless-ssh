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
        wss.on('open', () => {
            console.log(`Connected to ${this.url}`)
            const readline = require('node:readline').createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            wss.on('message', (data) => {
                console.log(JSON.parse(data.toString()).output)
                const dt = JSON.parse(data.toString())
                readline.question(`${dt.user}@${dt.path}$ `, (cmd) => {
                    wss.send(cmd)
                })
            })
        })
        wss.on('error', (err) => { throw new Error(err) })
        wss.on('close', (code, reason) => console.log(`Connected closed with code: ${code} and reason: ${reason}`))
    }
}

module.exports = Client