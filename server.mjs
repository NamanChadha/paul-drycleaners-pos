import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = fileURLToPath(new URL('.', import.meta.url))
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
}

const sendJson = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

export function createPosServer({
  distDir = join(appDir, 'dist'),
  dataDir = join(appDir, 'data'),
} = {}) {
  const dataFile = join(dataDir, 'paul-drycleaners-data.json')

  return createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`)
    if (url.pathname === '/api/store') {
      if (request.method === 'GET') {
        if (!existsSync(dataFile)) return sendJson(response, 200, null)
        try { return sendJson(response, 200, JSON.parse(await readFile(dataFile, 'utf8'))) } catch { return sendJson(response, 500, { error: 'Could not read local data file.' }) }
      }
      if (request.method === 'PUT') {
        let body = ''
        for await (const chunk of request) body += chunk
        try {
          const data = JSON.parse(body)
          await mkdir(dataDir, { recursive: true })
          await writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8')
          return sendJson(response, 200, { saved: true })
        } catch { return sendJson(response, 400, { error: 'Invalid data received.' }) }
      }
      if (request.method === 'DELETE') {
        await mkdir(dataDir, { recursive: true })
        await writeFile(dataFile, 'null', 'utf8')
        return sendJson(response, 200, { cleared: true })
      }
      return sendJson(response, 405, { error: 'Method not allowed.' })
    }

    const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname
    const safePath = normalize(requestedPath).replace(/^([/\\])+/, '')
    const filePath = join(distDir, safePath)
    
    let target = join(distDir, 'index.html')
    try {
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        target = filePath
      }
    } catch {
      target = join(distDir, 'index.html')
    }

    try {
      response.writeHead(200, { 'Content-Type': mimeTypes[extname(target)] ?? 'application/octet-stream' })
      response.end(await readFile(target))
    } catch {
      response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('The app has not been built yet. Run npm run build once.')
    }
  } catch (err) {
    console.error('Unhandled request error:', err)
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Internal server error.')
  }
  })
}

export function startPosServer({ port = 4173, host = '127.0.0.1', ...options } = {}) {
  const server = createPosServer(options)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use.`)
    } else {
      console.error('Server error:', err)
    }
  })
  server.listen(port, host, () => console.log(`Paul Drycleaners is ready at http://${host}:${port}`))
  return server
}

if (process.argv[1] === fileURLToPath(import.meta.url)) startPosServer()
