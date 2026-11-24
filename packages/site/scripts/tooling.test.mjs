import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const loaderRequire = createRequire(import.meta.resolve('@idux/archive-loader-vue'))
const markdownRequire = createRequire(loaderRequire.resolve('@idux/archive-vite-markdown-plugin'))
const { getHighlighter, createHighlightProcessor } = markdownRequire('shiki-processor')

test('Archive highlighting retains annotation and explicit line classes with current Shiki', async () => {
  const highlighter = await getHighlighter({
    themes: ['material-palenight'],
    langs: ['ts'],
    processors: [createHighlightProcessor({ hasHighlightClass: 'highlighted' })],
  })
  try {
    const html = highlighter.codeToHtml('const text = "<script>" // [!code hl]\nconst count = 1', {
      lang: 'ts',
      theme: 'material-palenight',
      lineOptions: [{ line: 2, classes: ['explicit-line'] }],
    })
    assert.match(html, /class="[^"]*highlighted/)
    assert.match(html, /class="[^"]*explicit-line/)
    assert.ok(!html.includes('[!code hl]'))
    assert.ok(!html.includes('<script>'))
    assert.match(html, /(?:&lt;|&#x3c;)script(?:&gt;|>)/i)
  } finally {
    highlighter.dispose()
  }
})
