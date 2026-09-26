import type { Ref, ShallowRef, MaybeRefOrGetter } from 'vue'
import type MiniSearch from 'minisearch'
import type { Options, SearchOptions, SearchResult, Suggestion, Query } from 'minisearch'

export interface UseMiniSearchOptions<T = any> extends Options<T> {
  /**
   * Automatically re-index documents when reactive document source changes.
   * @default true
   */
  autoIndex?: boolean

  /**
   * Default search options applied when calling search() or autoSuggest().
   */
  searchOptions?: SearchOptions
}

export interface UseMiniSearch<T = any> {
  /**
   * Search for documents matching the given query.
   */
  search: (query: Query, options?: SearchOptions) => void

  /**
   * Array of matched document objects, or null if no search has been performed.
   */
  searchResults: Ref<T[] | null>

  /**
   * Array of raw MiniSearch search results including scores and match metadata, or null.
   */
  rawResults: Ref<SearchResult[] | null>

  /**
   * Retrieve auto-suggestions for prefix query.
   */
  autoSuggest: (query: string, options?: SearchOptions) => void

  /**
   * Array of suggestions, or null if no auto-suggest has been performed.
   */
  suggestions: Ref<Suggestion[] | null>

  /**
   * Add a single document to the index and document store.
   */
  add: (document: T) => void

  /**
   * Add multiple documents to the index and document store synchronously.
   */
  addAll: (documents: readonly T[]) => void

  /**
   * Add multiple documents to the index asynchronously in chunks without blocking UI.
   */
  addAllAsync: (documents: readonly T[], options?: { chunkSize?: number }) => Promise<void>

  /**
   * Retrieve a stored document by its ID.
   */
  getById: (id: any) => T | null

  /**
   * Remove a single document from index and store.
   */
  remove: (document: T) => void

  /**
   * Remove a document by its ID from index and store.
   */
  removeById: (id: any) => void

  /**
   * Remove all documents (or a given subset) from index and store.
   */
  removeAll: (documents?: readonly T[]) => void

  /**
   * Discard a document by ID immediately without vacuuming index.
   */
  discard: (id: any) => void

  /**
   * Discard multiple documents by IDs immediately without vacuuming index.
   */
  discardAll: (ids: readonly any[]) => void

  /**
   * Replace an existing document with an updated version.
   */
  replace: (document: T) => void

  /**
   * Whether an asynchronous indexing operation is currently in progress.
   */
  isIndexing: Ref<boolean>

  /**
   * Reset search results and raw results to null.
   */
  clearSearch: () => void

  /**
   * Reset suggestions to null.
   */
  clearSuggestions: () => void

  /**
   * The underlying MiniSearch engine instance wrapped in a shallowRef.
   */
  miniSearch: ShallowRef<MiniSearch<T>>
}

export type DocumentSource<T> = MaybeRefOrGetter<readonly T[]>
