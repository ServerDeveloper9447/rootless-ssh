
const { execSync } = require('child_process')
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
    /**
     * 
     * @param {object} options Options for the ws server.
     * @param {httpServer} server External http server instance (optional)
     */
    constructor(options = {port:3000,auth:"changeme",path:'/ssh',welcomemsg:`
__________               __  .__                           _________ _________ ___ ___  
\______   \ ____   _____/  |_|  |   ____   ______ ______  /   _____//   _____//   |   \ 
 |       _//  _ \ /  _ \   __\  | _/ __ \ /  ___//  ___/  \_____  \ \_____  \/    ~    \
 |    |   (  <_> |  <_> )  | |  |_\  ___/ \___ \ \___ \   /        \/        \    Y    /
 |____|_  /\____/ \____/|__| |____/\___  >____  >____  > /_______  /_______  /\___|_  / 
        \/                             \/     \/     \/          \/        \/       \/  

Welcome!
\x1b[32mSuccessfully connected.`,logging:{input:false,output:false}}, server) {
        this.options = { port:!options?.port ? 3000 : options?.port,auth: !options?.auth ? "changeme" : options?.auth,welcomemsg:Object.is(options?.welcomemsg,null) ? `
__________               __  .__                           _________ _________ ___ ___  
\______   \ ____   _____/  |_|  |   ____   ______ ______  /   _____//   _____//   |   \ 
 |       _//  _ \ /  _ \   __\  | _/ __ \ /  ___//  ___/  \_____  \ \_____  \/    ~    \
 |    |   (  <_> |  <_> )  | |  |_\  ___/ \___ \ \___ \   /        \/        \    Y    /
 |____|_  /\____/ \____/|__| |____/\___  >____  >____  > /_______  /_______  /\___|_  / 
        \/                             \/     \/     \/          \/        \/       \/  

Welcome!
\x1b[32mSuccessfully connected.` : options?.welcomemsg, logging: !options?.logging ? {input:false,output:false} : options?.logging }
        try {
            this.user = require('os').userInfo().username
        } catch (err) {
            this.user = "localuser"
        }
        if (!server) {
            this.wsServer = new ws({ port: !options?.port ? 3000 : options?.port, path: options?.path })
        } else {
            this.wsServer = new ws({ port: options?.port, path: options?.path, server })
            this.httpServer = server;
        }
    }

    start() {
        console.log(`\x1b[32mServer is ready.`);
        const options = this.options
        const startingDir = process.cwd()
        const user = this.user
        const logs = this.options.logging
        this.wsServer.on('connection', function (ws, req) {
            if (options?.auth) {
                if (req.headers?.authorization.split(" ")[1] != options.auth) {
                    ws.send(JSON.stringify({ status: 401, message: "Unauthorized" }))
                    ws.close();
                    console.log("\x1b[31mRefused access to user because of bad auth token.");
                    return;
                }
            }
            console.log("\x1b[32mUser connected.")
            ws.send(JSON.stringify({
                status: 200, output: Object.is(options?.welcomemsg, null) ? "" : `
__________               __  .__                           _________ _________ ___ ___  
\______   \ ____   _____/  |_|  |   ____   ______ ______  /   _____//   _____//   |   \ 
 |       _//  _ \ /  _ \   __\  | _/ __ \ /  ___//  ___/  \_____  \ \_____  \/    ~    \
 |    |   (  <_> |  <_> )  | |  |_\  ___/ \___ \ \___ \   /        \/        \    Y    /
 |____|_  /\____/ \____/|__| |____/\___  >____  >____  > /_______  /_______  /\___|_  / 
        \/                             \/     \/     \/          \/        \/       \/  

Welcome!
\x1b[32mSuccessfully connected.`,platform:process.platform,path:formatPath(process.cwd()),user}))
            ws.on('message', (data) => {
                const cmd = data.toString()
                // custom commands will be stopped from running on the shell
                if (funcs(ws, cmd) == 1) return;
                const exec = execSync(cmd);
                try {
                    if (logs.input) {
                        console.log(`Command recieved: ${cmd}`)
                    }
                    if (logs.output) {
                        console.log(exec)
                    }
                } catch (err) {
                    console.error(err)
                }
                ws.send(JSON.stringify({status:200,output:!exec ? "" : exec,path:formatPath(process.cwd()),user}))
            })
            ws.on('close', () => {
                process.chdir(startingDir)
            })
        })
    }

    stop() {
        console.log("\x1b[31mClosing server.");
        this.wsServer.close();
    }
}

module.exports = Server;