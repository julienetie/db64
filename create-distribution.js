import fs from 'fs/promises'
import path, { dirname } from 'path'
import { minify } from "terser";


const currentFilePath = (new URL(import.meta.url)).pathname
const __dirname = dirname(currentFilePath)

const paths = {
  source: path.join(__dirname, './src/db64.js'),
  cjsDist: path.join(__dirname, './dist/db64.cjs'),
  esDist: path.join(__dirname, './dist/db64.js'),
  esMinDist: path.join(__dirname, './dist/db64.min.js'),
  esMinMapDist: path.join(__dirname, './dist/db64.min.map'),
  cjsMinDist: path.join(__dirname, './dist/db64-cjs.min.js'),
  cjsMinMapDist: path.join(__dirname, './dist/db64-cjs.min.map'),
}


const createCJS = async () => {
  try {
    const data = await fs.readFile(paths.source, 'utf8')
    const insertCJSImport = data.replace(/export default db64/g, 'module.exports = db64')

    const minifiedESData = await minify(data, { sourceMap: true })
    const minifiedCJSData = await minify(insertCJSImport, { sourceMap: true })

    // ES
    await fs.writeFile(paths.esDist, data, 'utf8')
    console.info(`Created ${paths.esDist}`)
    
    // ES Min
    await fs.writeFile(paths.esMinDist, minifiedESData.code, 'utf8')
    console.info(`Created ${paths.esMinDist}`)

    // ES Map
    // await fs.writeFile(paths.esMinMapDist, minifiedESData.map, 'utf8')
    // console.info(`Created ${paths.esMinMapDist}`)

    // CJS
    await fs.writeFile(paths.cjsDist, insertCJSImport, 'utf8')
    console.info(`Created ${paths.cjsDist}`)

    // CJS Min
    await fs.writeFile(paths.cjsMinDist, minifiedCJSData.code, 'utf8')
    console.info(`Created ${paths.cjsMinDist}`)

    // CJS Map
    // await fs.writeFile(paths.cjsMinMapDist, minifiedCJSData.map, 'utf8')
    // console.info(`Created ${paths.cjsMinMapDist}`)

  } catch (err) {
    console.error('Error:', err)
  }
}

createCJS()
