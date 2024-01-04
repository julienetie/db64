import fs from 'fs/promises'
import path, { dirname } from 'path'

const currentFilePath = (new URL(import.meta.url)).pathname
const __dirname = dirname(currentFilePath)
const sourceUrl = path.join(__dirname, 'db64.js')
const cjsTarget = path.join(__dirname, 'db64.cjs')

const createCJS = async () => {
  try {
    const data = await fs.readFile(sourceUrl, 'utf8')
    const insertCJSImport = data.replace(/export default db64/g, 'module.exports = db64')

    await fs.writeFile(cjsTarget, insertCJSImport, 'utf8')
    console.info(`Created ${cjsTarget}`)
  } catch (err) {
    console.error('Error:', err)
  }
}

createCJS()
