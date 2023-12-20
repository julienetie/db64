
let dbName = 'default'
const { isArray } = Array

const openDBErrMessage = err => console.error(`Error creating database: ${err}`)
const setDataError = e => console.error(`Error setting data`, e)
const getDataError = e => console.error(`Error retrieving data`, e)


const openDB = (storeName) => new Promise((resolve, reject) => {
    let db
    try {
        db = window.indexedDB.open(dbName, 1)
    } catch (e) {
        reject(e)
    }

    db.onupgradeneeded = e => (e.target.result).createObjectStore(storeName)
    db.onsuccess = e => resolve(e.target.result)
    db.onerror = e => reject(e.target.result)

    return db
})


const setData = async (db, storeName, key, dataValue, entries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const transaction = db.transaction([storeName], "readwrite")
            const obStore = transaction.objectStore(storeName)

            if (entries) {
                const dataEntries = isArray(dataValue)
                    ? () => dataValue.map((fruitName, index) => obStore.put(fruitName, index))
                    : () => Object.entries(dataValue).map(([key, value]) => obStore.put(value, key))
                await Promise.all(dataEntries())
            } else {
                await obStore.put(dataValue, key)
            }
            resolve()
        } catch (e) {
            setDataError(e)
            reject(e)
        }
    })
}


const getData = async (db, storeName, key, entries) => {
    return new Promise(async (resolve, reject) => {
        try {
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
        } catch (e) {
            getDataError(e)
            reject(e)
        }
    })
}


const deleteData = async (db, storeName, key) => {
    const keyArr = isArray(key) ? key : [key]
    return new Promise(async (resolve, reject) => {
        try {
            const transaction = db.transaction([storeName], 'readwrite')
            const objectStore = transaction.objectStore(storeName)
            const cursorRequest = objectStore.openCursor()

            cursorRequest.onsuccess = e => {
                const cursor = e.target.result

                if (cursor) {
                    if (keyArr.includes(cursor.key)) cursor.delete()
                    cursor.continue()
                }
                resolve()
            }
        } catch (e) {
            reject(e)
        }
    })
}


const clearStore = (db, storeName) => {
    return new Promise(async (resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        const objectStoreRequest = objectStore.clear()

        objectStoreRequest.onsuccess = resolve
        objectStoreRequest.onerror = e => reject(e.target.error)
    })
}

const db64 = {
    from: storeName => {
        return {
            set: async (key, value) => {
                return openDB(storeName).then(db => setData(db, storeName, key, value))
                    .catch(openDBErrMessage)
            },
            setEntries: async (value) => {
                return openDB(storeName).then(db => setData(db, storeName, null, value, 'entries'))
                    .catch(openDBErrMessage)
            },
            get: async key => {
                return openDB(storeName).then(db => getData(db, storeName, key))
                    .catch(openDBErrMessage)
            },
            getEntries: async (keys) => {
                return openDB(storeName).then(db => getData(db, storeName, keys, 'entries'))
                    .catch(openDBErrMessage)
            },
            delete: async (keys) => {
                return openDB(storeName).then(db => deleteData(db, storeName, keys))
                    .catch(openDBErrMessage)
            },
        }
    },
    clear: async storeName => {
        return openDB(storeName).then(db => clearStore(db, storeName))
            .catch(openDBErrMessage)
    },
    use: name => (dbName = name, db64)
}

export default db64