<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMiniSearch } from 'vue-minisearch'
import { INITIAL_ITEMS, type Item } from './data'

// Reactive state
const items = ref<Item[]>([...INITIAL_ITEMS])
const query = ref<string>('')
const fuzzy = ref<number>(0.2)
const prefix = ref<boolean>(true)
const titleBoost = ref<number>(4)
const searchTimeMs = ref<number>(0)

// Dynamic fill progress percentage for custom sliders
const fuzzyProgress = computed(() => `${((fuzzy.value / 0.4) * 100).toFixed(1)}%`)
const titleBoostProgress = computed(() => `${(((titleBoost.value - 1) / 7) * 100).toFixed(1)}%`)

// Document extractor for MiniSearch
const extractField = (item: Item, field: string): any => {
  if (field === 'tags') return item.tags.join(' ')
  return (item as any)[field] ?? ''
}

// MiniSearch options computed based on interactive controls
const options = computed(() => ({
  fields: ['title', 'category', 'tags', 'summary', 'author'],
  storeFields: ['id', 'title', 'category', 'tags', 'summary', 'author', 'stars'],
  extractField,
  searchOptions: {
    boost: { title: titleBoost.value, tags: 2.5, category: 2, summary: 1 },
    fuzzy: fuzzy.value > 0 ? fuzzy.value : false,
    prefix: prefix.value
  }
}))

// Initialize reactive useMiniSearch composable directly from sources
const {
  search,
  searchResults,
  autoSuggest,
  suggestions,
  clearSearch
} = useMiniSearch<Item>(items, options.value)

// Watch query and options changes to perform live search with latency measurement
watch(
  [query, fuzzy, prefix, titleBoost],
  ([q]) => {
    const start = performance.now()
    if (!q || q.trim() === '') {
      clearSearch()
      autoSuggest('')
      searchTimeMs.value = 0
    } else {
      search(q.trim(), options.value.searchOptions)
      autoSuggest(q.trim(), options.value.searchOptions)
      searchTimeMs.value = Number((performance.now() - start).toFixed(2))
    }
  },
  { immediate: true }
)

// List of displayed items: searchResults if query active, else all items
const displayedItems = computed(() => {
  if (!query.value || query.value.trim() === '') {
    return items.value
  }
  return searchResults.value || []
})

// Reactive Mutator Demo: Add custom dynamic item
const addDemoItem = () => {
  const customId = `custom-${Date.now()}`
  const newItem: Item = {
    id: customId,
    title: `QuantumDB ${Math.floor(Math.random() * 100)}`,
    category: 'Next-Gen Database',
    tags: ['quantum', 'high-throughput', 'in-memory', 'realtime'],
    summary: 'A dynamically added ultra-fast distributed storage engine injected at runtime.',
    author: 'You (Runtime)',
    stars: 999
  }
  items.value.unshift(newItem)
  query.value = 'QuantumDB'
}

// Remove item from reactive source
const removeItem = (id: string) => {
  items.value = items.value.filter(i => i.id !== id)
}

// Reset dataset
const resetItems = () => {
  items.value = [...INITIAL_ITEMS]
  query.value = ''
}

// Quick fill query helper
const applySuggestion = (term: string) => {
  query.value = term
}
</script>

