export interface Item {
  id: string
  title: string
  category: string
  tags: string[]
  summary: string
  author: string
  stars: number
}

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'vue',
    title: 'Vue.js',
    category: 'Frontend Framework',
    tags: ['javascript', 'typescript', 'reactive', 'composition-api', 'ui'],
    summary: 'The Progressive JavaScript Framework for building modern web user interfaces with exceptional developer ergonomics.',
    author: 'Evan You',
    stars: 208000
  },
  {
    id: 'minisearch',
    title: 'MiniSearch',
    category: 'Search Engine',
    tags: ['search', 'fulltext', 'fuzzy', 'prefix', 'radix-tree', 'in-memory'],
    summary: 'Tiny yet powerful in-memory full-text search engine written in TypeScript with prefix search, fuzzy matching, and field boosts.',
    author: 'Luca Ongaro',
    stars: 3800
  },
  {
    id: 'vue-minisearch',
    title: 'vue-minisearch',
    category: 'Vue Composable',
    tags: ['vue', 'minisearch', 'composition-api', 'search', 'reactive'],
    summary: 'Vue 3 Composition API hook for MiniSearch with 1:1 API parity with react-minisearch and automatic reactive synchronization.',
    author: 'Grzegorz Kućmierz',
    stars: 1
  },
  {
    id: 'dport',
    title: 'dport',
    category: 'Developer Tooling',
    tags: ['port', 'deterministic', 'cli', 'color-system', 'hash', 'dev-server'],
    summary: 'Deterministic local port and brand color generator based on project name hash, eliminating port collisions forever.',
    author: 'Grzegorz Kućmierz',
    stars: 42
  },
  {
    id: 'react',
    title: 'React',
    category: 'Frontend Framework',
    tags: ['javascript', 'jsx', 'declarative', 'virtual-dom', 'ui'],
    summary: 'The library for web and native user interfaces powered by component-based declarative view rendering.',
    author: 'Meta & Community',
    stars: 228000
  },
  {
    id: 'svelte',
    title: 'Svelte',
    category: 'Frontend Framework',
    tags: ['compiler', 'reactive', 'runes', 'zero-runtime', 'frontend'],
    summary: 'Cybernetically enhanced web apps with compile-time reactivity, eliminating virtual DOM overhead completely.',
    author: 'Rich Harris',
    stars: 78000
  },
  {
    id: 'vite',
    title: 'Vite',
    category: 'Build Tool',
    tags: ['bundler', 'esbuild', 'rollup', 'hmr', 'esm', 'dx'],
    summary: 'Next Generation Frontend Tooling providing instantaneous server start and lightning-fast Hot Module Replacement (HMR).',
    author: 'Evan You',
    stars: 69000
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    category: 'Programming Language',
    tags: ['javascript', 'types', 'compiler', 'static-analysis', 'microsoft'],
    summary: 'Typed superset of JavaScript that compiles to plain JavaScript, enabling robust refactoring and compile-time guarantees.',
    author: 'Microsoft',
    stars: 101000
  },
  {
    id: 'pinia',
    title: 'Pinia',
    category: 'State Management',
    tags: ['vue', 'store', 'state', 'devtools', 'typescript'],
    summary: 'The intuitive, type-safe and flexible store for Vue 3 that replaces Vuex with a clean Composition API design.',
    author: 'Eduardo San Martin Morote',
    stars: 13000
  },
  {
    id: 'tailwind',
    title: 'Tailwind CSS',
    category: 'CSS Framework',
    tags: ['css', 'utility-first', 'design', 'responsive', 'styling'],
    summary: 'A utility-first CSS framework packed with classes that can be composed to build any design directly in markup.',
    author: 'Adam Wathan',
    stars: 82000
  },
  {
    id: 'rust',
    title: 'Rust',
    category: 'Programming Language',
    tags: ['systems', 'memory-safety', 'performance', 'borrow-checker', 'concurrency'],
    summary: 'Empowering everyone to build reliable and efficient software with fearless concurrency and guaranteed memory safety.',
    author: 'Rust Foundation',
    stars: 97000
  },
  {
    id: 'sqlite',
    title: 'SQLite',
    category: 'Database',
    tags: ['sql', 'embedded', 'acid', 'zero-config', 'c'],
    summary: 'Small, fast, self-contained, high-reliability, full-featured SQL database engine utilized in billions of devices.',
    author: 'D. Richard Hipp',
    stars: 8500
  },
  {
    id: 'duckdb',
    title: 'DuckDB',
    category: 'Database',
    tags: ['olap', 'columnar', 'embedded', 'sql', 'analytics'],
    summary: 'An in-process SQL OLAP database management system designed for fast analytical queries directly in the application.',
    author: 'DuckDB Foundation',
    stars: 26000
  },
  {
    id: 'redis',
    title: 'Redis',
    category: 'Database',
    tags: ['in-memory', 'cache', 'key-value', 'pubsub', 'low-latency'],
    summary: 'In-memory data structure store used as a distributed, in-memory key-value database, cache, and message broker.',
    author: 'Salvatore Sanfilippo',
    stars: 67000
  },
  {
    id: 'postgresql',
    title: 'PostgreSQL',
    category: 'Database',
    tags: ['sql', 'relational', 'acid', 'jsonb', 'extensible'],
    summary: 'The World most advanced open source relational database with over 35 years of active engineering and rock-solid reliability.',
    author: 'PostgreSQL Global Dev Group',
    stars: 16000
  },
  {
    id: 'docker',
    title: 'Docker',
    category: 'DevOps / Container',
    tags: ['containers', 'linux', 'cgroups', 'virtualization', 'images'],
    summary: 'Accelerates how you build, share, and run modern applications using lightweight, isolated OS-level containers.',
    author: 'Solomon Hykes',
    stars: 69000
  },
  {
    id: 'lucide',
    title: 'Lucide Icons',
    category: 'Design System',
    tags: ['icons', 'svg', 'feather', 'vector', 'design'],
    summary: 'Beautiful & consistent icon toolkit made by the community, providing lightweight vector SVG icons for every framework.',
    author: 'Lucide Contributors',
    stars: 15000
  },
  {
    id: 'katex',
    title: 'KaTeX',
    category: 'Math Rendering',
    tags: ['latex', 'math', 'typesetting', 'fast', 'khan-academy'],
    summary: 'The fastest math typesetting library for the web, rendering complex TeX mathematical formulas directly to clean HTML.',
    author: 'Khan Academy',
    stars: 18000
  },
  {
    id: 'mermaid',
    title: 'Mermaid',
    category: 'Data Visualization',
    tags: ['diagrams', 'flowcharts', 'markdown', 'charts', 'svg'],
    summary: 'JavaScript based diagramming and charting tool that uses Markdown-inspired text definitions and a renderer to generate diagrams.',
    author: 'Knut Sveidqvist',
    stars: 74000
  },
  {
    id: 'esbuild',
    title: 'esbuild',
    category: 'Build Tool',
    tags: ['bundler', 'minifier', 'go', 'blazing-fast', 'compiler'],
    summary: 'An extremely fast bundler for the web written in Go, 10-100x faster than legacy JavaScript bundlers.',
    author: 'Evan Wallace',
    stars: 38000
  },
  {
    id: 'bun',
    title: 'Bun',
    category: 'Runtime / Tooling',
    tags: ['runtime', 'zig', 'javascript', 'package-manager', 'bundler'],
    summary: 'All-in-one JavaScript runtime, package manager, test runner, and bundler designed as a drop-in replacement for Node.js.',
    author: 'Jarred Sumner',
    stars: 75000
  },
  {
    id: 'astro',
    title: 'Astro',
    category: 'Fullstack Framework',
    tags: ['islands', 'static-site', 'ssg', 'zero-js', 'content'],
    summary: 'The web framework for content-driven websites with Islands Architecture for zero-JavaScript by default.',
    author: 'Fred K. Schott',
    stars: 49000
  },
  {
    id: 'vitest',
    title: 'Vitest',
    category: 'Testing Framework',
    tags: ['test-runner', 'vite', 'esm', 'jest-compatible', 'fast'],
    summary: 'A next generation testing framework powered by Vite with blazing-fast watch mode and out-of-the-box ESM and TypeScript.',
    author: 'Anthony Fu & Vitest Team',
    stars: 14000
  },
  {
    id: 'zod',
    title: 'Zod',
    category: 'Validation',
    tags: ['schema', 'validation', 'typescript', 'inference', 'types'],
    summary: 'TypeScript-first schema declaration and validation library with static type inference and zero dependencies.',
    author: 'Colin McDonnell',
    stars: 35000
  }
]
