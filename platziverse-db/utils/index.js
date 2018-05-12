'use strict'

const extend = (obj, values) => {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

const handleFatalError = (err) => {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}

module.exports = {
  extend,
  handleFatalError
}
