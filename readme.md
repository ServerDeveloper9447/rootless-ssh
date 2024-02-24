# Rootless SSH
### A npm package taking advantage of the `exec()` of `child_process` to workaround SSH.

Specially made for [replit](https://replit.com/pricing 'Replit Pricing') users who can't pay for ssh access.
Works on any device as long as it runs windows, linux or mac.

# Prerequisites
1. Installation of NodeJS (`>=16`)

## Limitations
1. Any command that reads line from terminal or asks for input doesn't work.
2. You can only send a command when the previous one had responded.
3. Any command that crashes `node` on your server will disconnect the websocket.

# Server Side
This code would start a websocket on your port `3000` which can be connected to like this `wss://<hostname>:3000`
```js
const { Server } = require('rootless-ssh');

const server = new Server({
    // these are default values
    welcomemsg: '',
    port: 3000,
    path: '/ssh',
    auth: 'changeme' // unique token that needs to be in the `authorization` header when connecting to websocket as `Bearer <password>`
});

server.start();
```
**Note: Make sure to change the `auth` property as this can give an attacker access to your terminal. Even without root access, an attacker can do much damage to your system.**

# Client Side
This code would connect to the websocket and you would be able to enter commands on your console.
```js
const { Client } = require('rootless-ssh');

const client = new Client(url /* wss://<hostname>:<port> */,auth /* auth password */);

client.connect();
```

# Bugs
While this package is being actively tested, please know that bugs may appear. If you come across a bug, report in the issues tab on our [github](https://github.com/ServerDeveloper9447/rootless-ssh/issues 'Having an issue? Click here').
