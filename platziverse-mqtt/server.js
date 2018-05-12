'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const handleFatalError = (err) => {
  console.error(`${chalk.red('[fatal error]: ')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

const server = new mosca.Server(settings)

// Evento cuando el servidor MQTT esta corriendo
server.on('ready', () => {
  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})

// Evento de cliente conectado
server.on('clientConnected', client => {
  debug(`Client connected: ${client.id}`)
})

// Evento de cliente desconectado
server.on('clientDisconnected', client => {
  debug(`Client disconnected: ${client.id}`)
})

// Evento de captura de mensaje recibido por un cliente
server.on('published', (packet, client) => {
  debug(`Receive: ${packet.topic}`)
  debug(`Receive: ${packet.payload}`)
})

server.on('error', handleFatalError)

process.on('uncaughtException', handleFatalError)
process.on('unhandleRejection', handleFatalError)
