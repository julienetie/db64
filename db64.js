let dbName = 'default'
const { isArray } = Array

const openDBErrMessage = err => console.error(`Error creating database: ${err}`)
const setDataError = e => console.error('Error setting data', e)
const getDataError = e => console.error('Error retrieving data', e)

const openDB = (storeName) => new Promise((resolve, reject) => {
  let db
  try {
    db = window.indexedDB.open(dbName, 1)
  } catch (e) {
    reject(openDBErrMessage)
  }

  db.onupgradeneeded = e => (e.target.result).createObjectStore(storeName)
  db.onsuccess = e => resolve(e.target.result)
  db.onerror = e => reject(e.target.result)
  return db
})

const setData = async (db, storeName, key, dataValue, entries) => {
  try {
    const transaction = db.transaction([storeName], 'readwrite')
    const obStore = transaction.objectStore(storeName)

    if (entries) {
      const dataEntries = isArray(dataValue)
        ? () => dataValue.map((fruitName, index) => obStore.put(fruitName, index))
        : () => Object.entries(dataValue).map(([key, value]) => obStore.put(value, key))
      await Promise.all(dataEntries())
    } else {
      await obStore.put(dataValue, key)
    }
  } catch (e) {
    setDataError(e)
  }
  return await db64
}

const getData = async (db, storeName, key, entries) => {
  console.log('getData')
  return new Promise((resolve) => {
    const transaction = db.transaction([storeName])
    const objectStore = transaction.objectStore(storeName)
    let dataRequest
    if (entries) {
      const results = {}
      const cursorRequest = objectStore.openCursor()
      cursorRequest.onsuccess = e => {
        const cursor = e.target.result

        if (cursor) {
          if (key.includes(cursor.key)) {
            const value = cursor.value
            results[cursor.key] = value
          }
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
  return await db64
}

const clearStore = (db, storeName) => {
  return new Promise((resolve, reject) => {
    const objectStore = (db.transaction([storeName], 'readwrite')).objectStore(storeName)
    const objectStoreRequest = objectStore.clear()

    objectStoreRequest.onsuccess = resolve
    objectStoreRequest.onerror = e => reject(e.target.error)
  })
}

const db64 = {
  store: storeName => {
    return {
      set: async (key, value) => openDB(storeName)
        .then(db => setData(db, storeName, key, value))
        .catch(setDataError),
      setEntries: async (value) => openDB(storeName)
        .then(db => setData(db, storeName, null, value, 'entries'))
        .catch(setDataError),
      get: async key => openDB(storeName)
        .then(db => getData(db, storeName, key))
        .catch(getDataError),
      getEntries: async (keys) => openDB(storeName)
        .then(db => getData(db, storeName, keys, 'entries'))
        .catch(getDataError),
      delete: async (keys) => openDB(storeName)
        .then(db => deleteData(db, storeName, keys))
        .catch(console.error)
    }
  },
  clear: async storeName => {
    return openDB(storeName).then(db => clearStore(db, storeName))
      .catch(console.error)
  },
  use: name => (dbName = name, db64) // eslint-disable-line
}

export default db64
