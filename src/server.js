
const { exec } = require('child_process')
const ws = require('ws').Server
const funcs = require('./commands')
function formatPath(currentPath) {
    let homeDir;
    const envs = {
        win32: process.env.USERPROFILE.slice(0, 2) + process.env.HOMEPATH.replaceAll("/","\\"),
        linux: process.env.HOME,
        darwin: process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
    }
    homeDir = envs[process.platform]
    if (currentPath.startsWith(homeDir)) {
        return '~' + currentPath.slice(homeDir.length).replaceAll("\\","/");
    } else if (currentPath === '/') {
        return '~';
    } else {
        return currentPath.replaceAll("\\","/");
    }
}
class Server {
    constructor(options = {port:3000,auth:"changeme",path:'/ssh'}) {
        this.options = options
        this.wsServer = new ws({ port: !options?.port ? 3000 : options?.port, path: options?.path})
    }

    start() {
        const options = this.options
        const startingDir = process.cwd()
        this.wsServer.on('connection', function (ws, req) {
            if (options?.auth) {
                if (req.headers?.authorization.split(" ")[1] != options.auth) {
                    ws.send(JSON.stringify({ status: 401, message: "Unauthorized" }))
                    ws.close();
                    return;
                }
            }
            ws.send(JSON.stringify({status:200,message:"Connection success.",info:{platform:process.platform,path:formatPath(process.cwd())}}))
            ws.on('message', (data) => {
                const cmd = data.toString()
                // custom commands will be stopped from running on the shell
                if (funcs(ws,cmd) == 1) return;
                exec(cmd, (err, stdout, stderr) => {
                    ws.send(JSON.stringify({status:200,output:err || stdout.toString() || stderr.toString(),path:formatPath(process.cwd())}))
                })
            })
            ws.on('close', () => {
                process.chdir(startingDir)
            })
        })
    }
}

const s = new Server({})
s.start()