<template>
  <div class="app-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="brand">
          <div class="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="var(--accent-mint)" stroke="var(--accent-dark)" />
            </svg>
          </div>
          <div>
            <h1><span class="title-gradient">vue-minisearch</span> <span class="badge">v1.0.0</span></h1>
            <p class="subtitle">Vue 3 Composition API full-text search with 1:1 react-minisearch parity</p>
          </div>
        </div>

        <div class="header-links">
          <a href="https://gitea.7u.pl/gkucmierz/vue-minisearch" target="_blank" rel="noopener" class="link-btn gitea">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8h-1V7a5 5 0 0 0-10 0v1H7a3 3 0 0 0-3 3v4a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-4a3 3 0 0 0-3-3zm-9-1a3 3 0 0 1 6 0v1h-6V7zm8 7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3z"/>
            </svg>
            Gitea
          </a>
          <a href="https://github.com/gkucmierz/vue-minisearch" target="_blank" rel="noopener" class="link-btn github">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/vue-minisearch" target="_blank" rel="noopener" class="link-btn primary npm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.13h13.74v13.74h-3.435V8.565h-3.435v10.305H5.13z"/>
            </svg>
            npm
          </a>
        </div>
      </div>
    </header>

    <main class="main-layout">
      <!-- Search & Controls Section -->
      <section class="controls-card">
        <!-- Search Input Bar -->
        <div class="search-bar">
          <svg class="search-glyph" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            v-model="query"
            type="text"
            placeholder="Search libraries, tags, authors, or tools (try 'reakt', 'vue', 'db', 'rust')..."
            class="main-input"
            autofocus
          />
          <button v-if="query" class="clear-icon-btn" aria-label="Clear search query" @click="query = ''">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Auto-Suggest Pills -->
        <div v-if="suggestions && suggestions.length > 0" class="suggestions-bar">
          <span class="suggestions-label">Suggestions:</span>
          <button
            v-for="s in suggestions"
            :key="s.suggestion"
            class="suggestion-chip"
            @click="applySuggestion(s.suggestion)"
          >
            {{ s.suggestion }}
          </button>
        </div>

        <!-- Tuning Controls -->
        <div class="tuning-grid">
          <div class="tune-item">
            <div class="tune-header">
              <label>Fuzzy Match (Typos)</label>
              <span class="tune-val">{{ fuzzy }}</span>
            </div>
            <div class="control-row">
              <input
                v-model.number="fuzzy"
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                class="slider"
                :style="{ '--fill-pct': fuzzyProgress }"
                aria-label="Fuzzy matching threshold"
              />
            </div>
          </div>

          <div class="tune-item">
            <div class="tune-header">
              <label>Title Boost</label>
              <span class="tune-val">{{ titleBoost }}x</span>
            </div>
            <div class="control-row">
              <input
                v-model.number="titleBoost"
                type="range"
                min="1"
                max="8"
                step="0.5"
                class="slider"
                :style="{ '--fill-pct': titleBoostProgress }"
                aria-label="Title boost multiplier"
              />
            </div>
          </div>

          <div class="tune-item">
            <div class="tune-header">
              <label>Prefix Search</label>
              <span class="tune-val">{{ prefix ? 'ON' : 'OFF' }}</span>
            </div>
            <div class="control-row">
              <label class="nano-switch color-emerald" :class="{ 'is-checked': prefix }">
                <input
                  v-model="prefix"
                  type="checkbox"
                  class="nano-switch-input"
                  role="switch"
                  :aria-checked="prefix"
                />
                <div class="nano-switch-slider"></div>
                <span class="nano-switch-label">'vu' → 'vue'</span>
              </label>
            </div>
          </div>

          <div class="tune-item">
            <div class="tune-header">
              <label>Dataset Actions</label>
              <span class="tune-val">autoIndex</span>
            </div>
            <div class="control-row actions-box">
              <button class="action-btn add-btn" @click="addDemoItem">
                + Inject Doc
              </button>
              <button class="action-btn reset-btn" @click="resetItems">
                ↺ Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Search Status Bar -->
        <div class="status-bar">
          <div class="status-left">
            <span class="metric-pill">
              <strong>{{ displayedItems.length }}</strong> of {{ items.length }} documents
            </span>
            <span v-if="query" class="metric-pill speed">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Search time: <strong>{{ searchTimeMs }} ms</strong>
            </span>
          </div>

          <div class="status-right">
            <span class="autoindex-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              autoIndex: active
            </span>
          </div>
        </div>
      </section>

      <!-- Results Grid -->
      <section class="results-grid">
        <article v-for="item in displayedItems" :key="item.id" class="result-card">
          <div class="card-header">
            <div>
              <div class="card-category">{{ item.category }}</div>
              <h2 class="card-title">{{ item.title }}</h2>
            </div>
            <button class="card-remove-btn" aria-label="Remove item" @click="removeItem(item.id)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <p class="card-summary">{{ item.summary }}</p>

          <div class="card-tags">
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="tag-pill"
              @click="applySuggestion(tag)"
            >
              #{{ tag }}
            </span>
          </div>

          <div class="card-footer">
            <span class="card-author">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {{ item.author }}
            </span>
            <span class="card-stars">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {{ item.stars.toLocaleString() }}
            </span>
          </div>
        </article>

        <!-- Empty State -->
        <div v-if="displayedItems.length === 0" class="empty-state">
          <svg class="empty-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <h3>No matching results for "{{ query }}"</h3>
          <p>Try increasing the Fuzzy slider to tolerate more typos or adjust search terms.</p>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>MIT © 2026 Grzegorz Kućmierz • Built with Vue 3 + TypeScript + MiniSearch</p>
    </footer>
  </div>
