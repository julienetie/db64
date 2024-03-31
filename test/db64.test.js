import * as chai from '../node_modules/chai/chai.js'
import db64 from '../src/db64.js'
const { expect } = chai

// Override console.log to capture log messages
let logs = []
const originalLog = console.log
console.log = function (...args) {
  logs.push(args.join(' '))
  originalLog.apply(console, args)
}

// Add afterEach hook to display captured logs
afterEach(function () {
  logs.forEach(log => console.log(log))
  logs = [] // Clear captured logs after each test
})


describe('db64', () => {
  before(async () => {
    // Create a test database and store before running tests
    await db64.create('testDB', ['testStore'])
  })

  after(async () => {
    // Delete the test database after tests are finished
    await db64.delete('testDB')
  })

  it('should set and get data correctly', async () => {
    const db = db64.use('testDB', 'testStore')
    await db.set('key', 'value')
    const result = await db.get('key')
    expect(result).to.equal('value')
  })

  it('should set and get multiple entries correctly', async () => {
    const db = db64.use('testDB', 'testStore')
    const entries = { key1: 'value1', key2: 'value2', key3: 'value3' }
    await db.setEntries(entries)
    const result = await db.getEntries(['key1', 'key3'])
    expect(result).to.deep.equal({ key1: 'value1', key3: 'value3' })
  })

  it('should delete data correctly', async () => {
    const db = db64.use('testDB', 'testStore')
    await db.set('keyToDelete', 'valueToDelete')
    await db.delete('keyToDelete')
    const result = await db.get('keyToDelete')
    expect(result).to.be.undefined // eslint-disable-line
  })

  it('should clear store correctly', async () => {
    const db = db64.use('testDB', 'testStore')
    await db.set('key1', 'value1')
    await db.set('key2', 'value2')
    await db64.clear('testDB', 'testStore')
    const result1 = await db.get('key1')
    const result2 = await db.get('key2')
    expect(result1).to.be.undefined // eslint-disable-line
    expect(result2).to.be.undefined // eslint-disable-line
  })

  it('should delete database correctly', async () => {
    await db64.create('tempDB', ['tempStore'])
    const db = db64.use('tempDB', 'tempStore')
    await db.set('key', 'value')
    await db64.delete('tempDB')
    // Try to use deleted database, should throw error
    try {
      await db.set('key2', 'value2')
    } catch (error) {
      expect(error).to.exist // eslint-disable-line
    }
  })
})
