# db64
<img src="https://github.com/julienetie/db64/assets/7676299/29665616-14d5-4e14-a3ff-191cc6aae7fa" width="200">

## A Practical IndexedDB API

A more practical alternative to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). db64 supports [all major browsers](https://caniuse.com/indexeddb).  


### db64
- Promise based API
- Set and get single or multiple entries
- Delete single, multiple or all entries
- No versioning 
- {{ size }} minified

E.g.
```javascript
import db64 from './db64.js'

try {
  // First create a database with stores
  await db64.create('Games', ['Super Nintendo', 'Gameboy'])

  // Assing a variable for modifying a store
  const snes = db64.use('Games', 'Super Nintendo')

  // Set multiple entries into Super Nintendo
  await snes.setEntries({ adventure: 'Mario World', rpg: 'Zelda', fighting: 'Street Fighter II' })

  // Get multiple entries from Super Nintendo
  await snes.getEntries(['adventure', 'fighting']) // { adventure: 'Mario Wrold', fighting: 'Street Fighter II' }

  // Delete an existing db 
  await db64.delete('Games')
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

> **_Just give me the builds_**
> - `git@github.com:julienetie/db64.git`
> - `cd db64 && npm i`
> - `npm run prepublishOnly`

**Install**
```
npm i db64
```
**Import**
```javascript
import db64 from 'db64.js'    // ES (native)
// or
import db64 from 'db64'       // ES
// or
const db64 = require('db64')  // CommonJS
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

**Delete a DB** _(string)_
```javascript
await db64.delete('game-consoles') // game-consoles is deleted
```

### Why db64 opts out of deleting object stores
We are avoiding versioning to keep your life simple. Deleting an existing object stores in IndexedDB triggers a version change. _(Whilst compaction may optimise, it doesn't ensure the removal of unwanted data)_

Here's the db64 workflow:

1. Initialise by creating a DB with stores or multiple DBs with stores.
    - _(You won't be able to add stores to an existing DB later, unless you delete the DB in question. This is by design)_

2. Use a DB.
    - _(You can make multiple transactions concurrently for multiple DBs, or stores)_

3. Set, get and clear data.

4. **Manage the lifecycle of DB deletion and re-creation**:
    - _When data cannot be retrieved from the user's IndexedDB_
    - _When there's an error_
      - _Data corruption_
      - _Quota exceeded_
      - _General errors_
    - _**When in the future you decide to add more stores at initialisation**_
    - _When you want to remove stores, especially for data protection_

It's important to consider step 4, if not you may leave users stuck because everything will look fine on your computer.
Step 4 isn't specific to IndexedDB, it mostly applies to _localStorage_. It's the same for all persistent storage on all platforms. Your application is at risk of breaking if you decide to change the persistent data structure or add to the structure in the future without preemptively managing common user cases.

```javascript
// An exaustive list for handeling errors for db64:
switch (e.name) {
    case 'NotFoundError':
    // The operation failed because the requested database object could not be found.
    case 'Db64MissingStore':
    /*
    An anticipated NotFoundError. Manage both cases togeather.
    You will likely need to re-create your dateabase here with necessary stores 
    and re-populate with existing data if necessary. */ 
        break
    case 'AbortError':
        // A request was aborted.
        break
    case 'SecurityError':
        // Handel security error 
        break
    case 'DataError':
        // Data provided to an operation does not meet requirements.
        break
    case 'TransactionInactiveError':
        // A request was placed against a transaction which is currently not active, or which is finished.
        break
    case 'InvalidStateError':
        // The object is in an invalid state.
        break
    case 'ConstraintError':
        // A mutation operation in the transaction failed because a constraint was not satisfied.
        break
    case 'SyntaxError':
        // The keyPath argument contains an invalid key path.
        break
    case 'QuotaExceededError':
        // The operation failed because there was not enough remaining storage space, or the storage quota was reached and the user declined to give more space to the database.
        break
    case 'ReadOnlyError':
        // The mutating operation was attempted in a read-only transaction.
        break
    case 'UnknownError':
        // The operation failed for reasons unrelated to the database itself and not covered by any other errors.
        break
}
```

If you do require versioning consider using [idb](https://github.com/jakearchibald/idb). **If you're not building a progressive web app (PWA) you probably don't need versioning**.

### Contributors
Don't hesitate just contribute, it's a tiny library we will figure it out.

If you want to edit `./README.md` edit `./src/_readme.md` which will update `./README.md` when `node create-distribution.js` is called.
This is to keep the minified size accurate.

---
MIT © Julien Etienne 2023
