import db64 from '../../src/db64.js'


const detectPlatform = () => {
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
  const iosPlatforms = ['iPhone', 'iPad', 'iPod']
  let os = null

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS'
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS'
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows'
  } else if (/Android/.test(userAgent)) {
    os = 'Android'
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux'
  }

  return os
}

await db64.create('userData', ['userPreferences'])

const db = db64.use('userData', 'userPreferences')

const storeData = async () => {
  try {
    const keyLocation = prompt('Enter the last place you left your keys:')

    const userData = {
      keyLocation,
      browser: navigator.userAgent,
      operatingSystem: detectPlatform(),
      language: navigator.language
    }

    await db.setEntries(userData)
    alert('Data stored successfully!')
  } catch (error) {
    console.error('Error storing data:', error)
    alert('Failed to store data.')
  }
}

const retrieveData = async () => {
  try {
    const userData = await db.getEntries(['keyLocation', 'browser', 'operatingSystem', 'language'])
    const dataContainer = document.getElementById('data-container')
    dataContainer.textContent = JSON.stringify(userData, null, 2)
  } catch (error) {
    console.error('Error retrieving data:', error)
    alert('Failed to retrieve data.')
  }
}

const clearData = async () => {
  try {
    await db64.clear('userData', 'userPreferences')
    alert('Data cleared successfully!')
  } catch (error) {
    console.error('Error clearing data:', error)
    alert('Failed to clear data.')
  }
}

const storeDataButton = document.getElementById('store-data')
storeDataButton.addEventListener('click', storeData)

const retrieveDataButton = document.getElementById('retrieve-data')
retrieveDataButton.addEventListener('click', retrieveData)

const clearDataButton = document.getElementById('clear-data')
clearDataButton.addEventListener('click', clearData)
