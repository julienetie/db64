# db64
<img src="https://github.com/julienetie/db64/assets/7676299/29665616-14d5-4e14-a3ff-191cc6aae7fa" width="200">

## A Practical IndexedDB API

A more practcal alternative to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). db64 supports [all major browsers](https://caniuse.com/indexeddb).  


### db64
- Promise based API
- Set and get single or multiple entries
- Delete single, multiple or all entries
- No versioning 
- Around 2kB minified

```javascript
import db64 from './db64.js'

try {
  // First create a database with stores
  await db64.create('Games', 'Super Nintendo', 'Gameboy')

  // Assing a variable for modifying a store
  const snes = db64.use('Games', 'Super Nintendo')

  // Set multiple entries into Super Nintendo
  await snes.setEntries({ adventure: 'Mario Wrold', rpg: 'Zelda', fighting: 'Street Fighter II' })

  // Get multiple entries from Super Nintendo
  await snes.getEntries(['adventure', 'fighting']) // { adventure: 'Mario Wrold', fighting: 'Street Fighter II' }
...
```


### Why IndexedDB, why not localStorage?
- Better performance
- Asynchronous (localStorage is blocking)
- Larger storage quota (localStorage is capped at 5MB)
- Reliable (no type coercion)
- Uses the [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) algorithm

### Practical challenges when using IndexedDB
- It's event driven, without promises
- It was designed to encourage versioning, which is not necessary for the majority of projects
- The API is considered as (low level) and can be challenging as a replacement for localStorage
- Removing databases and stores is not straight forward nor necessary, and usually requires versioning


Install db64
```
npm i db64
```

**Create a database with stores**  _(string, array)_
```javascript 
await db64.create('game-consoles', ['n64', 'ps5', 'dreamcast', 'xbox-360'])
```

**Use a store**  _(string, string)_
```javascript 
const n64 = db64.use('game-consoles', 'n64')
```

**Set an entry** _(IDB type, IDB type)_ _See [structured clone algorithm](https://developer.mozilla.org/en/US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) for supported types_
```javascript
await n64.set(5, 'Super Mario 64')
```
**Set multiple entries** _(object | array)_
```javascript
await n64.setEntries({fps: 'GoldenEye 007', space: 'Star Fox 64', adventure: 'Banjo-Kazooie'})
await n64.setEntries(['Wave Race 64', 'The Legend of Zelda'])
```

**Get an entry** _(IDB type)_
```javascript
const fps = await n64.get('fps') // GoldenEye 007
```

**Get multiple entries** _(object | array)_
```javascript
const rareware = await n64.getEntries(['fps', 'adventure', 5]) // {fps: 'GoldenEye 007', adventure: 'Banjo-Kazooie', 0: 'Super Mario 64'}
```
**Delete an entry** _(IDB type | array)_
```javascript
await n64.delete(1)  // Deletes 'The Legend of Zelda'
```

**Delete multiple entries**
```javascript
await n64.delete(['adventure', 0])  // Deletes 'Banjo-Kazooie' and 'Super Mario 64'
```

**Clear a store** _(string, string)_
```javascript
await db64.clear('game-consoles', 'n64') // All data in n64 is deleted
```


### Why db64 opts out of deleting databases and object stores

Deleting existing versions of databases or object stores in IndexedDB is not feasible due to the requirement to create a new version, and old versions remain accessible. While compaction may optimize, it doesn't ensure the removal of unwanted data. db64 provides an effective solution by allowing you to clear an object store, removing all its data. This feature proves beneficial for any application, even in cases where empty stores cannot be removed. If you do require versioning consider using [idb](https://github.com/jakearchibald/idb). **If you're not building a progressive web app (PWA) you probably don't need versioning**. 


### Contributors
Don't hesitate just contribute, it's a tiny library we will figure it out. 

---
MIT (c) Julien Etienne 2023
