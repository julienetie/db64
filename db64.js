const { isArray } = Array
const err = console.error
const openDBErrMessage = e => err(`Error creating database: ${e}`)
const setDataError = e => err('Error setting data', e)
const getDataError = e => err('Error retrieving data', e)
let lastDBName
let lastStoreName
const openDB = (name = 'default', storeNames) => new Promise((resolve, reject) => {
    let db
    try {
        db = window.indexedDB.open(name, 1)
    } catch (e) {
        reject(openDBErrMessage)
    }

    db.onupgradeneeded = e => {
        const { result } = e.target
        storeNames.forEach(storeName => {
            if (!result.objectStoreNames.contains(storeName)) {
                const storeCreation = result.createObjectStore(storeName)
                storeCreation.onerror = err => reject(err.target.error)
            }
        })
    }
    db.onsuccess = e => (hasDBandStores = true, resolve(e.target.result)) //eslint-disable-line
    db.onerror = e => reject(e.target.result)
    return db
})

const setData = async (db, storeName, key, dataValue, entries) => {
    const obStore = (db.transaction([storeName], 'readwrite')).objectStore(storeName)
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

const clearStore = (db, storeName) => {
    return new Promise((resolve, reject) => {
        const objectStore = (db.transaction([storeName], 'readwrite')).objectStore(storeName)
        const objectStoreRequest = objectStore.clear()

        objectStoreRequest.onsuccess = resolve(db64)
        objectStoreRequest.onerror = e => reject(e.target.error)
    })
}

let hasDBandStores = false
const db64 = {
    create: async (name, storeNames) => {
        if(!isArray(storeNames)) return console.error('storeNames should be an array')
        lastDBName = name
        lastStoreName = storeNames[0]
        await openDB(name, storeNames, hasDBandStores)
        return db64
    },
    use: (name, storeName) => {
        if(!hasDBandStores) return console.error('A database and store needs to be created first')
        lastDBName = name
        lastStoreName = storeName

        return {
            set: async (key, value) => openDB(name, storeName)
                .then(db => setData(db, storeName, key, value))
                .catch(console.error)
            ,
            setEntries: async (value) => openDB(name, storeName)
                .then(db => setData(db, storeName, null, value, 'entries'))
                .catch(setDataError)
            ,
            get: async key => openDB(name, storeName)
                .then(db => getData(db, storeName, key))
                .catch(getDataError)
            ,
            getEntries: async (keys) => openDB(name, storeName)
                .then(db => getData(db, storeName, keys, 'entries'))
                .catch(getDataError)
            ,
            delete: async (keys) => openDB(name, storeName)
                .then(db => deleteData(db, storeName, keys))
                .catch(console.error)
        }
     
    },
    clear: async (name, storeName) => openDB(name, storeName)
        .then(db => clearStore(db, storeName))
        .catch(console.error)
}

// const getLastDBandStore = () => db64.use(lastDBName,lastStoreName)
// db64.set = (key, value) => getLastDBandStore().set(key, value)
// db64.setEntries = entries => getLastDBandStore().setEntries(entries)
// db64.get = key => getLastDBandStore().get(key)
// db64.getEntries = entries => getLastDBandStore().getEntries(entries)
// db64.delete = keys => getLastDBandStore().delete(keys)

export default db64
