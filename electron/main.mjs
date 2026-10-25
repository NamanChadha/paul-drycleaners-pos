import { app, BrowserWindow, dialog, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPosServer } from '../server.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

let server
let mainWindow

async function startLocalServer() {
  const distDir = join(app.getAppPath(), 'dist')
  const dataDir = join(app.getPath('userData'), 'data')
  server = createPosServer({ distDir, dataDir })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Could not start the local POS server.')
  return `http://127.0.0.1:${address.port}`
}

function createWindow(url) {
  // Resolve icon — works both in dev and when packaged
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'app', 'build', 'icon.png')
    : join(__dirname, '..', 'build', 'icon.png')

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'Paul Drycleaners POS',
    icon: iconPath,
    backgroundColor: '#f7f4ef',
    autoHideMenuBar: true,  // hides the File/Edit/View menu bar; press Alt to show
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.maximize()
  mainWindow.loadURL(url)

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith('https:')) void shell.openExternal(targetUrl)
    return { action: 'deny' }
  })
}

function setUpUpdates() {
  if (!app.isPackaged) return
  autoUpdater.on('update-downloaded', () => {
    const response = dialog.showMessageBoxSync(mainWindow, {
      type: 'info',
      buttons: ['Install and restart', 'Later'],
      defaultId: 0,
      message: 'An update is ready to install.',
    })
    if (response === 0) autoUpdater.quitAndInstall()
  })
  autoUpdater.checkForUpdatesAndNotify().catch(() => undefined)
}

app.whenReady().then(async () => {
  try {
    createWindow(await startLocalServer())
    setUpUpdates()
  } catch (error) {
    dialog.showErrorBox('Unable to start Paul Drycleaners POS', error instanceof Error ? error.message : String(error))
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => server?.close())
