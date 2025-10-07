import { useState, useEffect } from 'react'

function Versions() {
  const [versions] = useState(window.electron.process.versions)
  const [appVersion, setAppVersion] = useState('')
  const [updateStatus, setUpdateStatus] = useState('')

  useEffect(() => {
    // Simple approach: Use build-time environment variable
    // This gets injected during the build process
    const version =
      import.meta.env.VITE_APP_VERSION ||
      window.electron?.process?.env?.npm_package_version ||
      '1.0.7'

    setAppVersion(version)

    // Listen for update status changes
    const removeUpdateStatusListener = window.api?.onUpdateStatus?.((status) => {
      switch (status.status) {
        case 'checking':
          setUpdateStatus('Checking for updates...')
          break
        case 'available':
          setUpdateStatus(`Update available: v${status.info?.version}`)
          break
        case 'downloaded':
          setUpdateStatus('Update downloaded! Will install on next restart.')
          break
        case 'none':
          setUpdateStatus('You have the latest version')
          break
        case 'error':
          setUpdateStatus(`Update error: ${status.error}`)
          break
        default:
          setUpdateStatus('')
      }
    })

    return () => {
      removeUpdateStatusListener?.()
    }
  }, [])

  return (
    <div className="versions-container">
      <ul className="versions">
        <li className="app-version">App v{appVersion}</li>
        <li className="electron-version">Electron v{versions.electron}</li>
        <li className="chrome-version">Chromium v{versions.chrome}</li>
        <li className="node-version">Node v{versions.node}</li>
      </ul>
      {updateStatus && (
        <div className="update-status">
          <span className="update-text">{updateStatus}</span>
        </div>
      )}
    </div>
  )
}

export default Versions
