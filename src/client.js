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
                const dt = JSON.parse(data.toString())
                if (dt.file) {
                    console.log("File recieved");
                    if (!dt?.file?.userdir) {
                        const filename = require('node:crypto').randomUUID()
                        require('fs').writeFileSync(`${process.cwd()}/${filename}`,dt?.file?.content)
                    } else {
                        require('fs').writeFileSync(dt?.file?.userdir,dt?.file?.content)
                    }
                }
                console.log(!dt?.output ? '\n' : dt?.output)
                readline.question(`${dt.user}@${dt.path}$ `, (cmd) => {
                    wss.send(cmd)
                })
            })
        })
        wss.on('error', (err) => { throw new Error(err) })
        wss.on('close', (code, reason) => {
            console.log(`\nConnected closed with code: ${code} and reason: ${reason}`)
            process.exit(0)
        })
    }
}

module.exports = Client