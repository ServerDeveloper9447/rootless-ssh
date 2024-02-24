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