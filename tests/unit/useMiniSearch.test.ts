import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ref, nextTick } from 'vue'
import { useMiniSearch } from '../../src/useMiniSearch.js'

interface Book {
  uid: number
  title: string
  category?: string
}

const sampleBooks: Book[] = [
  { uid: 1, title: 'De Rerum Natura', category: 'philosophy' },
  { uid: 2, title: 'The Selfish Gene', category: 'science' },
  { uid: 3, title: 'Pista Nera', category: 'fiction' }
]

describe('useMiniSearch Unit Tests (Tier 1: Unit)', () => {
  describe('Initialization', () => {
    it('should index initial documents and expose search engine instance', () => {
      const { miniSearch, getById } = useMiniSearch(sampleBooks, {
        fields: ['title', 'category'],
        idField: 'uid'
      })

      assert.ok(miniSearch.value, 'miniSearch instance should be defined')
      assert.equal(miniSearch.value.documentCount, 3)
      assert.deepEqual(getById(1), sampleBooks[0])
    })

    it('should support default "id" field when idField is omitted', () => {
      const docs = [
        { id: 'doc-1', title: 'Vue Composition API' },
        { id: 'doc-2', title: 'React Hooks Comparison' }
      ]
      const { search, searchResults } = useMiniSearch(docs, {
        fields: ['title']
      })

      search('Composition')
      assert.ok(searchResults.value)
      assert.equal(searchResults.value.length, 1)
      assert.equal(searchResults.value[0].id, 'doc-1')
    })

    it('should support custom string property for idField', () => {
      const docs = [
        { key: 'k1', name: 'Item One' },
        { key: 'k2', name: 'Item Two' }
      ]
      const { search, searchResults } = useMiniSearch(docs, {
        fields: ['name'],
        idField: 'key'
      })

      search('Two')
      assert.ok(searchResults.value)
      assert.equal(searchResults.value.length, 1)
      assert.equal(searchResults.value[0].name, 'Item Two')
    })

    it('should initialize cleanly with empty document list', () => {
      const { miniSearch, searchResults, rawResults } = useMiniSearch([], {
        fields: ['title']
      })

      assert.equal(miniSearch.value.documentCount, 0)
      assert.equal(searchResults.value, null)
      assert.equal(rawResults.value, null)
    })
  })

  describe('Search & Results', () => {
    it('should return matched documents in searchResults and raw metadata in rawResults when query matches', () => {
      const { search, searchResults, rawResults } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      search('Selfish')
      assert.ok(searchResults.value, 'searchResults should not be null')
      assert.ok(rawResults.value, 'rawResults should not be null')
      assert.equal(searchResults.value.length, 1)
      assert.equal(searchResults.value[0].title, 'The Selfish Gene')

      assert.equal(rawResults.value.length, 1)
      assert.equal(rawResults.value[0].id, 2)
      assert.ok(typeof rawResults.value[0].score === 'number')
    })

    it('should transition searchResults and rawResults from populated to null when clearSearch is called', () => {
      const { search, searchResults, rawResults, clearSearch } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      search('Rerum')
      assert.ok(searchResults.value)
      assert.equal(searchResults.value.length, 1)

      clearSearch()
      assert.equal(searchResults.value, null)
      assert.equal(rawResults.value, null)
    })

    it('should clear searchResults when query is empty or whitespace', () => {
      const { search, searchResults } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      search('Rerum')
      assert.equal(searchResults.value?.length, 1)

      search('')
      assert.equal(searchResults.value, null)

      search('   ')
      assert.equal(searchResults.value, null)
    })

    it('should respect custom SearchOptions passed directly to search()', () => {
      const { search, searchResults } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      // Without prefix, 'Sel' should not match 'Selfish'
      search('Sel', { prefix: false })
      assert.equal(searchResults.value?.length, 0)

      // With prefix: true, 'Sel' should match 'Selfish'
      search('Sel', { prefix: true })
      assert.equal(searchResults.value?.length, 1)
      assert.equal(searchResults.value?.[0].title, 'The Selfish Gene')
    })
  })

  describe('Auto-Suggestions', () => {
    it('should return suggestion terms when prefix query is entered via autoSuggest', () => {
      const { autoSuggest, suggestions, clearSuggestions } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      autoSuggest('Sel')
      assert.ok(suggestions.value)
      assert.ok(suggestions.value.length >= 1)
      assert.ok(suggestions.value.some(s => s.suggestion === 'selfish'))

      clearSuggestions()
      assert.equal(suggestions.value, null)
    })

    it('should reset suggestions to null when autoSuggest receives empty query', () => {
      const { autoSuggest, suggestions } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      autoSuggest('Pist')
      assert.ok(suggestions.value)

      autoSuggest('')
      assert.equal(suggestions.value, null)
    })
  })

  describe('Document Mutators (add, addAll, addAllAsync, replace)', () => {
    it('should make new document immediately searchable when add is called', () => {
      const { search, searchResults, add, getById } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      const newDoc: Book = { uid: 4, title: 'Quantum Electrodynamics' }
      add(newDoc)

      assert.deepEqual(getById(4), newDoc)
      search('Quantum')
      assert.equal(searchResults.value?.length, 1)
      assert.equal(searchResults.value?.[0].title, 'Quantum Electrodynamics')
    })

    it('should add multiple documents synchronously when addAll is called', () => {
      const { search, searchResults, addAll } = useMiniSearch([], {
        fields: ['title'],
        idField: 'uid'
      })

      addAll(sampleBooks)
      search('Gene')
      assert.equal(searchResults.value?.length, 1)
      assert.equal(searchResults.value?.[0].uid, 2)
    })

    it('should transition isIndexing state from false to true and back to false during addAllAsync', async () => {
      const { isIndexing, addAllAsync, search, searchResults } = useMiniSearch([], {
        fields: ['title'],
        idField: 'uid'
      })

      assert.equal(isIndexing.value, false)
      const promise = addAllAsync(sampleBooks, { chunkSize: 1 })
      assert.equal(isIndexing.value, true)

      await promise
      assert.equal(isIndexing.value, false)

      search('Rerum')
      assert.equal(searchResults.value?.length, 1)
    })

    it('should update document data and searchable tokens when replace is called', () => {
      const { search, searchResults, replace, getById } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      const updatedDoc: Book = { uid: 1, title: 'The Big Picture Cosmology' }
      replace(updatedDoc)

      assert.deepEqual(getById(1), updatedDoc)

      search('Rerum')
      assert.equal(searchResults.value?.length, 0)

      search('Cosmology')
      assert.equal(searchResults.value?.length, 1)
      assert.equal(searchResults.value?.[0].title, 'The Big Picture Cosmology')
    })
  })

  describe('Document Removers (remove, removeById, removeAll, discard, discardAll)', () => {
    it('should remove document from results when remove is called', () => {
      const { search, searchResults, remove, getById } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      remove(sampleBooks[0])
      assert.equal(getById(1), null)

      search('Rerum')
      assert.equal(searchResults.value?.length, 0)
    })

    it('should remove document by ID when removeById is called', () => {
      const { search, searchResults, removeById, getById } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      removeById(2)
      assert.equal(getById(2), null)

      search('Selfish')
      assert.equal(searchResults.value?.length, 0)
    })

    it('should clear entire index when removeAll is called without parameters', () => {
      const { search, searchResults, removeAll, miniSearch } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      assert.equal(miniSearch.value.documentCount, 3)
      removeAll()

      assert.equal(miniSearch.value.documentCount, 0)
      search('Gene')
      assert.equal(searchResults.value?.length, 0)
    })

    it('should remove specified subset when removeAll is called with an array of documents', () => {
      const { search, searchResults, removeAll, miniSearch } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      removeAll([sampleBooks[0], sampleBooks[1]])
      assert.equal(miniSearch.value.documentCount, 1)

      search('Rerum')
      assert.equal(searchResults.value?.length, 0)

      search('Pista')
      assert.equal(searchResults.value?.length, 1)
    })

    it('should soft-discard document from search immediately when discard is called', () => {
      const { search, searchResults, discard, getById } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      discard(3)
      assert.equal(getById(3), null)

      search('Pista')
      assert.equal(searchResults.value?.length, 0)
    })

    it('should discard multiple documents when discardAll is called', () => {
      const { search, searchResults, discardAll } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      discardAll([1, 2])
      search('Rerum')
      assert.equal(searchResults.value?.length, 0)

      search('Pista')
      assert.equal(searchResults.value?.length, 1)
    })
  })

  describe('Document Lookup (getById)', () => {
    it('should retrieve stored document by numeric and string representation of ID', () => {
      const { getById } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      assert.equal(getById(2)?.title, 'The Selfish Gene')
      assert.equal(getById('2')?.title, 'The Selfish Gene')
    })

    it('should return null when requested ID does not exist', () => {
      const { getById } = useMiniSearch(sampleBooks, {
        fields: ['title'],
        idField: 'uid'
      })

      assert.equal(getById(999), null)
    })
  })

  describe('Vue Reactivity & Auto-Indexing', () => {
    it('should automatically re-index documents and re-run search when reactive ref(documents) changes', async () => {
      const docsRef = ref<Book[]>([
        { uid: 1, title: 'Original Alpha Title' }
      ])

      const { search, searchResults } = useMiniSearch(docsRef, {
        fields: ['title'],
        idField: 'uid'
      })

      search('Alpha')
      assert.equal(searchResults.value?.length, 1)

      // Mutate reactive ref
      docsRef.value = [
        { uid: 1, title: 'Updated Beta Title' },
        { uid: 2, title: 'Brand New Gamma Title' }
      ]

      await nextTick()

      // The active search should have re-run automatically on the new index!
      assert.equal(searchResults.value?.length, 0)

      search('Beta')
      assert.equal(searchResults.value?.length, 1)
      assert.equal(searchResults.value?.[0].title, 'Updated Beta Title')

      search('Gamma')
      assert.equal(searchResults.value?.length, 1)
      assert.equal(searchResults.value?.[0].title, 'Brand New Gamma Title')
    })

    it('should skip automatic re-indexing when autoIndex is explicitly set to false', async () => {
      const docsRef = ref<Book[]>([
        { uid: 1, title: 'Static Reference Document' }
      ])

      const { search, searchResults } = useMiniSearch(docsRef, {
        fields: ['title'],
        idField: 'uid',
        autoIndex: false
      })

      search('Static')
      assert.equal(searchResults.value?.length, 1)

      docsRef.value = [
        { uid: 2, title: 'Ignored New Document' }
      ]

      await nextTick()

      // Should still match original index because autoIndex is false
      search('Static')
      assert.equal(searchResults.value?.length, 1)

      search('Ignored')
      assert.equal(searchResults.value?.length, 0)
    })
  })
})