</template>

<style>
:root {
  /* Native Light Palette */
  --bg-page: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-subtle: #f1f5f9;
  --bg-surface-hover: #e2e8f0;
  
  --border-subtle: #f1f5f9;
  --border-main: #e2e8f0;
  --border-hover: #cbd5e1;
  
  --text-main: #0f172a;
  --text-muted: #475569;
  --text-subtle: #94a3b8;
  
  /* Deterministic Mint-Green Accent (hue: 154, #4ce6a3) */
  --accent: #10b981;
  --accent-mint: #4ce6a3;
  --accent-dark: #059669;
  --accent-bg: #ecfdf5;
  --accent-border: #a7f3d0;
  --accent-text: #065f46;
  --focus-ring: rgba(16, 185, 129, 0.22);
  
  --radius: 12px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
  --shadow-card-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  
  --nano-duration-fast: 150ms;
  --nano-duration-medium: 250ms;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-page);
  background-image: 
    radial-gradient(ellipse 90% 50% at 50% -10%, rgba(76, 230, 163, 0.18), transparent 70%),
    radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.03), transparent 40%),
    radial-gradient(circle at 90% 15%, rgba(16, 185, 129, 0.05), transparent 40%);
  background-attachment: fixed;
  color: var(--text-main);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 20px;
}

/* Header */
.header {
  margin-bottom: 28px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-dark);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.14);
  -webkit-user-select: none;
  user-select: none;
}

h1 {
  font-size: 1.65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-main);
  letter-spacing: -0.025em;
}

.title-gradient {
  background: linear-gradient(135deg, #0f172a 40%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.badge {
  font-size: 0.75rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: var(--accent-text);
  border: 1px solid var(--accent-border);
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
  -webkit-user-select: none;
  user-select: none;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.header-links {
  display: flex;
  gap: 10px;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 9px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: var(--text-main);
  border: 1px solid var(--border-main);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all var(--nano-duration-fast) ease;
  -webkit-user-select: none;
  user-select: none;
  outline: none;
}

.link-btn:hover {
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
  border-color: var(--border-hover);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.link-btn.primary.npm {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border-color: #059669;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.28);
}

.link-btn.primary.npm:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

/* Controls Card */
.controls-card {
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 22px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
  position: relative;
  overflow: hidden;
}

.controls-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4ce6a3 0%, #10b981 50%, #059669 100%);
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
}

.search-glyph {
  position: absolute;
  left: 18px;
  color: var(--text-subtle);
  pointer-events: none;
  z-index: 2;
}

.main-input {
  width: 100%;
  padding: 16px 44px 16px 50px;
  background: var(--bg-page);
  border: 1px solid var(--border-main);
  border-radius: 10px;
  font-size: 1.05rem;
  color: var(--text-main);
  outline: none;
  transition: all var(--nano-duration-fast) ease;
}

.main-input:focus {
  background: #ffffff;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(76, 230, 163, 0.25), 0 2px 8px rgba(16, 185, 129, 0.08);
}

.clear-icon-btn {
  position: absolute;
  right: 14px;
  background: transparent;
  border: none;
  color: var(--text-subtle);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: color var(--nano-duration-fast) ease;
  outline: none;
}

.clear-icon-btn:hover {
  color: var(--text-main);
}

/* Suggestions Bar */
.suggestions-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  font-size: 0.85rem;
}

.suggestions-label {
  color: var(--text-muted);
  font-weight: 500;
  -webkit-user-select: none;
  user-select: none;
}

.suggestion-chip {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid var(--accent-border);
  color: var(--accent-text);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--nano-duration-fast) ease;
  -webkit-user-select: none;
  user-select: none;
  outline: none;
}

