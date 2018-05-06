'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () { }
}

let uuid = 'yyy-yyy-yyy'
let type = 'CPU'
let MetricStub = null
let AgentStub = null
let db = null
let sandbox = null

let uuidArgs = {
  where: { uuid }
}

let metricUuidArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let typeUuidArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let newMetric = {
  agentId: 1,
  type: 'CPU',
  value: '18%'
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  MetricStub = {
    belongsTo: sinon.spy()
  }

  AgentStub = {
    hasMany: sinon.spy()
  }

  // Model Create Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({ toJSON () { return newMetric } }))

  metricUuidArgs.include[0].model = AgentStub
  typeUuidArgs.include[0].model = AgentStub

  // Metric FindAll Stub
  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all))
  MetricStub.findAll.withArgs(metricUuidArgs).returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)))
  MetricStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(metricFixtures.byTypeAgentUuid(type, uuid)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Setup Metric', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('Metric#create', async t => {
  let metric = await db.Metric.create(uuid, newMetric)

  t.true(AgentStub.findOne.called, 'findOne should be called on AgentModel')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuidArgs')
  t.true(MetricStub.create.called, 'create should be called on model')
  t.true(MetricStub.create.calledOnce, 'create should be called once')
  t.true(MetricStub.create.calledWith(newMetric), 'create should be called with args newAgent')

  t.deepEqual(metric, newMetric, 'metric should be the same')
})

test.serial('Metric#findByAgentUuid', async t => {
  let metrics = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(metricUuidArgs), 'findAll should be called with metricUuidArgs')

  t.is(metrics.length, metricFixtures.byAgentUuid(uuid).length, 'metrics should be the same lenght')
  t.deepEqual(metrics, metricFixtures.byAgentUuid(uuid), 'metrics should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  let metrics = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(typeUuidArgs), 'findAll should be called with typeUuidArgs')

  t.is(metrics.length, metricFixtures.byTypeAgentUuid(type, uuid).length, 'metrics should be the same lenght')
  t.deepEqual(metrics, metricFixtures.byTypeAgentUuid(type, uuid), 'metrics should be the same')
})
