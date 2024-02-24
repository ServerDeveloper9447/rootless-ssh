const ws = require('ws')
class Client {
    constructor(url, options = {}) {
        this.url = url;
        this.options = options;
        this.wscl = new ws(url,options)
    }

    connect() {
        const wss = this.wscl
        wss.on('open', () => {
            console.log(`Connected to ${this.url}`)
            let ptf;
            const readline = require('node:readline').createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            wss.on('message', (data) => {
                console.log(JSON.parse(data.toString()).output)
                readline.question(`${JSON.parse(data.toString()).path}$ `, (cmd) => {
                    wss.send(cmd)
                })
            })
        })
        wss.on('error', (err) => { throw new Error(err) })
        wss.on('close', (code, reason) => console.log(`Connected closed with code: ${code} and reason: ${reason}`))
    }
}