.suggestion-chip:hover {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #6ee7b7;
}

/* Tuning Grid */
.tuning-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
  padding: 16px 0;
  border-top: 1px solid var(--border-main);
  border-bottom: 1px solid var(--border-main);
}

.tune-item {
  display: flex;
  flex-direction: column;
}

.tune-item label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
  -webkit-user-select: none;
  user-select: none;
}

.tune-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  min-height: 18px;
}

.tune-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: var(--accent-dark);
  font-weight: 600;
}

/* Common Control Row for strict vertical alignment */
.control-row {
  height: 32px;
  display: flex;
  align-items: center;
}

/* Custom Light-Theme Range Sliders (zero dark/black default tracks) */
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: linear-gradient(
    to right,
    var(--accent) 0%,
    var(--accent) var(--fill-pct, 50%),
    var(--border-main) var(--fill-pct, 50%),
    var(--border-main) 100%
  );
  border-radius: 9999px;
  border: 1px solid var(--border-hover);
  outline: none;
  cursor: pointer;
  margin: 0;
  transition: border-color var(--nano-duration-fast) ease;
}

.slider:hover {
  border-color: #94a3b8;
}

/* WebKit Track */
.slider::-webkit-slider-runnable-track {
  height: 6px;
  background: transparent;
  border-radius: 9999px;
  border: none;
}

/* WebKit Thumb */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  border: 2.5px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15), 0 0 8px rgba(16, 185, 129, 0.4);
  cursor: pointer;
  margin-top: -7px;
  transition: transform var(--nano-duration-fast) ease, box-shadow var(--nano-duration-fast) ease, background-color var(--nano-duration-fast) ease;
}

.slider::-webkit-slider-thumb:hover {
  background: var(--accent-dark);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2), 0 0 12px rgba(16, 185, 129, 0.55);
}

.slider::-webkit-slider-thumb:active {
  background: #047857;
  transform: scale(1.15);
}

/* Firefox Track */
.slider::-moz-range-track {
  height: 6px;
  background: var(--border-main);
  border-radius: 9999px;
  border: 1px solid var(--border-hover);
}

.slider::-moz-range-progress {
  height: 6px;
  background: var(--accent);
  border-radius: 9999px;
}

/* Firefox Thumb */
.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  border: 2.5px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15), 0 0 8px rgba(16, 185, 129, 0.4);
  cursor: pointer;
  border: none;
  transition: transform var(--nano-duration-fast) ease, box-shadow var(--nano-duration-fast) ease, background-color var(--nano-duration-fast) ease;
}

.slider::-moz-range-thumb:hover {
  background: var(--accent-dark);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2), 0 0 12px rgba(16, 185, 129, 0.55);
}

.slider::-moz-range-thumb:active {
  background: #047857;
  transform: scale(1.15);
}

/* NanoSwitch Emerald (matching https://nano-ui.7u.pl/docs/switch) */
.nano-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  vertical-align: middle;
  outline: 0;
}

.nano-switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  margin: 0;
  outline: 0;
}

