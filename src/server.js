
const { exec } = require('child_process')
const ws = require('ws').Server
const funcs = require('./commands')
function formatPath(currentPath) {
    let homeDir;
    if (process.platform == 'win32') {
        homeDir = process.env.USERPROFILE.slice(0, 2) + process.env.HOMEPATH.replaceAll("/", "\\");
    } else if (process.platform == 'linux') {
        homeDir = process.env.HOME
    } else if (process.platform == 'darwin') {
        homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
    }
    if (currentPath.startsWith(homeDir)) {
        return '~' + currentPath.slice(homeDir.length).replaceAll("\\","/");
    } else if (currentPath === '/') {
        return '~';
    } else {
        return currentPath.replaceAll("\\","/");
    }
}
class Server {
    constructor(options = {port:3000,auth:"changeme",path:'/ssh',welcomemsg:`__________               __  .__                           _________ _________ ___ ___  
\______   \ ____   _____/  |_|  |   ____   ______ ______  /   _____//   _____//   |   \ 
    |       _//  _ \ /  _ \   __\  | _/ __ \ /  ___//  ___/  \_____  \ \_____  \/    ~    \
    |    |   (  <_> |  <_> )  | |  |_\  ___/ \___ \ \___ \   /        \/        \    Y    /
    |____|_  /\____/ \____/|__| |____/\___  >____  >____  > /_______  /_______  /\___|_  / 
        \/                             \/     \/     \/          \/        \/       \/  


Welcome!
Successfully connected.`}) {
        this.options = options
        this.wsServer = new ws({ port: !options?.port ? 3000 : options?.port, path: options?.path })
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
            ws.send(JSON.stringify({status:200,output:options?.welcomemsg,platform:process.platform,path:formatPath(process.cwd()),user:require('os').userInfo().username}))
            ws.on('message', (data) => {
                const cmd = data.toString()
                // custom commands will be stopped from running on the shell
                if (funcs(ws, cmd) == 1) return;
                exec(cmd, (err, stdout, stderr) => {
                    ws.send(JSON.stringify({status:200,output:err || stdout.toString() || stderr.toString(),path:formatPath(process.cwd()),user:require('os').userInfo().username}))
                })
            })
            ws.on('close', () => {
                process.chdir(startingDir)
            })
        })
    }
}

module.exports = Server