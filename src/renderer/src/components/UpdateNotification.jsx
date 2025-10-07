import { useState, useEffect } from 'react'

function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    // Listen for update status changes
    const removeUpdateStatusListener = window.api?.onUpdateStatus?.((status) => {
      switch (status.status) {
        case 'available':
          setUpdateInfo(status.info)
          setIsVisible(true)
          break
        case 'downloaded':
          setUpdateInfo(status.info)
          setIsVisible(true)
          break
        case 'none':
        case 'error':
          setIsVisible(false)
          setUpdateInfo(null)
          break
        default:
          break
      }
    })

    // Listen for download progress
    const removeProgressListener = window.api?.onUpdateProgress?.((progress) => {
      setDownloadProgress(Math.round(progress.percent))
    })

    return () => {
      removeUpdateStatusListener?.()
      removeProgressListener?.()
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  const handleRestartNow = async () => {
    try {
      await window.api?.quitAndInstall?.()
    } catch (error) {
      console.error('Failed to restart and install:', error)
    }
  }

  const handleCheckForUpdates = async () => {
    try {
      await window.api?.checkForUpdates?.()
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }

  if (!isVisible || !updateInfo) {
    return null
  }

  const isDownloaded = updateInfo && downloadProgress === 100

  return (
    <div className="update-notification-overlay">
      <div className="update-notification">
        <div className="update-header">
          <h3>🚀 Update Available!</h3>
          <button className="close-btn" onClick={handleDismiss}>
            ×
          </button>
        </div>

        <div className="update-content">
          <p>A new version of the application is available:</p>
          <div className="version-info">
            <span className="current-version">Current: v1.0.6</span>
            <span className="arrow">→</span>
            <span className="new-version">New: v{updateInfo.version}</span>
          </div>

          {updateInfo.releaseNotes && (
            <div className="release-notes">
              <h4>What's New:</h4>
              <div dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes }} />
            </div>
          )}

          {!isDownloaded && downloadProgress > 0 && (
            <div className="download-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${downloadProgress}%` }}></div>
              </div>
              <span className="progress-text">Downloading... {downloadProgress}%</span>
            </div>
          )}

          {isDownloaded && (
            <div className="download-complete">
              <p>✅ Update downloaded successfully!</p>
              <p>The update will be installed when you restart the application.</p>
            </div>
          )}
        </div>

        <div className="update-actions">
          {!isDownloaded ? (
            <button className="btn-secondary" onClick={handleDismiss}>
              Install Later
            </button>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleDismiss}>
                Install on Next Restart
              </button>
              <button className="btn-primary" onClick={handleRestartNow}>
                Restart Now
              </button>
            </>
          )}
        </div>

        <div className="update-footer">
          <button className="link-btn" onClick={handleCheckForUpdates}>
            Check for Updates
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdateNotification
