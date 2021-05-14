let { spawn } = require('child_process')

module.exports = function $(command) {
  let args = command.split(' ')
  command = args.shift()

  return new Promise((resolve, reject) => {
    let child = spawn(command, args, {
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
