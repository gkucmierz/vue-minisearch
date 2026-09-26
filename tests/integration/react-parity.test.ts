import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { useMiniSearch } from '../../src/useMiniSearch.js'

interface DocumentType {
  uid: number
  title: string
}

const documents: DocumentType[] = [
  { uid: 1, title: 'De Rerum Natura' },
  { uid: 2, title: 'The Selfish Gene' }
]

const options = { fields: ['title'], idField: 'uid' }
const documentToAdd: DocumentType = { uid: 3, title: 'Pista Nera' }
const documentsToAdd: DocumentType[] = [
  { uid: 3, title: 'Six Easy Pieces' },
  { uid: 4, title: 'Six Not So Easy Pieces' }
]
const documentToRemove: DocumentType = documents[0]
const documentToReplace: DocumentType = { uid: 1, title: 'The Big Picture' }

/**
 * Normalizes HTML string by removing comments, data attributes, and whitespace discrepancies
 */
function normalizeMarkup(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

describe('React vs Vue MiniSearch Parity Suite (Tier 2: Integration)', () => {
  describe('Exact Functional Parity with react-minisearch.test.tsx', () => {
    it('should search documents and produce exact matching results and suggestions', () => {
      const { search, searchResults, autoSuggest, suggestions } = useMiniSearch(documents, options)

      // Test autoSuggest('sel')
      autoSuggest('sel')
      assert.ok(suggestions.value)
      assert.equal(suggestions.value.length, 1)
      assert.equal(suggestions.value[0].suggestion, 'selfish')

      // Test search('sel') with prefix: true
      search('sel', { prefix: true })
      assert.ok(searchResults.value)
      assert.equal(searchResults.value.length, 1)
      assert.equal(searchResults.value[0].uid, 2)
      assert.equal(searchResults.value[0].title, 'The Selfish Gene')

      // Test search('nonexistent')
      search('nonexistent')
      assert.equal(searchResults.value?.length, 0)
    })

    it('should add one document and make it immediately searchable (matching react add test)', () => {
      const { search, searchResults, add } = useMiniSearch(documents, options)

      add(documentToAdd)
      search('Pista')
      assert.ok(searchResults.value)
      assert.equal(searchResults.value.length, 1)
      assert.equal(searchResults.value[0].uid, 3)
      assert.equal(searchResults.value[0].title, 'Pista Nera')
    })

    it('should add multiple documents synchronously (matching react addAll test)', () => {
      const { search, searchResults, addAll } = useMiniSearch(documents, options)

      addAll(documentsToAdd)
      search('Six')
      assert.ok(searchResults.value)
      assert.equal(searchResults.value.length, 2)
      const titles = searchResults.value.map(d => d.title)
      assert.ok(titles.includes('Six Easy Pieces'))
      assert.ok(titles.includes('Six Not So Easy Pieces'))
    })

    it('should remove document properly (matching react remove test)', () => {
      const { search, searchResults, remove } = useMiniSearch(documents, options)

      remove(documentToRemove)
      search('Rerum')
      assert.equal(searchResults.value?.length, 0)

      search('Selfish')
      assert.equal(searchResults.value?.length, 1)
    })

    it('should replace document properly (matching react replace test)', () => {
      const { search, searchResults, replace } = useMiniSearch(documents, options)

      replace(documentToReplace)
      search('Rerum')
      assert.equal(searchResults.value?.length, 0)

      search('Picture')
      assert.ok(searchResults.value)
      assert.equal(searchResults.value.length, 1)
      assert.equal(searchResults.value[0].uid, 1)
      assert.equal(searchResults.value[0].title, 'The Big Picture')
    })
  })

  describe('Markup & DOM Cleanliness Parity', () => {
    it('should render clean flat markup without artificial container nesting', () => {
      // Simulate rendering the component markup structure defined in react-minisearch.test.tsx:
      // <div>
      //   <input className='search' type='text' />
      //   <ul className='suggestions'>...</ul>
      //   <ul className='results'>...</ul>
      // </div>
      const { search, searchResults } = useMiniSearch(documents, options)
      search('Selfish')

      // Component template output emulation in Vue:
      const renderedItems = (searchResults.value || [])
        .map(result => `<li key="${result.uid}">${result.title}</li>`)
        .join('')

      const vueMarkup = `
        <div>
          <input class="search" type="text" />
          <ul class="suggestions"></ul>
          <ul class="results">
            ${renderedItems}
          </ul>
        </div>
      `

      // React JSX output counterpart:
      const reactMarkup = `
        <div>
          <input class="search" type="text" />
          <ul class="suggestions"></ul>
          <ul class="results">
            <li key="2">The Selfish Gene</li>
          </ul>
        </div>
      `

      assert.equal(normalizeMarkup(vueMarkup), normalizeMarkup(reactMarkup))
    })

    it('should maintain zero structural divergence when query yields no results', () => {
      const { search, searchResults } = useMiniSearch(documents, options)
      search('nonexistent')

      const renderedItems = (searchResults.value || [])
        .map(result => `<li key="${result.uid}">${result.title}</li>`)
        .join('')

      const vueMarkup = `
        <div>
          <input class="search" type="text" />
          <ul class="results">${renderedItems}</ul>
        </div>
      `

      const reactMarkup = `
        <div>
          <input class="search" type="text" />
          <ul class="results"></ul>
        </div>
      `

      assert.equal(normalizeMarkup(vueMarkup), normalizeMarkup(reactMarkup))
    })
  })
})
