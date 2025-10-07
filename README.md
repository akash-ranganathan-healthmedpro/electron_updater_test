# electron-app

An Electron application with React featuring production-ready auto-updater functionality.

## ✨ Features

- **Auto-Updater**: Seamless background updates with user-friendly notifications
- **Version Display**: Shows current app version alongside Electron, Chrome, and Node versions
- **Update Notifications**: Beautiful popup notifications for available updates
- **Background Downloads**: Updates download automatically in the background
- **Install on Quit**: Updates install when the user quits the application
- **Progress Tracking**: Real-time download progress indicators

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## 🚀 Auto-Updater Configuration

The application includes a production-ready auto-updater that provides a seamless update experience similar to GitHub Desktop or VS Code.

### How It Works

1. **Automatic Checks**: The app checks for updates on startup and every hour
2. **Background Downloads**: When an update is available, it downloads automatically
3. **User Notifications**: Users see a beautiful popup notification about the update
4. **Install on Quit**: Updates are installed when the user quits the application
5. **Progress Tracking**: Real-time download progress is shown to the user

### Configuration for Production

To enable auto-updates in production, you need to configure the update server. Here are the most common options:

#### Option 1: GitHub Releases (Recommended)

1. **Configure electron-builder.yml**:

```yaml
publish:
  provider: github
  owner: your-username
  repo: your-repo-name
```

2. **Uncomment the feed URL in main/index.js**:

```javascript
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-username',
  repo: 'your-repo'
})
```

3. **Create releases on GitHub** with your built application files

#### Option 2: Custom Update Server

1. **Set up your own update server** that serves `latest.yml` files
2. **Configure the feed URL**:

```javascript
autoUpdater.setFeedURL('https://your-update-server.com/updates')
```

#### Option 3: Generic Server

1. **Configure electron-builder.yml**:

```yaml
publish:
  provider: generic
  url: https://your-server.com/updates/
```

### Building and Publishing

1. **Build your application**:

```bash
npm run build:win  # or build:mac, build:linux
```

2. **Publish the release**:

```bash
npm run build:win -- --publish=always
```

### Update Flow

- **Development**: Auto-updater is disabled
- **Production**: Auto-updater runs automatically
- **Manual Check**: Users can manually check for updates
- **Notifications**: Beautiful popup notifications inform users about updates
- **Background**: Downloads happen silently in the background
- **Installation**: Updates install when the app is quit

### User Experience

- Users see their current app version in the bottom status bar
- Update notifications appear as elegant popups
- Download progress is shown with a progress bar
- Users can choose to "Install Later" or "Restart Now"
- The update installs automatically when the app is closed

This provides a professional, production-ready update experience that users expect from modern desktop applications.
