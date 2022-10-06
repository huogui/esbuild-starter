module.exports = () => ({
  name: 'esbuild:http',
  setup(build) {
    const https = require('https')
    const http = require('http')

    // 拦截间接依赖的路径，并重写路径
    // tip: 间接依赖同样会被自动带上 `http-url`的 namespace
    build.onResolve({ filter: /.*/ }, (args) => {
      console.log(args.importer)
      // 重写路径
      if (args.importer) {
        return {
          path: new URL(args.path, args.importer).toString(),
          namespace: 'http-url',
        }
      }
    })

    // 2. 通过 fetch 请求加载 CDN 资源
    build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
      const contents = await new Promise((resolve, reject) => {
        function fetch(url) {
          console.log(`Downloading: ${url}`)
          const lib = url.startsWith('https') ? https : http
          const req = lib
            .get(url, (res) => {
              if ([301, 302, 307].includes(res.statusCode)) {
                // 重定向
                fetch(new URL(res.headers.location, url).toString())
                req.abort()
              }
              else if (res.statusCode === 200) {
                // 响应成功
                const chunks = []
                res.on('data', chunk => chunks.push(chunk))
                res.on('end', () => resolve(Buffer.concat(chunks)))
              }
              else {
                reject(
                  new Error(`GET ${url} failed: status ${res.statusCode}`),
                )
              }
            })
            .on('error', reject)
        }
        fetch(args.path)
      })
      return { contents }
    })
  },
})
