'use strict'

module.exports = function setupMetric (MetricModel, AgentModel) {
  async function findByAgentUuid (uuid) {
    return MetricModel.findAll({
      attributes: ['type'],
      group: ['type'],
      include: [{
        model: AgentModel,
        attributes: [],
        where: { uuid }
      }],
      raw: true
    })
  }

  async function findByTypeAgentUuid (type, uuid) {
    return MetricModel.findAll({
      attributes: [ 'id', 'type', 'value', 'createdAt' ],
      where: { type },
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [{
        model: AgentModel,
        attributes: [],
        where: { uuid }
      }],
      raw: true
    })
  }

  // Método para crear una Metrica
  async function create (uuid, metric) {
    const agent = await AgentModel.findOne({
      where: { uuid }
    })
    if (agent) {
      Object.assign(metric, { agentId: agent.id })
      const result = await MetricModel.create(metric)
      return result.toJSON()
    }
  }

  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  }
}
