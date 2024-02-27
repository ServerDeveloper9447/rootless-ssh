/**
 * This file contains all custom commands needed to work around ssh like changing directory.
 * 
 * Right now, the only function this contains is the change directory command. More will be added later on.
 */
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
module.exports = (ws, cmd) => {
    let user;
    try {
        user = require('os').userInfo().username
    } catch (err) {
        user = "localuser"
    }
    if (cmd.startsWith('dirchange>')) {
        try {
            process.chdir(cmd.substring('dirchange>'.length))
            ws.send(JSON.stringify({ status: 200, path: formatPath(process.cwd()),user}))
        } catch (err) {
            ws.send(JSON.stringify({ status: 400, output: err,path: formatPath(process.cwd()),user}))
        }
        return 1;
    }

    return 0;
}