/**
 * This file contains all custom commands needed to work around ssh like changing directory.
 * 
 * Right now, the only function this contains is the change directory command. More will be added later on.
 */
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
module.exports = (ws,cmd) => {
    if (cmd.startsWith('dirchange>')) {
        try {
            process.chdir(cmd.substring('dirchange>'.length))
            ws.send(JSON.stringify({ status: 200, path: formatPath(process.cwd())}))
        } catch (err) {
            ws.send(JSON.stringify({ status: 400, message: err }))
        }
        return 1;
    }
    return 0;
}