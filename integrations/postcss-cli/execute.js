let path = require('path')
let { spawn } = require('child_process')

module.exports = function $(command, options = {}) {
  let args = command.split(' ')
  command = args.shift()
  command = path.resolve(__dirname, 'node_modules', '.bin', command)

  return new Promise((resolve, reject) => {
    let child = spawn(command, args, {
      ...options,
      env: {
        ...process.env,
        ...options.env,
      },
      cwd: __dirname,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data
    })

    child.stderr.on('data', (data) => {
      stderr += data
    })

    child.on('close', (code) => {
      ;(code === 0 ? resolve : reject)({ code, stdout, stderr })
    })
  })
}
