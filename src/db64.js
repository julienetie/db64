const { isArray } = Array
const connections = []


/*
Creates a new database with given stores if the database and stores don't exist.
- name            string      The databse name
- storeNames      array       An array of store names
- Return          object      The given database
*/
const openDatabase = (name = 'default', storeNames) => new Promise((resolve, reject) => {
  const DBOpenRequest = window.indexedDB.open(name, 1)

  /*
  db64 does not revolve around versioning. Therefore, this function will only run once
  for every new set of databases created. Each set of databases and stores can only be
  created once and cannot be modified. Therefore, all databases have a version of 1.
  */
  DBOpenRequest.onupgradeneeded = ({ target }) => {
    const { result } = target
    storeNames.forEach(storeName => {
      if (!result.objectStoreNames.contains(storeName)) {
        const storeCreation = result.createObjectStore(storeName)
        storeCreation.onerror = err => reject(err.target.error)
      }
    })
  }


  /*
  Connected databases are stored to be disconnected before deletion.
  */
  DBOpenRequest.onsuccess = ({ target }) => {
    connections.push(DBOpenRequest)
    resolve(target.result)
  }

  DBOpenRequest.onerror = ({ target }) => {
    reject(target.result)
  }
})


/*
Sets an entry by a given key/value pair or a dataset of entries.
- database              object              Database object
- storeName       string              Store name
- key             structured          Key of entry
- dataValue       structured          Value of entry
- entries         array | object      Entries to set
- Return          object              db64 object
*/
const setData = async (database, storeName, key, dataValue, entries) => new Promise((resolve, reject) => {
  try {
    const obStore = (database.transaction([storeName], 'readwrite')).objectStore(storeName)
    if (entries) {
      const dataEntries = isArray(dataValue)
        ? () => dataValue.map((fruitName, index) => obStore.put(fruitName, index))
        : () => Object.entries(dataValue).map(([key, value]) => obStore.put(value, key))
      resolve(Promise.all(dataEntries()))
    } else {
      resolve(obStore.put(dataValue, key))
    }
    resolve(db64)
  } catch (e) {
    reject(e)
  }
})


/*
Gets an entry by a given key/value pair or a dataset of entries.
- database            object              Database object
- storeName     string              Store name
- key           structured          Key of entry
- entries       array | object      Entries to get
- Return        object              A promise fulfilled with the queried data
*/
const getData = async (database, storeName, key, entries) => new Promise((resolve) => {
  const objectStore = (database.transaction([storeName])).objectStore(storeName)

  if (entries) {
    const results = {}
    const cursorRequest = objectStore.openCursor()

    cursorRequest.onsuccess = e => {
      const cursor = e.target.result

      if (cursor) {
        if (key.includes(cursor.key)) results[cursor.key] = cursor.value
        cursor.continue()
      } else {
        resolve(results)
      }
    }
  } else {
    const dataRequest = objectStore.get(key)
    dataRequest.onsuccess = () => resolve(dataRequest.result)
  }
})



/*
Deletes an entry for a given store by key.
- database            object          Database object
- storeName     string          Store name
- key           structured      Key of entry
- Return        object          db64
*/
const deleteData = async (database, storeName, key) => new Promise((resolve, reject) => {
  try {
    const objectStore = (database.transaction([storeName], 'readwrite')).objectStore(storeName)
    const cursorRequest = objectStore.openCursor()

    cursorRequest.onsuccess = e => {
      const cursor = e.target.result

      if (cursor) {
        if ((isArray(key) ? key : [key]).includes(cursor.key)) cursor.delete()
        cursor.continue()
      }
    }
    resolve(db64)
  } catch (e) {
    reject(e)
  }
})


/*
Empties a store.
- database              object              Database object
- storeName       string              Store name
- Return          object              A promise fulfilled with the queried data
*/
const clearStore = (database, storeName) => new Promise((resolve, reject) => {
  const objectStore = (database.transaction([storeName], 'readwrite')).objectStore(storeName)
  const objectStoreRequest = objectStore.clear()

  objectStoreRequest.onsuccess = () => resolve(db64)
  objectStoreRequest.onerror = e => reject(e.target.error)
})


/*
Deletes a given databse.
- name          string      Database to delete
- Return        object      A promise fulfilled with the queried data
*/
const deleteDB = name => {
  const deletedDBs = []
  return new Promise((resolve, reject) => {
    const DBDeleteRequest = indexedDB.deleteDatabase(name)

    DBDeleteRequest.onsuccess = () => resolve(db64)

    DBDeleteRequest.onerror = ({ target }) => reject(new Error(`Error deleting database: ${target.error}`))

    DBDeleteRequest.onblocked = () => {
      for (const database of connections) {
        if (database.result.name === name) {
          database.result.close()
          deletedDBs.push(name)
        }
      }

      if (!deletedDBs.includes(name)) {
        deleteDB(name)
      } else {
        resolve(db64)
      }
    }
  })
}


/*
The db64 object */
const db64 = {
  create: async (name, storeNames) => {
    if (typeof name !== 'string') console.error(`${name} should be a string`)
    if (!isArray(storeNames)) return console.error(`${storeNames} should be an array`)

    return openDatabase(name, storeNames)
  },
  use: async (name, storeName) => {
    if (typeof name !== 'string') console.error(`${name} should be a string`)
    if (typeof name !== 'string') console.error(`${storeName} should be a string`)

    return {
      set: async (key, value) => openDatabase(name, [storeName])
        .then(database => setData(database, storeName, key, value)),
      setEntries: async (value) => openDatabase(name, storeName)
        .then(database => setData(database, storeName, null, value, 'entries')),
      get: async key => openDatabase(name, storeName)
        .then(database => getData(database, storeName, key)),
      getEntries: async (keys) => openDatabase(name, storeName)
        .then(database => getData(database, storeName, keys, 'entries')),
      delete: async (keys) => openDatabase(name, storeName)
        .then(database => deleteData(database, storeName, keys)),
    }
  },
  clear: async (name, storeName) => openDatabase(name, storeName)
    .then(database => clearStore(database, storeName)),
  delete: async name => deleteDB(name)
}

export default db64
