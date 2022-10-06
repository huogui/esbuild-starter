const { build } = require('esbuild')
const httpImport = require('./plugins/html-import-plugin')
const html = require('./plugins/html-plugin')
console.log(html, 8888888888888)
async function runBuild() {
  build({
    absWorkingDir: process.cwd(),
    entryPoints: ['./src/index.jsx'],
    outdir: 'dist',
    bundle: true,
    format: 'esm',
    splitting: true,
    sourcemap: true,
    metafile: true,
    plugins: [httpImport(), html()],
  }).then(() => {
    console.log('🚀 Build Finished!')
  })
}

runBuild()
