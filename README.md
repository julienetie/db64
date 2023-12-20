# db64

## A Practical IndexedDB API

A better alternative to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). If you need versioning try [idb](https://github.com/jakearchibald/idb). db64 supports [all major browsers](https://caniuse.com/indexeddb).  


### db64
- Promise based API
- Set and get single or multiple entries
- Delete single, multiple or all entries
- No versioning 
- 2.1kB minified

### Why IndexedDB, why not localStorage?
- Better performance
- Asynchronous (localStorage is blocking)
- Larger storage quota (localStorage is capped at 5MB)
- Reliable (no type coercion)
- Uses the [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) algorithm

### Practical challenges when using IndexedDB
- It's event driven, without promises
- It was designed to encourage versioning, which is not necessary for the majority of projects
- The API is considered as (low level) and is not a drop in replacement for localStorage
- Removing databases and stores is not straight forward and usually requires versioning


Install db64
```
npm i db64
```

**Create or use an existing database**  _[string]_ (the default DB name is "default")
```javascript 
db64.use('localDB')  // Returns db64
```

**Create a store** and **set data**. See [structured clone algorithm](https://developer.mozilla.org/en/US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) for supported types. 
```javascript
db64.store('fruits').set('some-key', 'some-value') // [Promise]
```

**Get data** _[string]_
```javascript
db64.store('fruits').get('some-key')  // [Promise]
```
**Set multiple entries** _[Object] | [Array]_
```javascript
db64.store('fruits').setEntries({ bananas: 5, pears: 4, mangoes: 7, apples: 2 })  // [Promise]

// or 

db64.store('fruits').setEntries([ 'bananas', 'pears', 'mangoes', 'apples' ]) // [Promise]
```

**Get multiple entries** _[Array]_
```javascript
db64.store('fruits').setEntries([ 'pears', 'apples' ])  // [Promise]
```

**Delete a single or multiple entries** _[String] | [Array]_
```javascript
db64.store('fruits').delete('mangoes') // [Promise]

// or

db64.store('fruits').delete([ 'bananas', 'mangoes' ]) // [Promise]
```

**Empty an object store** _[String]_
```javascript
db64.clear('fruits')  // [Promise]
```

### Why bd64 opts out of deleting databases and object stores

Deleting existing versions of databases or object stores in IndexedDB is not feasible due to the requirement to create a new version, and old versions remain accessible. While compaction may optimize, it doesn't ensure the removal of unwanted data. db64 provides an effective solution by allowing you to clear an object store, removing all its data. This feature proves beneficial for any application, even in cases where empty stores cannot be removed.


### Contributors
Don't hesitate just contribute, aim to follow the existing style. 

MIT (c) Julien Etienne 2023