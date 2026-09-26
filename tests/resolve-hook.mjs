import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'vue') {
    return {
      format: 'module',
      shortCircuit: true,
      url: 'file:///Users/gkucmierz/workspace/knowledge-base/node_modules/vue/dist/vue.esm-bundler.js'
    }
  }
  if (specifier === 'minisearch') {
    return {
      format: 'module',
      shortCircuit: true,
      url: 'file:///Users/gkucmierz/workspace/knowledge-base/node_modules/minisearch/dist/es/index.js'
    }
  }

  // If import points to .js but actual file is .ts, resolve to .ts
  if (specifier.endsWith('.js') && context.parentURL) {
    try {
      const candidateUrl = new URL(specifier, context.parentURL)
      const tsUrl = new URL(specifier.replace(/\.js$/, '.ts'), context.parentURL)
      if (!fs.existsSync(fileURLToPath(candidateUrl)) && fs.existsSync(fileURLToPath(tsUrl))) {
        return nextResolve(tsUrl.href, context)
      }
    } catch {
      // fallback to default
    }
  }

  return nextResolve(specifier, context)
}
