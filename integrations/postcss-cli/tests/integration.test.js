let path = require('path')
let { rm } = require('fs')
let fs = require('fs/promises')
let $ = require('../execute')

let output = path.resolve(__filename, '../../dist')

beforeAll((done) => rm(output, { recursive: true, force: true }, done))
afterEach((done) => rm(output, { recursive: true, force: true }, done))

// Small helper to allow for css highlighting / formatting in most editors.
function css(templates) {
  return templates.join('')
}

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
