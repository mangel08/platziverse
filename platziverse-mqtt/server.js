'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db') // Modulo de conexion a la base de datos
const configDB = require('../utils/properties') // Configuración de la conexión con el modulo de base de datos
const u = require('../utils/utils') // Funciones de Utilidades

/* Configuración del backend del servidor
 * En este caso usaremos redis para persistir los datos */
const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

// Configuración del servidor MQTT
const settings = {
  port: 1883,
  backend
}

let Agent, Metric

const server = new mosca.Server(settings)

// Evento cuando el servidor MQTT esta corriendo
server.on('ready', async () => {
  // Conexion a la base de datos
  const services = await db(configDB).catch(u.handleFatalError)

  // Instanciando los servicios de Agente y Metricas de la base de datos
  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
  console.log(`${chalk.green('[platziverse-mqtt]')} connection in database success`)

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

server.on('error', u.handleFatalError)

process.on('uncaughtException', u.handleFatalError)
process.on('unhandleRejection', u.handleFatalError)
