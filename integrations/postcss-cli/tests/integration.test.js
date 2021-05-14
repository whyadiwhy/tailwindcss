let path = require('path')
let { rm } = require('fs')
let fs = require('fs/promises')
let $ = require('../execute')

let input = path.resolve(__filename, '../../src')
let output = path.resolve(__filename, '../../dist')

beforeAll((done) => rm(output, { recursive: true, force: true }, done))
afterEach((done) => rm(output, { recursive: true, force: true }, done))

// Small helper to allow for css highlighting / formatting in most editors.
function css(templates) {
  return templates.join('')
}

let state = { input: '' }
beforeEach(async () => {
  state.input = await fs.readFile(path.resolve(input, 'index.html'), 'utf8')
})
afterEach(async () => {
  await fs.writeFile(path.resolve(input, 'index.html'), state.input, 'utf8')
})

it('should be possible to generate tailwind output using postcss cli', async () => {
  await $('postcss ./src/index.css -o ./dist/main.css', {
    env: { NODE_ENV: 'production' },
  })

  expect(await fs.readFile(path.resolve(output, 'main.css'), 'utf8')).toMatchCss(
    css`
      *,
      ::before,
      ::after {
        --tw-border-opacity: 1;
        border-color: rgba(229, 231, 235, var(--tw-border-opacity));
      }
      * {
        --tw-shadow: 0 0 #0000;
        --tw-ring-inset: var(--tw-empty, /*!*/ /*!*/);
        --tw-ring-offset-width: 0px;
        --tw-ring-offset-color: #fff;
        --tw-ring-color: rgba(59, 130, 246, 0.5);
        --tw-ring-offset-shadow: 0 0 #0000;
        --tw-ring-shadow: 0 0 #0000;
      }
      .font-bold {
        font-weight: 700;
      }
    `
  )
})

function wait(cb) {
  return new Promise((resolve) => {
    let timer = setInterval(async () => {
      if (await cb()) {
        resolve()
        clearInterval(timer)
      }
    }, 5)
  })
}

it('should be possible to make changes in a running process', async () => {
  let abort = new AbortController()
  let runningProcess = $('postcss ./src/index.css -o ./dist/main.css -w', {
    signal: abort.signal,
    env: { TAILWIND_MODE: 'watch' },
  })

  let state = { modified: 0 }

  // Wait until the main.css file is created
  await wait(async () => {
    try {
      let { mtimeMs } = await fs.stat(path.resolve(output, 'main.css'))
      state.modified = mtimeMs
      return true
    } catch {
      return false
    }
  })

  expect(await fs.readFile(path.resolve(output, 'main.css'), 'utf8')).toMatchCss(
    css`
      *,
      ::before,
      ::after {
        --tw-border-opacity: 1;
        border-color: rgba(229, 231, 235, var(--tw-border-opacity));
      }
      * {
        --tw-shadow: 0 0 #0000;
        --tw-ring-inset: var(--tw-empty, /*!*/ /*!*/);
        --tw-ring-offset-width: 0px;
        --tw-ring-offset-color: #fff;
        --tw-ring-color: rgba(59, 130, 246, 0.5);
        --tw-ring-offset-shadow: 0 0 #0000;
        --tw-ring-shadow: 0 0 #0000;
      }
      .font-bold {
        font-weight: 700;
      }
    `
  )

  await fs.appendFile(
    path.resolve(input, 'index.html'),
    '\n<div class="font-normal"></div>',
    'utf8'
  )

  await wait(async () => {
    try {
      let stat = await fs.stat(path.resolve(output, 'main.css'))
      return state.modified < stat.mtimeMs
    } catch {
      return false
    }
  })

  expect(await fs.readFile(path.resolve(output, 'main.css'), 'utf8')).toMatchCss(
    css`
      *,
      ::before,
      ::after {
        --tw-border-opacity: 1;
        border-color: rgba(229, 231, 235, var(--tw-border-opacity));
      }
      * {
        --tw-shadow: 0 0 #0000;
        --tw-ring-inset: var(--tw-empty, /*!*/ /*!*/);
        --tw-ring-offset-width: 0px;
        --tw-ring-offset-color: #fff;
        --tw-ring-color: rgba(59, 130, 246, 0.5);
        --tw-ring-offset-shadow: 0 0 #0000;
        --tw-ring-shadow: 0 0 #0000;
      }
      .font-bold {
        font-weight: 700;
      }
      .font-normal {
        font-weight: 400;
      }
    `
  )

  abort.abort()

  await runningProcess
})
