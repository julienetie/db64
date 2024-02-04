import fs from 'fs/promises'
import path, { dirname } from 'path'
import { minify } from 'terser'
import { execSync } from 'child_process'
import brotliSize from 'brotli-size'

const name = 'db64'

const currentFilePath = (new URL(import.meta.url)).pathname
const __dirname = dirname(currentFilePath)

const paths = {
  packageJSON: path.join(__dirname, './package.json'),
  readmeSrc: path.join(__dirname, './src/_readme.md'),
  readmeRoot: path.join(__dirname, './README.md'),
  source: path.join(__dirname, `./src/${name}.js`),
  sourceTSdef: path.join(__dirname, `./src/${name}.d.ts`),
  tsDefDist: path.join(__dirname, `./dist/${name}.d.ts`),
  tsDefMapDist: path.join(__dirname, `./dist/${name}.d.ts.map`),
  cjsDist: path.join(__dirname, `./dist/${name}.cjs`),
  esDist: path.join(__dirname, `./dist/${name}.js`),
  esMinDist: path.join(__dirname, `./dist/${name}.min.js`),
  esMinMapDist: path.join(__dirname, `./dist/${name}.min.map`),
  cjsMinDist: path.join(__dirname, `./dist/${name}-cjs.min.js`),
  cjsMinMapDist: path.join(__dirname, `./dist/${name}-cjs.min.map`)
}


const createCJS = async () => {
  try {
    const data = await fs.readFile(paths.source, 'utf8')
    const tsDefData = await fs.readFile(paths.sourceTSdef, 'utf8')
    const readmeSrc = await fs.readFile(paths.readmeSrc, 'utf8')

    const insertCJSImport = data.replace(new RegExp(`export default ${name}`, 'g'), `module.exports = ${name}`)

    const minifiedESData = await minify(data, {
      sourceMap: {
        url: path.basename(paths.esMinMapDist)
      }
    })
    const minifiedCJSData = await minify(insertCJSImport, {
      sourceMap: {
        url: path.basename(paths.cjsMinMapDist)
      }
    })


    /*
    ES */
    await fs.writeFile(paths.esDist, data, 'utf8')
    console.info(`Created ${paths.esDist}`)

    // ES Min
    await fs.writeFile(paths.esMinDist, minifiedESData.code, 'utf8')
    console.info(`Created ${paths.esMinDist}`)

    // ES Map
    await fs.writeFile(paths.esMinMapDist, minifiedESData.map, 'utf8')
    console.info(`Created ${paths.esMinMapDist}`)


    /*
    TS Definitions */
    await fs.writeFile(paths.tsDefDist, tsDefData, 'utf8')
    console.info(`Created ${paths.tsDefDist}`)

    // TS Definitions Map
    const tsc = './node_modules/.bin/tsc'
    execSync(`${tsc} --project tsconfig.json`, { stdio: 'inherit' })
    console.info(`Created ${paths.tsDefMapDist}`)

    /*
    CJS */
    await fs.writeFile(paths.cjsDist, insertCJSImport, 'utf8')
    console.info(`Created ${paths.cjsDist}`)

    // CJS Min
    await fs.writeFile(paths.cjsMinDist, minifiedCJSData.code, 'utf8')
    console.info(`Created ${paths.cjsMinDist}`)

    // CJS Map
    await fs.writeFile(paths.cjsMinMapDist, minifiedCJSData.map, 'utf8')
    console.info(`Created ${paths.cjsMinMapDist}`)

    const stats = await fs.stat(paths.esMinDist)

    // Readme
    const brotliSizeBytes = brotliSize.sync(minifiedESData.code)
    const fileSizeInKB = stats.size / 1024

    const readmeWithSize = readmeSrc
      .replace(/{{ size }}/g, `${fileSizeInKB.toFixed(2)}KB`)
      .replace(/{{ brotliSize }}/g, `${brotliSizeBytes} bytes`)
    await fs.writeFile(paths.readmeRoot, readmeWithSize, 'utf8')
    console.info(`Created ${paths.readmeRoot}`)
  } catch (err) {
    console.error('Error:', err)
  }
}

createCJS()
