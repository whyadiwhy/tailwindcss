let path = require('path')

function resolvePlugin() {
  let base = path.resolve('..', '..')
  let { main } = require(path.resolve('..', '..', 'package.json'))
  return require(path.resolve(base, main))
}

module.exports = {
  plugins: [resolvePlugin()],
}
