'use strict'

const db = require('../')
const util = require('../utils/')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'miguel',
    password: process.env.DB_PASS || 'miguel',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(util.handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(util.handleFatalError)

  console.log('--agent--')
  console.log(agent)

  const agents = await Agent.findAll().catch(util.handleFatalError)

  console.log('--agents--')
  console.log(agents)

  const metric = await Metric.create(agent.uuid, {
    type: 'Memory',
    value: '300'
  }).catch(util.handleFatalError)

  console.log('--metric--')
  console.log(metric)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(util.handleFatalError)

  console.log('--metrics By Agent--')
  console.log(metrics)

  const metricsByType = await Metric.findByTypeAgentUuid('Memory',agent.uuid).catch(util.handleFatalError)
  console.log('--metricsByTypeAgentUuid--')
  console.log(metricsByType)
}

run()
