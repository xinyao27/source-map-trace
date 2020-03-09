'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/source-map-trace.cjs.min.js')
} else {
  module.exports = require('./dist/source-map-trace.cjs.js')
}

module.exports.default = module.exports
