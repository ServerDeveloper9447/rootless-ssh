# Rootless SSH

### A npm package taking advantage of the `execSync()` of `child_process` to workaround SSH.

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
    welcomemsg: <advertisementText>, // if you don't want any welcome message, you have to explicitly set it to null.
    port: 3000, // optional if server is not null
    path: '/ssh',
    auth: 'changeme' // unique token that needs to be in the `authorization` header when connecting to websocket as `Bearer <password>`,
    server: <ExpressApp> /*or*/ <HttpServer>,
    logging: {
        input: false, // set to true to log commands
        output: false // set to true to log command outputs
    }
});

// to start the server
server.start();

// to close the server
server.stop();

// to access the underlying websocket instance
const ws = server.ws();
```
**Note: Make sure to change the `auth` property as this can give an attacker access to your terminal. Even without root access, an attacker can do much damage to your system.**
## If you already have an express/http server, you can bind the websocket with it
```js
// for express
const http = require('http'),
    express = require('express'),
    {Server} = require('rootless-ssh'),
    app = express(),
    server = http.createServer(app),
    ssh = new Server({},server); // you can put the options in {}

server.listen(3000);
ssh.start(); // recommended to start ssh after starting the server
```

# Client Side
This code would connect to the websocket and you would be able to enter commands on your console.
```js
const { Client } = require('rootless-ssh');

const client = new Client(url /* wss://<hostname>:<port> */,auth /* auth password */);

// to connect
client.connect();

// to disconnect
client.disconnect();

// additionally, you can send commands programmatically by using this
client.send("<commandString>");

// to access the underlying websocket connection
const ws = client.ws()
```
# Custom Commands
Due to the technical limitations, we had to introduce some custom cli commands for certain works.
```yml
dirchange> : Works as a cd or chdir command. Same syntax.
disconnect> : Disconnects from the server.
```
## Connecting from Command Line
Install this package as global<br>
`npm i rootless-ssh -g`

Now from console, run
`wssh "<host>" "<pass>"`
or
`npx wssh "<host>" "<pass>"`

More commands will be introduced as we recieve requests.

# Bugs
While this package is being actively tested, please know that bugs may appear. If you come across a bug, report in the issues tab on our [github](https://github.com/ServerDeveloper9447/rootless-ssh/issues 'Having an issue? Click here').