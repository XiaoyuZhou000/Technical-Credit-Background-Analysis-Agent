import { defineConfig } from 'vite'

// Slidev 51 + Windows: normalize percent-encoded non-ASCII dependency paths.
export default defineConfig({
  plugins: [{
    name: 'normalize-windows-module-paths',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (process.platform !== 'win32') return null
      const normalized = source.includes('%') ? decodeURI(source) : source
      const from = importer?.includes('%') ? decodeURI(importer) : importer
      if (normalized === source && from === importer) return null
      return this.resolve(normalized, from, { skipSelf: true })
    },
  }],
})
