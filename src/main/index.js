import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  const mainWindow = createWindow()
  setupAutoUpdates(mainWindow)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function setupAutoUpdates(mainWindow) {
  if (is.dev) {
    console.log('Auto-updater disabled in development mode')
    return
  }

  // Configure auto-updater for production experience
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  // Set update server URL (you'll need to configure this for your app)
  // autoUpdater.setFeedURL({
  //   provider: 'github',
  //   owner: 'your-username',
  //   repo: 'your-repo'
  // })

  // Handle manual update checks
  ipcMain.handle('app/check-for-updates', async () => {
    try {
      console.log('Checking for updates...')
      const result = await autoUpdater.checkForUpdates()
      return { status: 'checking', updateInfo: result?.updateInfo }
    } catch (error) {
      console.error('Error checking for updates:', error)
      mainWindow.webContents.send('update/status', { status: 'error', error: String(error) })
      return { status: 'error', error: String(error) }
    }
  })

  // Handle quit and install
  ipcMain.handle('app/quit-and-install', () => {
    console.log('Quitting and installing update...')
    autoUpdater.quitAndInstall()
  })

  // Event handlers for auto-updater
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...')
    mainWindow.webContents.send('update/status', { status: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version)
    mainWindow.webContents.send('update/status', { status: 'available', info })
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('No update available. Current version is latest.')
    mainWindow.webContents.send('update/status', { status: 'none', info })
  })

  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error)
    mainWindow.webContents.send('update/status', { status: 'error', error: String(error) })
  })

  autoUpdater.on('download-progress', (progress) => {
    console.log(`Download progress: ${progress.percent}%`)
    mainWindow.webContents.send('update/progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded successfully:', info.version)
    mainWindow.webContents.send('update/status', { status: 'downloaded', info })
  })

  // Check for updates on app start (with delay to ensure window is ready)
  setTimeout(() => {
    console.log('Checking for updates on startup...')
    autoUpdater.checkForUpdates().catch((error) => {
      console.error('Failed to check for updates on startup:', error)
      mainWindow.webContents.send('update/status', { status: 'error', error: String(error) })
    })
  }, 5000) // Increased delay to 5 seconds

  // Check for updates every hour
  setInterval(
    () => {
      console.log('Periodic update check...')
      autoUpdater.checkForUpdates().catch((error) => {
        console.error('Periodic update check failed:', error)
      })
    },
    60 * 60 * 1000
  ) // 1 hour
}
