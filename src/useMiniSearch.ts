import { ref, shallowRef, watch, toValue, isRef, type Ref } from 'vue'
import MiniSearch, { type Query, type SearchOptions } from 'minisearch'
import type { UseMiniSearch, UseMiniSearchOptions, DocumentSource } from './types.js'

/**
 * Vue 3 Composition API hook providing reactive full-text search with MiniSearch.
 * Fully compatible with the react-minisearch interface.
 *
 * @param documents Array, Ref, ComputedRef, or getter function returning documents to index.
 * @param options MiniSearch options including fields and search configuration.
 */
export function useMiniSearch<T = any>(
  documents: DocumentSource<T>,
  options: UseMiniSearchOptions<T>
): UseMiniSearch<T> {
  const miniSearch = shallowRef<MiniSearch<T>>(new MiniSearch<T>(options))
  const documentById = new Map<any, T>()

  const rawResults = ref<any[] | null>(null)
  const searchResults: Ref<T[] | null> = shallowRef<T[] | null>(null)
  const suggestions = ref<any[] | null>(null)
  const isIndexing = ref<boolean>(false)

  let lastQuery: Query | null = null
  let lastSearchOptions: SearchOptions | undefined

  const extractId = (doc: T): any => {
    if (typeof options.idField === 'function') {
      return (options.idField as (doc: T) => any)(doc)
    }
    const field = (options.idField || 'id') as keyof T
    return (doc as any)[field]
  }

  const add = (document: T): void => {
    miniSearch.value.add(document)
    documentById.set(extractId(document), document)
  }

  const addAll = (docs: readonly T[]): void => {
    miniSearch.value.addAll(docs as T[])
    for (const doc of docs) {
      documentById.set(extractId(doc), doc)
    }
  }

  const addAllAsync = async (
    docs: readonly T[],
    asyncOptions?: { chunkSize?: number }
  ): Promise<void> => {
    isIndexing.value = true
    try {
      await miniSearch.value.addAllAsync(docs as T[], asyncOptions)
      for (const doc of docs) {
        documentById.set(extractId(doc), doc)
      }
    } finally {
      isIndexing.value = false
    }
  }

  const getById = (id: any): T | null => {
    if (documentById.has(id)) {
      return documentById.get(id)!
    }
    const strId = String(id)
    if (documentById.has(strId)) {
      return documentById.get(strId)!
    }
    const numId = Number(id)
    if (!Number.isNaN(numId) && documentById.has(numId)) {
      return documentById.get(numId)!
    }
    return null
  }

  const remove = (document: T): void => {
    miniSearch.value.remove(document)
    const id = extractId(document)
    documentById.delete(id)
    documentById.delete(String(id))
  }

  const removeById = (id: any): void => {
    const doc = getById(id)
    if (doc) {
      remove(doc)
    }
  }

  const removeAll = (docs?: readonly T[]): void => {
    if (docs) {
      miniSearch.value.removeAll(docs as T[])
      for (const doc of docs) {
        const id = extractId(doc)
        documentById.delete(id)
        documentById.delete(String(id))
      }
    } else {
      miniSearch.value.removeAll()
      documentById.clear()
    }
  }

  const discard = (id: any): void => {
    miniSearch.value.discard(id)
    documentById.delete(id)
    documentById.delete(String(id))
  }

  const discardAll = (ids: readonly any[]): void => {
    miniSearch.value.discardAll(ids as any[])
    for (const id of ids) {
      documentById.delete(id)
      documentById.delete(String(id))
    }
  }

  const replace = (document: T): void => {
    miniSearch.value.replace(document)
    documentById.set(extractId(document), document)
  }

  const clearSearch = (): void => {
    lastQuery = null
    lastSearchOptions = undefined
    rawResults.value = null
    searchResults.value = null
  }

  const clearSuggestions = (): void => {
    suggestions.value = null
  }

  const search = (query: Query, searchOpts?: SearchOptions): void => {
    if (query === null || query === undefined || (typeof query === 'string' && query.trim() === '')) {
      clearSearch()
      return
    }

    lastQuery = query
    lastSearchOptions = searchOpts

    const mergedOptions: SearchOptions = {
      ...(options.searchOptions || {}),
      ...(searchOpts || {})
    }

    const results = miniSearch.value.search(query, mergedOptions)
    rawResults.value = results
    searchResults.value = results
      .map(r => documentById.get(r.id) ?? documentById.get(String(r.id)) as T)
      .filter(Boolean)
  }

  const autoSuggest = (query: string, searchOpts?: SearchOptions): void => {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      clearSuggestions()
      return
    }

    const mergedOptions: SearchOptions = {
      ...(options.searchOptions || {}),
      ...(searchOpts || {})
    }

    suggestions.value = miniSearch.value.autoSuggest(query, mergedOptions)
  }

  // Initial indexation
  const initialDocs = toValue(documents)
  if (initialDocs && initialDocs.length > 0) {
    addAll(initialDocs)
  }

  // Reactive watcher if documents source is reactive (ref, computed, or getter)
  if (isRef(documents) || typeof documents === 'function') {
    watch(
      () => toValue(documents),
      (newDocs) => {
        if (options.autoIndex === false) return
        removeAll()
        if (newDocs && newDocs.length > 0) {
          addAll(newDocs)
        }
        if (lastQuery !== null) {
          search(lastQuery, lastSearchOptions)
        }
      },
      { deep: true }
    )
  }

  return {
    search,
    searchResults,
    rawResults,
    autoSuggest,
    suggestions,
    add,
    addAll,
    addAllAsync,
    getById,
    remove,
    removeById,
    removeAll,
    discard,
    discardAll,
    replace,
    isIndexing,
    clearSearch,
    clearSuggestions,
    miniSearch
  }
}
