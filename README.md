# vue-minisearch

> Vue 3 Composition API integration for [MiniSearch](https://github.com/lucaong/minisearch) with 1:1 API parity with [react-minisearch](https://github.com/lucaong/react-minisearch).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6.svg)](https://www.typescriptlang.org/)
[![MiniSearch](https://img.shields.io/badge/MiniSearch-7.x-orange.svg)](https://github.com/lucaong/minisearch)

`vue-minisearch` is a lightweight, reactive Vue 3 wrapper around **MiniSearch**, the tiny but powerful client-side full-text search engine. It provides the `useMiniSearch` composable designed as a direct counterpart to `react-minisearch`.

---

## ✨ Features

- **⚡ Blazing Fast Client-Side Search:** In-memory full-text search with prefix search, fuzzy matching, and field boosts powered by MiniSearch.
- **🎯 1:1 Parity with `react-minisearch`:** Same API, method names, and mental model. Effortless migration between React and Vue.
- **🔄 Idiomatic Vue 3 Reactivity:** Pass plain arrays, `Ref`, `ComputedRef`, or getter functions. Re-indexes automatically when reactive sources change.
- **🛡️ High Performance (Zero Proxy Overhead):** Utilizes `shallowRef` to prevent Vue from recursively proxying MiniSearch's internal Radix Tree data structures.
- **📘 Written in TypeScript:** Full generic support (`useMiniSearch<T>()`) and complete type inference for `searchResults`, suggestions, and options.
- **📦 Zero Extra Dependencies:** Only requires `vue` and `minisearch` as peer dependencies.

---

## 📦 Installation

```bash
npm install vue-minisearch minisearch
# or with pnpm
pnpm add vue-minisearch minisearch
# or with yarn
yarn add vue-minisearch minisearch
```

---

## 🚀 Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useMiniSearch } from 'vue-minisearch'

interface Article {
  id: number
  title: string
  category: string
}

const articles = ref<Article[]>([
  { id: 1, title: 'macOS UI Services Runbook', category: 'system' },
  { id: 2, title: 'Zero FOUC with VitePress', category: 'frontend' },
  { id: 3, title: 'Envelope Encryption Vault', category: 'security' }
])

const { search, searchResults, autoSuggest, suggestions } = useMiniSearch(articles, {
  fields: ['title', 'category'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2
  }
})
</script>

<template>
  <div class="search-container">
    <input
      type="text"
      placeholder="Search articles..."
      @input="e => {
        const q = (e.target as HTMLInputElement).value
        search(q)
        autoSuggest(q)
      }"
    />

    <!-- Suggestions List -->
    <ul v-if="suggestions" class="suggestions-list">
      <li v-for="s in suggestions" :key="s.suggestion" @click="search(s.suggestion)">
        {{ s.suggestion }}
      </li>
    </ul>

    <!-- Search Results -->
    <ul v-if="searchResults" class="results-list">
      <li v-for="item in searchResults" :key="item.id">
        <h3>{{ item.title }}</h3>
        <span>{{ item.category }}</span>
      </li>
    </ul>
  </div>
</template>
```

---

## 📖 API Reference

### `useMiniSearch<T>(documents, options)`

```typescript
function useMiniSearch<T = any>(
  documents: MaybeRefOrGetter<readonly T[]>,
  options: UseMiniSearchOptions<T>
): UseMiniSearch<T>
```

#### Parameters

- **`documents`**: Array of document objects, or a reactive `Ref<T[]>`, `ComputedRef<T[]>`, or getter function `() => T[]`.
- **`options`**: MiniSearch options:
  - `fields`: Array of field names to index (e.g. `['title', 'content']`).
  - `idField` *(optional)*: Name of ID property or extractor function (default: `'id'`).
  - `storeFields` *(optional)*: Fields to store in index.
  - `searchOptions` *(optional)*: Default search options applied to queries (fuzzy, prefix, boost, etc.).
  - `autoIndex` *(optional)*: Whether to automatically re-index when reactive `documents` change (default: `true`).

#### Return Value (`UseMiniSearch<T>`)

| Property / Method | Type | Description |
| :--- | :--- | :--- |
| `search` | `(query: Query, options?: SearchOptions) => void` | Execute a search query. |
| `searchResults` | `Ref<T[] \| null>` | Array of matched document objects, or `null` if no search active. |
| `rawResults` | `Ref<SearchResult[] \| null>` | Raw MiniSearch results with `id`, `score`, `match`, and `terms`. |
| `clearSearch` | `() => void` | Clears `searchResults` and `rawResults` back to `null`. |
| `autoSuggest` | `(query: string, options?: SearchOptions) => void` | Fetch auto-suggestions for prefix text. |
| `suggestions` | `Ref<Suggestion[] \| null>` | Array of auto-suggestion items, or `null`. |
| `clearSuggestions` | `() => void` | Resets `suggestions` back to `null`. |
| `add` | `(document: T) => void` | Add a single document to the index and document store. |
| `addAll` | `(documents: readonly T[]) => void` | Add multiple documents synchronously. |
| `addAllAsync` | `(documents: readonly T[], options?) => Promise<void>` | Add multiple documents in async chunks without blocking UI. |
| `getById` | `(id: any) => T \| null` | Retrieve stored document by its ID. |
| `remove` | `(document: T) => void` | Remove a document from index and store. |
| `removeById` | `(id: any) => void` | Remove a document by its ID. |
| `removeAll` | `(documents?: readonly T[]) => void` | Remove all documents or a specific subset. |
| `discard` | `(id: any) => void` | Soft-discard a document by ID immediately without vacuuming. |
| `discardAll` | `(ids: readonly any[]) => void` | Soft-discard multiple documents by IDs. |
| `replace` | `(document: T) => void` | Replace an existing document with updated version. |
| `isIndexing` | `Ref<boolean>` | `true` while an asynchronous indexing task is active. |
| `miniSearch` | `ShallowRef<MiniSearch<T>>` | Direct access to the underlying MiniSearch engine instance. |

---

## 🔄 Comparison with `react-minisearch`

| Feature | `react-minisearch` | `vue-minisearch` |
| :--- | :--- | :--- |
| **Search Method** | `search(query, opts)` | `search(query, opts)` |
| **Search Results** | `searchResults: T[] \| null` | `searchResults: Ref<T[] \| null>` |
| **Raw Match Scores** | `rawResults: SearchResult[] \| null` | `rawResults: Ref<SearchResult[] \| null>` |
| **Suggestions** | `autoSuggest(query, opts)` | `autoSuggest(query, opts)` |
| **Mutators** | `add`, `addAll`, `addAllAsync`, `replace` | `add`, `addAll`, `addAllAsync`, `replace` |
| **Removers** | `remove`, `removeById`, `removeAll`, `discard` | `remove`, `removeById`, `removeAll`, `discard` |
| **Lookup** | `getById(id)` | `getById(id)` |
| **Indexing Flag** | `isIndexing: boolean` | `isIndexing: Ref<boolean>` |
| **Engine Access** | `miniSearch: MiniSearch<T>` | `miniSearch: ShallowRef<MiniSearch<T>>` |
| **Reactive Sync** | Manual / hook re-render | **Automatic `watch()` with `autoIndex`** |
| **Data Types** | Static array | **Plain Array, `Ref`, `computed`, getter** |

---

## 🧪 Testing & Verification

The test suite runs with Node's native test runner (`node:test`) and strictly validates:
1. **Tier 1 (Unit):** 24 unit tests covering every single method, mutator, suggestion, and reactive edge case.
2. **Tier 2 (Integration):** 7 cross-framework parity tests ensuring identical behavior to `react-minisearch` and zero DOM nesting divergence.

```bash
npm test
```

---

## 📄 License

MIT © [Grzegorz Kućmierz](https://github.com/gkucmierz)
