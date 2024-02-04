import db64 from '../../src/db64.js'
import detectPlatform from './detect-platform.js'

const queryEls = ['form', 'refresh', 'clear', 'populate', 'name', 'country', 'color', 'food', 'drink', 'music', 'year', 'leader', 'sky', 'population', 'browser', 'os', 'language', 'time', 'last-platform', 'last-language', 'last-time']
const replenishFilter = ['form', 'refresh', 'populate', 'clear', 'last-language', 'last-time', 'last-platform']
const query = selector => document.querySelector(selector)
const empty = ''
const el = {}

for (const id of queryEls) {
  el[id] = query(`#${id}`)
}


db64.create('db64_Example', [
  'personal',
  'favourites',
  'random',
  'platform'
])

// Quick populate data
const personalData = {
  name: 'Haruki Murakami',
  country: 'Japan'
}

const favouriteslData = {
  color: 'Turquoise',
  food: 'Mango',
  drink: 'Sorrel juice',
  music: 'Amapiano'
}

const randomData = {
  year: '1984',
  leader: 'Margaret Hilda Thatcher',
  sky: 'Dusky Grey',
  population: '4.767 billion'
}

// On refresh, populate the fields with the last inputs
const savedFormInputs = Object.entries(el).filter(([key]) => !replenishFilter.includes(key))

for (const [_, inputEl] of savedFormInputs) { // eslint-disable-line
  const inputElParentElement = inputEl.parentElement
  const category = inputElParentElement.tagName === 'SPAN' ? inputElParentElement.parentElement : inputElParentElement

  const categoryStore = db64.use('db64_Example', category.id)

  const inputValue = await categoryStore.get(inputEl.id)
  inputEl.value = inputValue === undefined ? empty : inputValue
}


document.addEventListener('click', e => {
  const { target } = e

  switch (target) {
    case el.refresh:
    case el.clear:
    case el.populate:
      e.preventDefault()
      break
  }
})
document.addEventListener('mousedown', async ({ target }) => {
  if (el.refresh === target) {
    location.reload()
    return
  }

  if (el.clear === target) {
    console.log('clear')
    await db64.clear('db64_Example', 'personal')
    await db64.clear('db64_Example', 'favourites')
    await db64.clear('db64_Example', 'random')
    await db64.clear('db64_Example', 'platform')
    location.reload()
    return
  }

  if (el.populate === target) {
    // Personal
    const personalStore = db64.use('db64_Example', 'personal')
    for (const [key, value] of Object.entries(personalData)) el[key].value = value
    await personalStore.setEntries(personalData)

    // Favourites
    const favouritesStore = db64.use('db64_Example', 'favourites')
    for (const [key, value] of Object.entries(favouriteslData)) el[key].value = value
    await favouritesStore.setEntries(favouriteslData)

    // Random
    const randomStore = db64.use('db64_Example', 'random')
    for (const [key, value] of Object.entries(randomData)) el[key].value = value
    await randomStore.setEntries(randomData)
  }
})

document.addEventListener('input', async ({ target }) => {
  const categoryId = target.parentElement.id
  const categoryStore = db64.use('db64_Example', categoryId)

  await categoryStore.set(target.id, target.value)
}, true)


const { browser, os } = detectPlatform()
const { language } = navigator
const time = new Date()

const platformStore = db64.use('db64_Example', 'platform')

// Last platform data
el['last-language'].value = await platformStore.get('language') || 'N/A'
el['last-time'].value = await platformStore.get('time') || 'N/A'

// Set platform data in IndexedDB
await platformStore.set('language', language)
await platformStore.set('time', time)

// Update current platfrom data
el.browser.value = browser
el.os.value = os
el.language.value = language
el.time.value = time
