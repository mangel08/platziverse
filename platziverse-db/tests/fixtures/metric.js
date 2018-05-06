'use strict'

const agentFixtures = require('./agent')
const utils = require('../../utils')

const extend = utils.extend

const metric = {
  id: 1,
  agentId: 1,
  type: 'CPU',
  value: '18%',
  createdAt: new Date(),
  agent: agentFixtures.byId(1)
}

const metrics = [
  metric,
  extend(metric, { id: 2, value: '25%' }),
  extend(metric, { id: 3, value: '2%' }),
  extend(metric, { id: 4, agentId: 2, type: 'Memory', value: '33%', agent: agentFixtures.byId(2) })
]

module.exports = {
  single: metric,
  all: metrics,
  byAgentUuid: uuid => metrics.filter(a => a.agent['uuid'] === uuid).map(b => b.type).filter((v, i, a) => a.indexOf(v) === i),
  byTypeAgentUuid: (type, uuid) => metrics.filter(a => a.type === type && a.agent['uuid'] === uuid)
    .map(b => {
      const m = {
        id: b.id,
        type: b.type,
        value: b.value,
        createdAt: b.createdAt
      }
      return m
    }).sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })
}