/* Base Slider Track */
.nano-switch-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-hover);
  border-radius: 12px;
  cursor: pointer;
  flex-shrink: 0;
  transition: 
    background-color 200ms ease, 
    border-color 200ms ease, 
    box-shadow 200ms ease;
  outline: 0;
}

/* Base Knob */
.nano-switch-slider::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  left: 3px;
  top: 3px;
  background: #94a3b8;
  border-radius: 50%;
  transition: 
    transform 200ms cubic-bezier(0.4, 0, 0.2, 1), 
    background-color 200ms ease, 
    box-shadow 200ms ease;
}

/* Checked Emerald State (1:1 with nano-ui Emerald Active Switch) */
.nano-switch.is-checked .nano-switch-slider {
  background: #d1fae5;
  border-color: #6ee7b7;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.28);
}

.nano-switch.is-checked .nano-switch-slider::before {
  transform: translateX(20px);
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.45);
}

.nano-switch:not(.is-checked):hover .nano-switch-slider {
  border-color: #94a3b8;
  background: #e2e8f0;
}

.nano-switch.is-checked:hover .nano-switch-slider {
  border-color: #34d399;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
}

.nano-switch-label {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-main);
  line-height: 1.3;
}

.actions-box {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-main);
  transition: all var(--nano-duration-fast) ease;
  -webkit-user-select: none;
  user-select: none;
  outline: none;
  height: 28px;
  display: inline-flex;
  align-items: center;
}

.add-btn {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: var(--accent-text);
  border-color: var(--accent-border);
}

.add-btn:hover {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.reset-btn {
  background: var(--bg-surface-subtle);
  color: var(--text-muted);
}

.reset-btn:hover {
  color: var(--text-main);
  background: var(--bg-surface-hover);
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  font-size: 0.82rem;
  color: var(--text-muted);
  flex-wrap: wrap;
  gap: 8px;
}

.status-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.metric-pill {
  background: var(--bg-surface-subtle);
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid var(--border-main);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  -webkit-user-select: none;
  user-select: none;
}

.metric-pill.speed {
  color: var(--accent-text);
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: var(--accent-border);
}

.autoindex-badge {
  color: var(--accent-dark);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  -webkit-user-select: none;
  user-select: none;
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.result-card {
  background: linear-gradient(180deg, #ffffff 0%, #fcfdfd 100%);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03);
  position: relative;
  overflow: hidden;
  transition: border-color var(--nano-duration-fast) ease, box-shadow var(--nano-duration-fast) ease;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(76, 230, 163, 0.6), transparent);
  opacity: 0;
  transition: opacity var(--nano-duration-fast) ease;
}

/* Stationary hover without translateY to prevent cursor edge flicker */
.result-card:hover {
  border-color: var(--border-hover);
  box-shadow: 0 6px 20px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04);
}

.result-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.card-category {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.card-remove-btn {
  background: transparent;
  border: none;
  color: var(--text-subtle);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all var(--nano-duration-fast) ease;
  outline: none;
}

.card-remove-btn:hover {
  color: #dc2626;
  background: #fef2f2;
}

.card-summary {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 14px;
  flex-grow: 1;
  line-height: 1.55;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.tag-pill {
  font-size: 0.75rem;
  background: var(--bg-surface-subtle);
  color: var(--text-muted);
  border: 1px solid var(--border-main);
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--nano-duration-fast) ease;
  -webkit-user-select: none;
  user-select: none;
}

.tag-pill:hover {
  color: var(--accent-text);
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: var(--accent-border);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
  -webkit-user-select: none;
  user-select: none;
}

.card-author {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.card-stars {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #d97706;
  font-weight: 600;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-surface);
  border: 1px dashed var(--border-main);
  border-radius: var(--radius);
}

.empty-icon {
  color: var(--text-subtle);
  margin-bottom: 12px;
}

.empty-state h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: var(--text-main);
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer {
  margin-top: 48px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border-main);
  padding-top: 24px;
}
</style>
