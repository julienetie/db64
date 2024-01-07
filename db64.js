const { isArray } = Array
const connections = []
const databaseNames = new Set()

/*
Creates a new database with given stores if the database and stores don't exist.
- name            string      The databse name
- storeNames      array       An array of store names
- Return          object      The given database
*/
const openDatabase = (name = 'default', storeNames) => new Promise((resolve, reject) => {
  let db
  try {
    db = window.indexedDB.open(name, 1)
  } catch (e) {
    reject(e)
  }


  /*
  db64 does not revolve around versioning. Therefore, this function will only run once
  for every new set of databases created. Each set of databases and stores can only be
  created once and cannot be modified. Therefore, all databases have a version of 1.
  */
  db.onupgradeneeded = e => {
    const { result } = e.target
    storeNames.forEach(storeName => {
      if (!result.objectStoreNames.contains(storeName)) {
        const storeCreation = result.createObjectStore(storeName)
        databaseNames.add(storeName)
        storeCreation.onerror = err => reject(err.target.error)
      }
    })
  }


  /*
  Connected databases are stored to be disconnected before deletion.
  */
  db.onsuccess = e => {
    connections.push(db)
    resolve(e.target.result)
  }

  db.onerror = e => reject(e.target.result)
  return db
})


/*
Sets an entry by a given key/value pair or a dataset of entries.
- db              object              Database object
- storeName       string              Store name
- key             structured          Key of entry
- dataValue       structured          Value of entry
- entries         array | object      Entries to set
- Return          object              db64 object
*/
const setData = async (db, storeName, key, dataValue, entries) => {
  try {
    const obStore = (db.transaction([storeName], 'readwrite')).objectStore(storeName)

    if (entries) {
      const dataEntries = isArray(dataValue)
        ? () => dataValue.map((fruitName, index) => obStore.put(fruitName, index))
        : () => Object.entries(dataValue).map(([key, value]) => obStore.put(value, key))
      await Promise.all(dataEntries())
    } else {
      await obStore.put(dataValue, key)
    }
  } catch (e) {
    console.error(e)
  }
  return db64
}


/*
Gets an entry by a given key/value pair or a dataset of entries.
- db            object              Database object
- storeName     string              Store name
- key           structured          Key of entry
- entries       array | object      Entries to get
- Return        object              A promise fulfilled with the queried data
*/
const getData = async (db, storeName, key, entries) => {
  return new Promise((resolve) => {
    const objectStore = (db.transaction([storeName])).objectStore(storeName)
    let dataRequest
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
      dataRequest = objectStore.get(key)
      dataRequest.onsuccess = () => resolve(dataRequest.result)
    }
  })
}


/*
Deletes an entry for a given store by key.
- db            object          Database object
- storeName     string          Store name
- key           structured      Key of entry
- Return        object          db64
*/
const deleteData = async (db, storeName, key) => {
  try {
    const objectStore = (db.transaction([storeName], 'readwrite')).objectStore(storeName)
    const cursorRequest = objectStore.openCursor()

    cursorRequest.onsuccess = e => {
      const cursor = e.target.result

      if (cursor) {
        if ((isArray(key) ? key : [key]).includes(cursor.key)) cursor.delete()
        cursor.continue()
      }
    }
  } catch (e) {
    console.error(e)
  }
  return db64
}


/*
Empties a store.
- db              object              Database object
- storeName       string              Store name
- Return          object              A promise fulfilled with the queried data
*/
const clearStore = (db, storeName) => {
  return new Promise((resolve, reject) => {
    const objectStore = (db.transaction([storeName], 'readwrite')).objectStore(storeName)
    const objectStoreRequest = objectStore.clear()

    objectStoreRequest.onsuccess = resolve(db64)
    objectStoreRequest.onerror = e => reject(e.target.error)
  })
}


/*
Deletes a given databse.
- name          string      Database to delete
- Return        object      A promise fulfilled with the queried data
*/
const deleteDB = name => {
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(name)

    deleteRequest.onsuccess = () => resolve(db64)

    deleteRequest.onerror = e => reject(new Error(`Error deleting database: ${e.target.error}`))

    deleteRequest.onblocked = e => {
      for (const db of connections) {
        if (db.result.name === name) {
          db.result.close()
        }
      }
      deleteDB(name)
    }
  })
}


/*
The db64 object */
const db64 = {
  create: async (name, storeNames) => {
    if (!isArray(storeNames)) return console.error('storeNames should be an array')

    await openDatabase(name, storeNames)
    return db64
  },
  use: (name, storeName) => {
    console.log('databaseNames', )
    if (!databaseNames.has(storeName)) return console.error('A database and store needs to be created first')

    return {
      set: async (key, value) => openDatabase(name, storeName)
        .then(db => setData(db, storeName, key, value))
        .catch(console.error),
      setEntries: async (value) => openDatabase(name, storeName)
        .then(db => setData(db, storeName, null, value, 'entries'))
        .catch(console.error),
      get: async key => openDatabase(name, storeName)
        .then(db => getData(db, storeName, key))
        .catch(console.error),
      getEntries: async (keys) => openDatabase(name, storeName)
        .then(db => getData(db, storeName, keys, 'entries'))
        .catch(console.error),
      delete: async (keys) => openDatabase(name, storeName)
        .then(db => deleteData(db, storeName, keys))
        .catch(console.error)
    }
  },
  clear: async (name, storeName) => openDatabase(name, storeName)
    .then(db => clearStore(db, storeName))
    .catch(console.error),
  delete: async name => deleteDB(name)
    .catch(console.error)
}

export default db64
