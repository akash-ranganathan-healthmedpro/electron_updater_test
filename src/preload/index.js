import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  checkForUpdates: () => ipcRenderer.invoke('app/check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('app/quit-and-install'),
  onUpdateStatus: (callback) => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('update/status', listener)
    return () => ipcRenderer.removeListener('update/status', listener)
  },
  onUpdateProgress: (callback) => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('update/progress', listener)
    return () => ipcRenderer.removeListener('update/progress', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
