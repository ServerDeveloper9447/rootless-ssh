#! /usr/bin/env node
const args = process.argv.slice(2)

const Client = require('./client.js')
const cli = new Client(args[0], args[1])
cli.connect()